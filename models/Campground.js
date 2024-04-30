const mongoose = require("mongoose");
const CampgroundSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlenght: [50, "Name cannot be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    region: {
      type: String,
      required: [true, "Please add a region"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postal code"],
      maxlenght: [5, "Postalcode cannot be more than 5 digits"],
    },
    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
    },
    url: {
      type: String,
      required: [true, "Please add a url"],
    },
    maxReservations: {
      type: Number,
      required: [true, "Please add a max reservation"],
    },
    coverpicture: {
      type: String,
      required: [true, "Please add a cover picture"],
    },
    picture: {
      type: Array,
      required: [true, "Please add a picture"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
    },
    rating: {
      type: Number,
      required: [true, "Please add a rating"],
    },
    comments: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Comment",
        },
      ],
    },
    tags: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Tag",
        },
      ],
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Reverse populate with virtuals
CampgroundSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "campground",
  justOne: false,
});

/*
//Cascade delete reservation when campground delete
CampgroundSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Reservation being removed from campground ${this._id}`);
    await this.model("Reservation").deleteMany({ campground: this._id });
    next();
  }
);
*/

module.exports = mongoose.model("Campground", CampgroundSchema);
