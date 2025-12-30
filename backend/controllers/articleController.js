const Article = require("../models/Article");
const { updateArticles } = require("../../scripts/updateArticles");

// Input validation helper
const validateArticleData = (data) => {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }

  if (!data.originalContent || typeof data.originalContent !== 'string' || data.originalContent.trim().length === 0) {
    errors.push('Original content is required and must be a non-empty string');
  }

  if (data.sourceUrl && typeof data.sourceUrl !== 'string') {
    errors.push('Source URL must be a string');
  }

  if (data.references && !Array.isArray(data.references)) {
    errors.push('References must be an array');
  }

  return errors;
};

// Sanitize input
const sanitizeArticleData = (data) => {
  const sanitized = { ...data };

  if (sanitized.title) sanitized.title = sanitized.title.trim();
  if (sanitized.originalContent) sanitized.originalContent = sanitized.originalContent.trim();
  if (sanitized.updatedContent) sanitized.updatedContent = sanitized.updatedContent.trim();
  if (sanitized.sourceUrl) sanitized.sourceUrl = sanitized.sourceUrl.trim();

  return sanitized;
};

exports.createArticle = async (req, res) => {
  try {
    const sanitizedData = sanitizeArticleData(req.body);
    const validationErrors = validateArticleData(sanitizedData);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const article = await Article.create(sanitizedData);
    res.status(201).json({
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const isUpdated = req.query.isUpdated;

    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { originalContent: { $regex: search, $options: 'i' } },
        { updatedContent: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by update status
    if (isUpdated !== undefined) {
      query.isUpdated = isUpdated === 'true';
    }

    const skip = (page - 1) * limit;

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArticles: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const sanitizedData = sanitizeArticleData(req.body);

    // For updates, we don't require all fields to be present
    const allowedFields = ['title', 'originalContent', 'updatedContent', 'references', 'sourceUrl', 'isUpdated'];
    const updateData = {};

    for (const field of allowedFields) {
      if (sanitizedData[field] !== undefined) {
        updateData[field] = sanitizedData[field];
      }
    }

    // Validate references if provided
    if (updateData.references && !Array.isArray(updateData.references)) {
      return res.status(400).json({ message: 'References must be an array' });
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    console.error('Update article error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', errors: Object.values(error.errors).map(e => e.message) });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateArticles = async (req, res) => {
  try {
    // Optional API key protection
    const apiKey = req.headers['x-api-key'];
    if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
      return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
    }

    // Start the update process asynchronously (non-blocking)
    updateArticles().catch(error => {
      console.error('Background update articles failed:', error);
    });

    // Return success immediately
    res.json({
      message: 'Article update process started successfully',
      status: 'processing'
    });
  } catch (error) {
    console.error('Start update articles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
