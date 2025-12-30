/**
 * Article Enhancement Script (Phase 2)
 *
 * This script enhances articles by:
 * 1. Fetching non-updated articles from the API
 * 2. Searching Google for each article title
 * 3. Scraping content from top 2 search results
 * 4. Using OpenAI to rewrite the article with better formatting and tone
 * 5. Adding citations to reference articles
 * 6. Updating articles via the CRUD API
 *
 * Environment Variables Required:
 * - OPENAI_API_KEY: For LLM content enhancement
 * - SERPER_API_KEY: For Google search functionality
 * - API_BASE: Base URL for the article CRUD API
 */

require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const OpenAI = require("openai");

const API = process.env.API_BASE;

async function googleSearch(query) {
  try {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const res = await axios.post(
      "https://google.serper.dev/search",
      { q: query + " blog article" }, // Improve search results
      {
        headers: { "X-API-KEY": process.env.SERPER_API_KEY },
        timeout: 10000
      }
    );
    const organic = res.data.organic || [];
    // Filter for blog/article links, exclude social media, etc.
    const filtered = organic
      .filter(r => r.link && !r.link.includes('facebook.com') && !r.link.includes('twitter.com') && !r.link.includes('youtube.com'))
      .slice(0, 2)
      .map(r => r.link);
    return filtered;
  } catch (error) {
    console.error("Google search failed:", error.message);
    return [];
  }
}

async function scrapeContent(url) {
  try {
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);

    // Try multiple selectors for better content extraction
    let content = '';
    const selectors = ['article p', '.post-content p', '.entry-content p', '.content p', 'p'];

    for (const selector of selectors) {
      const paragraphs = $(selector).map((i, el) => $(el).text().trim()).get();
      if (paragraphs.length > 0) {
        content = paragraphs.join(' ').substring(0, 2000); // Limit content length
        break;
      }
    }

    return content || "No content found";
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error.message);
    return "Scraping failed";
  }
}

async function rewrite(original, ref1, ref2, links) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `
Rewrite and enhance the following article to match the professional tone, structure, and formatting of top-ranking blog articles. Make it more engaging, informative, and SEO-friendly while maintaining the core information.

Guidelines:
- Keep the main topic and key points from the original
- Improve readability with better paragraph structure
- Add relevant subheadings if appropriate
- Make it more comprehensive but concise
- Use professional language
- End with proper citations to the reference articles

Original Article:
${original}

Reference Article 1 (for style and tone):
${ref1.substring(0, 1500)}

Reference Article 2 (for style and tone):
${ref2.substring(0, 1500)}

Reference Links:
1. ${links[0]}
2. ${links[1]}

Please provide the rewritten article with citations at the end.
`
      }],
      max_tokens: 2000
    });

    let rewritten = completion.choices[0].message.content;

    // Add citations if not already included
    if (!rewritten.includes('References') && !rewritten.includes('Citations')) {
      rewritten += '\n\nReferences:\n1. ' + links[0] + '\n2. ' + links[1];
    }

    return rewritten;
  } catch (error) {
    console.error("OpenAI rewrite failed:", error.message);
    return original; // Return original if rewrite fails
  }
}

/**
 * Updates articles by enhancing them with external references and AI rewriting.
 * This function can be called from an API endpoint to run the process asynchronously.
 *
 * @returns {Promise<void>} Resolves when the update process completes
 */
async function updateArticles() {
  try {
    console.log("Starting article update process...");

    const { data } = await axios.get(`${API}/articles`, { timeout: 10000 });
    const articlesToUpdate = data.articles.filter(a => !a.isUpdated);

    console.log(`Found ${articlesToUpdate.length} articles to update.`);

    if (articlesToUpdate.length === 0) {
      console.log("No articles to update.");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < articlesToUpdate.length; i++) {
      const art = articlesToUpdate[i];

      try {
        console.log(`[${i + 1}/${articlesToUpdate.length}] Processing: ${art.title}`);

        const links = await googleSearch(art.title);
        if (links.length < 2) {
          console.log(`Not enough search results for "${art.title}", skipping.`);
          failCount++;
          continue;
        }

        console.log(`Found references: ${links[0]}, ${links[1]}`);

        const ref1 = await scrapeContent(links[0]);
        const ref2 = await scrapeContent(links[1]);

        if (ref1 === "Scraping failed" || ref2 === "Scraping failed") {
          console.log(`Failed to scrape references for "${art.title}", skipping.`);
          failCount++;
          continue;
        }

        const updated = await rewrite(art.originalContent, ref1, ref2, links);

        await axios.put(`${API}/articles/${art._id}`, {
          updatedContent: updated,
          references: links,
          isUpdated: true
        }, { timeout: 10000 });

        console.log(`✓ Successfully updated: ${art.title}`);
        successCount++;

        // Add delay between articles to avoid overwhelming APIs
        if (i < articlesToUpdate.length - 1) {
          console.log("Waiting 5 seconds before next article...");
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

      } catch (error) {
        console.error(`✗ Failed to update "${art.title}":`, error.message);
        failCount++;
      }
    }

    console.log(`\nProcess completed. Success: ${successCount}, Failed: ${failCount}`);

  } catch (error) {
    console.error("Update articles process failed:", error.message);
    throw error; // Re-throw to allow caller to handle
  }
}

module.exports = { updateArticles };