const Campground = require("../models/Campground");
const Comment = require('../models/Comment')
const Reservation = require('../models/Reservation')

exports.createComment = async (req, res, next) => {
    try {
  
      if (req.user.role === 'admin') {
        return res.status(400).json({ success: false });
      }
  
      const reservations = await Reservation.find({
        user: req.user.id,
        campground: req.params.id,
      });
  
      const hasPastReservation = reservations.some(reservation => new Date(reservation.apptDate) < new Date());
  
      if (hasPastReservation) {
  
        const comment = await Comment.create(req.body);
  
        if (comment) {
          const updateCampgroundArray = await Campground.findByIdAndUpdate(comment.campground_id, { "$push": { "comments": comment._id } })
        }
      }
      else {
        return res.status(400).json({ success: false, message: "You can only comment on campgrounds you have visited in the past." });
      }
  
    } catch (error) {
      res.status(400).json({ success: false });
    }
  
    next();
  }
  
  exports.updateComment = async (req, res, next) => {
    try {
  
      const comment = await Comment.findById(req.params.commentId);
  
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: `Cannot find comment with id ${req.params.commentId}`,
        });
      }
  
      if (comment.user_id !== req.user.id) {
        return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this comment` });
      }
  
      if (req.user.role == 'admin') {
        return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update any comment` });
      }
  
      const updatedComment = await Comment.findByIdAndUpdate(
        req.params.commentId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
  
      res.status(200).json({ success: true, data: updatedComment });
    } catch (error) {
      res.status(400).json({ success: false });
    }
  }
  
  
  exports.deleteComment = async (req, res, next) => {
    // console.log(req.params.commentId)
    try {
      const comment = await Comment.findById(req.params.commentId);
  
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: `Cannot find comment with id ${req.params.commentId}`,
        });
      }
  
      if (comment.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          message: "You can't delete other comment",
        });
      }
  
      const removeCommentFromCampground = await Campground.findByIdAndUpdate(comment.campground_id, { $pull: { comments: comment._id } })
      await comment.deleteOne();
      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      res.status(400).json({ success: false });
    }
  
  }
  
  exports.getComment = async (req, res, next) => {
    try {
      const campgroundId = req.params.id;
  
      const comments = await Comment.find({ campground_id: campgroundId }).populate({
        path: 'user_id',
        select: 'name',
      });
  
      res.status(200).json({
        success: true,
        count: comments.length,
        data: comments,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ success: false });
    }
  };
  
  
  exports.updateCampgroundRating = async (req, res, next) => {
  
    console.log("OK");
  
    try {
      // Find the campground by ID
      const campground = await Campground.findById(req.params.id);
  
      // Find all comments for the campground
      const comments = await Comment.find({ campground_id: campground._id });
  
      // Calculate the sum of ratings
      const sumOfRatings = comments.reduce((total, comment) => total + comment.user_rating, 0);
  
      // Calculate the average rating
      const averageRating = (sumOfRatings / comments.length).toFixed(1);
  
      // Update the campground's rating
      campground.rating = averageRating;
  
      // Save the updated campground
      await campground.save();
  
      res.json({ message: 'Campground rating updated successfully.', newRating: averageRating });
  
    } catch (error) {
  
      console.error('Error updating campground rating:', error);
      res.status(500).json({ error: 'An error occurred while updating campground rating.' });
  
    }
  
  };