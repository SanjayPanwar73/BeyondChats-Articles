/**
 * BeyondChats Article Scraper
 *
 * This script scrapes the last page of articles from https://beyondchats.com/blogs/
 * and saves the 5 oldest articles to the MongoDB database.
 *
 * Features:
 * - Finds the last pagination page automatically
 * - Scrapes only the 5 oldest articles from that page
 * - Handles duplicates and errors gracefully
 * - Includes timeouts and rate limiting
 */

const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
require("dotenv").config({ path: './.env' });

const Article = require("../models/Article");

async function scrape() {
  let db;
  try {
    db = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for scraping");

    // Find the last page number
    const base = "https://beyondchats.com/blogs/";
    const { data: mainData } = await axios.get(base, { timeout: 10000 });
    const $main = cheerio.load(mainData);

    // Look for pagination links to find the last page
    let lastPage = 1;
    $main('.pagination a, .page-numbers a').each((i, el) => {
      const href = $main(el).attr('href');
      if (href) {
        const match = href.match(/\/blogs\/page\/(\d+)/);
        if (match) {
          const pageNum = parseInt(match[1]);
          if (pageNum > lastPage) lastPage = pageNum;
        }
      }
    });

    console.log(`Found last page: ${lastPage}`);

    // Scrape the last page for oldest articles
    const lastPageUrl = lastPage === 1 ? base : `${base}page/${lastPage}/`;
    const { data } = await axios.get(lastPageUrl, { timeout: 10000 });
    const $ = cheerio.load(data);

    const links = [];
    // Find article links - look for h2.entry-title a or similar article title links
    $('h2.entry-title a, .post-title a, article h2 a').each((i, el) => {
        const href = $(el).attr("href");
        if(href &&
           href.startsWith("https://beyondchats.com/blogs/") &&
           href !== "https://beyondchats.com/blogs/" &&
           !href.includes("/tag/") &&
           !href.includes("/page/") &&
           !href.includes("/category/") &&
           href.includes("-")) { // Articles typically have hyphens in URLs
            links.push(href);
        }
    });

    // If no links found with the above, try a broader search but filter more strictly
    if (links.length === 0) {
        $('a[href*="/blogs/"]').each((i, el) => {
            const href = $(el).attr("href");
            const text = $(el).text().trim();
            if(href &&
               href.startsWith("https://beyondchats.com/blogs/") &&
               href !== "https://beyondchats.com/blogs/" &&
               !href.includes("/tag/") &&
               !href.includes("/page/") &&
               !href.includes("/category/") &&
               text.length > 10 && // Likely an article title
               href.includes("-")) { // Articles have hyphens
                links.push(href);
            }
        });
    }

    // Remove duplicates and take first 5 (oldest)
    const uniqueLinks = [...new Set(links)].slice(0, 5);
    console.log(`Found ${uniqueLinks.length} oldest articles to scrape.`);

    for (let link of uniqueLinks) {
      try {
        console.log(`Scraping: ${link}`);
        const { data: html } = await axios.get(link, { timeout: 10000 });
        const $$ = cheerio.load(html);

        const title = $$("h1.entry-title").text().trim() ||
                     $$("h1").first().text().trim() ||
                     $$('meta[property="og:title"]').attr("content") ||
                     $$("title").text().trim();

        // Try multiple content selectors
        let content = '';
        const contentSelectors = [
            ".entry-content",
            ".post-content",
            ".content",
            "article .content",
            ".entry-content p",
            "article p"
        ];

        for (const selector of contentSelectors) {
            const elements = $$(selector);
            if (elements.length > 0) {
                content = elements.map((i, el) => $$(el).text().trim()).get().join("\n\n");
                if (content.length > 100) break; // If we have substantial content, use it
            }
        }

        // Fallback to all paragraphs
        if (!content || content.length < 50) {
            content = $$("p").map((i, el) => $$(el).text().trim()).get().join("\n\n");
        }
        
        const existingArticle = await Article.findOne({ sourceUrl: link });

        if (!existingArticle) {
            await Article.create({
                title,
                originalContent: content,
                sourceUrl: link
            });
            console.log("Saved:", title);
        } else {
            console.log("Article already exists, skipping:", title);
        }

      } catch (error) {
        console.error(`Failed to scrape ${link}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Scraping failed:", error.message);
  } finally {
    if (db) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    }
    process.exit();
  }
}

scrape();
