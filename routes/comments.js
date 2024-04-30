const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/user');
const {
  createComment,
  updateComment,
  deleteComment,
  getComment,
  updateCampgroundRating,
} = require('../controllers/comments');

// Comment routes
router.route('/:id').post(protect, createComment, updateCampgroundRating)
router.route("/:id").get(getComment)
router.route("/:id/comment/:commentId")
  .delete(protect, deleteComment)
  .put(protect, updateComment)

module.exports = router;