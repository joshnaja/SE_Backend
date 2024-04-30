// routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllTags,
  addTagToTagList,
  deleteTagFromList,
  addTagToCampground,
  removeTagFromCampground,
  getCampgroundWithMatchandSimilarTag,
  getCampgroundWithMatchandSimilarTag2,
  getAllTagsForCampground
} = require('../controllers/tags');

const { protect, authorize } = require('../middleware/user');

router.route('/').get(getAllTags);
// router.route('/campgrounds/:campgroundId/similar').get(getCampgroundWithMatchandSimilarTag);
router.route('/campgrounds/:campgroundId/similar2').get(getCampgroundWithMatchandSimilarTag2);
router.route('/').post(protect, authorize('admin'), addTagToTagList);
router.route('/:tagId').delete(protect, authorize('admin'), deleteTagFromList);
router.route('/campgrounds/:campgroundId/:tagId').post(protect, authorize('admin'), addTagToCampground);
router.route('/campgrounds/:campgroundId/:tagId').delete(protect, authorize('admin'), removeTagFromCampground);
router.route('/campgrounds/:campgroundId/tags').get(getAllTagsForCampground);

module.exports = router;