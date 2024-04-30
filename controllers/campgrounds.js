const Campground = require("../models/Campground");


//@desc Get all campgrounds
//@route GET /api-information/campgrounds
//@access Public
exports.getCampgrounds = async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit", "topProvince"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  console.log(reqQuery);

  // Create operator ($gt, $gte, etc)
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  query = Campground.find(JSON.parse(queryStr)).populate("reservations").populate("tags");

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("name");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  try {
    const total = await Campground.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const campgrounds = await query;

    // Populate tags into two arrays: tagsID and tagsName
    const populatedCampgrounds = campgrounds.map((campground) => {
      const tagsID = campground.tags.map((tag) => tag._id);
      const tagsName = campground.tags.map((tag) => tag.name);
    // Exclude the tags field from the campground object
      const { tags, ...campgroundWithoutTags } = campground.toObject();
      return { ...campgroundWithoutTags, tagsID, tagsName };
    });


    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    // Get top province
    if (req.query.topProvince === 'true') {
      const topProvinces = await Campground.aggregate([
        {
          $group: {
            _id: "$province",
            avgRating: { $avg: "$rating" },
            // count: { $count: {} },
          },
        },
        {
          $sort: { avgRating: -1 },
        },
        {
          $project: {
            _id: 0,
            province: "$_id",
            avgRating: { $round: ["$avgRating", 1] },
            // count: 1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        topProvinces,
      });
    } else {
    res.status(200).json({
      success: true,
      count: populatedCampgrounds.length,
      pagination,
      data: populatedCampgrounds,
    });
  }
  } catch (error) {
    res.status(400).json({ success: false, message: "bad request" });
  }
};


//@desc Get single campgrounds
//@route GET /api-information/campgrounds/:id
//@access Public
exports.getCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(404).json({
        success: false,
        message: `Cannot find campground with id ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: campground });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

//@desc Create single campground
//@route POST /api-information/campgrounds
//@access Private
exports.createCampground = async (req, res, next) => {
  try {
    const campground = await Campground.create(req.body);

    res.status(200).json({ success: true, data: campground });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

//@desc Update campground
//@route PUT /api-information/campgrounds/:id
//@access Private
exports.updateCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!campground) {
      return res.status(404).json({
        success: false,
        message: `Cannot find campground with id ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: campground });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

//@desc Delete campground
//@route DELETE /api-information/campgrounds/:id
//@access Private
exports.deleteCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(404).json({
        success: false,
        message: `Cannot find campground with id ${req.params.id}`,
      });
    }

    await campground.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};