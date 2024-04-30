const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a tag's name"],
    unique: true,
  },
});

// //Reverse populate with virtuals
// TagSchema.virtual("campgrounds", {
//   ref: "Campground",
//   localField: "_id",
//   foreignField: "Tags",
//   justOne: false,
// });

// TagSchema.pre(
//   "deleteOne",
//   { document: true, query: false },
//   async function (next) {
//     console.log(`tag: ${this._id} being removed from other campground`);
//     await this.model("Campground").deleteMany({ tag: this._id });
//     next();
//   }
// );

TagSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    const tagId = this._id;
    
    const campgrounds = await mongoose.model("Campground").find({ tags: tagId });

    await Promise.all(campgrounds.map(async campground => {
      const index = campground.tags.indexOf(tagId);
      if (index !== -1) {
        campground.tags.splice(index, 1);
        await campground.save();
      }
    }));

    next();
  } catch (error) {
    next(error);
  }
});


module.exports = mongoose.model("Tag", TagSchema);
