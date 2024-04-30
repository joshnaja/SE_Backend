const express = require('express');
const {
  getCampgrounds,
  getCampground,
  createCampground,
  updateCampground,
  deleteCampground,
} = require('../controllers/campgrounds');
const reservationRouter = require('./reservations');
const commentRouter = require('./comments');
const router = express.Router();
const { protect, authorize } = require('../middleware/user');

// Re-route into other resource routers
router.use('/:campgroundId/reservations/', reservationRouter);
router.use('/:id/comments', commentRouter); // Use the new comment router

router.route('/').get(getCampgrounds).post(protect, authorize('admin'), createCampground);
router
  .route('/:id')
  .get(getCampground)
  .put(protect, authorize('admin'), updateCampground)
  .delete(protect, authorize('admin'), deleteCampground);

module.exports = router;