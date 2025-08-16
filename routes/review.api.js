const express = require('express');
const authController = require('../controllers/auth.controller');
const reviewController = require('../controllers/review.controller');
const router = express.Router();

router.post("/:id", authController.authenticate, reviewController.createReview)
router.get("/:id", reviewController.getReviews)
router.put("/:id", authController.authenticate, reviewController.updateReview)
router.delete("/:id", authController.authenticate, reviewController.deleteReview)

module.exports = router;