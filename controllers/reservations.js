const Reservation = require('../models/Reservation');
const Campground = require('../models/Campground');

//@desc     Get all reserved
//@route    Get /api-infromations/reserved
//@access   Public
exports.getReservations = async (req,res,next) => {
    let query;

    if(req.user.role !== 'admin') {
        query = Reservation.find({user:req.user.id}).populate({
            path: 'campground',
            select: 'name address district province region postalcode tel url maxReservations coverpicture picture description price rating'
        });
    } else {
        if(req.params.campgroundId) {
            console.log(req.params.campgroundId);
            query = Reservation.find({campground:req.params.campgroundId}).populate({
                path: "campground",
                select: "name address district province region postalcode tel url maxReservations coverpicture picture description price rating",
            });
        } else {
            query = Reservation.find().populate({
                path: 'campground',
                select: 'name address district province region postalcode tel url maxReservations coverpicture picture description price rating'
            });
        }
    }

    try {
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false, 
            message: "Cannot find Reservations"
        });
    }
};

//@desc     Get single reserved
//@route    Get /api-infromations/reservations/:id
//@access   Public
exports.getReservation = async (req,res,next) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'campground',
            select: 'name address district province region postalcode tel url maxReservations coverpicture picture description price rating'
        });

        if(!reservation) {
            return res.status(404).json({success:false, message:`No reservation with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Cannot find reservation"});
    }
};

//@desc     Add reserved
//@route    POST /api-infromations/campgrounds/:campgroundId/reservations
//@access   Private
// exports.addReservation = async (req,res,next) => {
//     try {
//         req.body.campground = req.params.campgroundId;

//         const campground = await Campground.findById(req.params.campgroundId);

//         if(!campground) {
//             return res.status(404).json({success:false, message:`No campground with the id of ${req.params.campgroundId}`});
//         }

//         req.body.user = req.user.id;
//         const existedReservations = await Reservation.find({user:req.user.id});
//         //const totalReservations = await Reservation.find({campground:req.});
        
//         if(existedReservations.length >= 3 && req.user.role !== 'admin') {
//             return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 reservations`});
//         }
//         if (existedReservations.length >= campground.maxReservations) {
//             return res.status(400).json({success: false, error: `The campground with ID ${req.params.campgroundId} is fully booked for today` });
//         }        

//         const reservation = await Reservation.create(req.body);

//         res.status(200).json({
//             //Campground.count,
//             success:true,
//             data: reservation
//         });
        
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({success:false, message: "Cannot create reservation"});
//     }
// };

exports.addReservation = async (req,res,next) => {
    try {
        req.body.campground = req.params.campgroundId;

        const campground = await Campground.findById(req.params.campgroundId);

        if(!campground) {
            return res.status(404).json({success:false, message:`No campground with the id of ${req.params.campgroundId}`});
        }

        // Get all reservations for the campground on the same appointment date
        const existingReservations = await Reservation.find({
            campground: req.params.campgroundId,
            apptDate: req.body.apptDate,
        });

        // Calculate total reservations for the campground on the same appointment date
        const totalReservations = existingReservations.length;

        // Check if the total reservations exceed the campground's maxReservations
        if (totalReservations >= campground.maxReservations) {
            return res.status(400).json({
                success: false,
                message: `The campground with ID ${req.params.campgroundId} is fully booked for ${req.body.apptDate}`,
                alert: true,
            });
        }

        req.body.user = req.user.id;
        const existedReservations = await Reservation.find({user:req.user.id});
        
        if(existedReservations.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 reservations`,
                alert: true,
            });
        }

        const reservation = await Reservation.create(req.body);

        res.status(200).json({
            success:true,
            data: reservation
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message: "Cannot create reservation"});
    }
};



//@desc     Update reserved
//@route    PUT /api-infromations/reservations/:id
//@access   Private
exports.updateReservation = async (req,res,next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if(!reservation) {
            return res.status(404).json({success:false, message:`No reservation with the id of ${req.params.id}`});
        }

        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this reservation`});
        }

        if (req.body.user && req.body.user.toString() !== req.user.id.toString()) {
            return res
              .status(400)
              .json({
                success: false,
                message: "Reservation cannot change to other User",
              });
        }

         // Check if trying to update apptDate to a date when campground is fully booked
        if (req.body.apptDate && req.body.apptDate !== reservation.apptDate.toISOString().split('T')[0]) {
            const existingReservations = await Reservation.find({
                campground: reservation.campground,
                apptDate: req.body.apptDate,
            });
            const totalReservations = existingReservations.length;

            const campground = await Campground.findById(reservation.campground);
            if (totalReservations >= campground.maxReservations) {
                return res.status(400).json({
                    success: false,
                    message: `The campground with ID ${reservation.campground} is fully booked for ${req.body.apptDate}`,
                    alert: true,
                });
            }
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators:true
        });

        res.status(200).json({
            success:true,
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update reservation"});
    }
};

//@desc     Delete reserved
//@route    DELETE /api-infromations/reservations/:id
//@access   Private
exports.deleteReservation = async (req,res,next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if(!reservation) {
            return res.status(404).json({success:false,message:`No reservation with the id of ${req.params.id}`});
        }

        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this reservation`});
        }

        await reservation.deleteOne();

        res.status(200).json({
            success:true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete reservation"});
    }
};

//@desc     Get reserved
//@route    GET /api-infromations/reservations/calendars
//@access   Public
exports.getCalendars = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ["select"];

        // Remove excluded fields from reqQuery
        removeFields.forEach((param) => delete reqQuery[param]);

        // Create operator ($gt, $gte, etc.)
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

        // Finding resource
        query = Reservation.find(JSON.parse(queryStr))
            .populate({
                path: "campground",
                select: "name tel url maxReservations",
            })
            .populate({
                path: "user",
                select: "name email tel"
            });

        // Execute query
        const reservations = await query;

        // Group reservations by appointment date and campground
        const groupedReservations = reservations.reduce((acc, curr) => {
            const date = curr.apptDate.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = {};
            }
            if (!acc[date][curr.campground._id]) {
                acc[date][curr.campground._id] = {
                    _id: curr.campground._id,
                    campground: curr.campground.name,
                    totalBookings: 0,
                    maxReservation: curr.campground.maxReservations,
                    tel: curr.campground.tel,
                    url: curr.campground.url,
                    bookings: [],
                };
            }
            acc[date][curr.campground._id].totalBookings++;

            // Include user information only if logged in as admin
            if (req.user && req.user.role === 'admin') {
                //acc[date][curr.campground._id].bookings = [];
                acc[date][curr.campground._id].bookings.push({
                    user: {
                        _id: curr.user._id,
                        name: curr.user.name,
                        email: curr.user.email,
                        tel: curr.user.tel,
                    },
                });
            }

            return acc;
        }, {});

        // Convert groupedReservations object to array and sort
        const calendars = Object.entries(groupedReservations).map(([date, campgrounds]) => ({
            apptDate: date,
            campgrounds: Object.values(campgrounds),
        }));
        calendars.sort((a, b) => new Date(a.apptDate) - new Date(b.apptDate));

        // Return response with appropriate status code and data
        res.status(200).json({
            success: true,
            count: calendars.length,
            data: calendars,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: "Bad request" });
    }
};

