const router = require("express").Router();
const ctrl = require("../controllers/articleController");

router.post("/", ctrl.createArticle);
router.get("/", ctrl.getArticles);
router.get("/:id", ctrl.getArticleById);
router.put("/:id", ctrl.updateArticle);
router.delete("/:id", ctrl.deleteArticle);
router.post("/update-articles", ctrl.updateArticles);

module.exports = router;
