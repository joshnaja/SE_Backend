const mongoose = require("mongoose");
const Campground = require("./Campground");
const CommentSchema = mongoose.Schema(
    {
            campground_id: {
                type: mongoose.Schema.ObjectId,
                ref: "Campground",
                require: true
            },
            user_id: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                require: true
            },
            text: {
              type: String,
              required: false,
            },
            user_rating: {
              type: Number,
              required: true,
              min: 1,
              max: 5
            }
    }
)

//Reverse populate with virtuals
// CampgroundSchema.virtual("comment", {
//     ref: "Comment",
//     localField: "_id",
//     foreignField: "campground_id",
//     justOne: false,
// });

module.exports = mongoose.model("Comment", CommentSchema);