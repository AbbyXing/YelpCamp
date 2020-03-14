var express = require('express'),
	router = express.Router();
var Campground = require('../models/campground'),
	Comment = require('../models/comment'),
	Review = require("../models/review");
var middleware = require('../middleware'); // automatically take 'index.js' in the directory
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'daxtpgi3q', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


/*************************************ROUTES*******************************************/
// INDEX - show all campgrounds
router.get('/', function(req, res) {
	var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
	var noMatch = false;
	if(req.query.search) { // search keyword exists
		//get campgrounds that has keyword from DB
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allCampgrounds) {
			Campground.countDocuments().exec(function (err, count) {
				if(err) {
					req.flash('error',err.message);
					return res.redirect('back');
				}
				if(allCampgrounds.length < 1) { // no campground match
					noMatch = true;
				}
				res.render('campgrounds/index', {
					campgrounds: allCampgrounds, 
					page: 'campgrounds',
					noMatch: noMatch,
					current: pageNumber,
					pages: Math.ceil(count / perPage)
				});
			});
		});	
	} else {
		//get all campgrounds from DB
		Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allCampgrounds) {
			Campground.countDocuments().exec(function (err, count) {
				if(err) {
					req.flash('error',err.message);
					return res.redirect('back');
				}
				res.render('campgrounds/index', {
					campgrounds: allCampgrounds,
					page: 'campgrounds',
					noMatch: noMatch,
					current: pageNumber,
					pages: Math.ceil(count / perPage)
				});
			});
		});	
	}
});

// NEW - show form to create new campground
router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('campgrounds/new');
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
	// get data from form and add to campgrounds array
	geocoder.geocode(req.body.campground.location, function (err, data) { // google map
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		cloudinary.v2.uploader.upload(req.file.path, function(err, result) { // cloudinary-image uploader
			if(err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			// add cloudinary url for the image to the campground object under image property
			req.body.campground.image = result.secure_url;
			// add image's public_id to campground object
			req.body.campground.imageId = result.public_id;
			// add author to campground
			req.body.campground.author = {
				id: req.user._id,
				username: req.user.username
			}
			// Create a new campground and save to DB
			Campground.create(req.body.campground, function(err, campground) {
				if (err) {
					req.flash('error', err.message);
					return res.redirect('back');
				}
				res.redirect('/campgrounds/' + campground.id);
			});
		});
  	});
});

// SHOW - shows more info about one campground
router.get('/:id', function(req, res) {
	// find the campground with provided id
	Campground.findById(req.params.id).populate('comments likes').populate({
		path: 'reviews',
        options: {sort: {createdAt: -1}}
	}).exec(function(err, foundCampground) {
		if(err || !foundCampground) {
			req.flash('error', 'Campground not found.');
			res.render('back');
		}
		// render show template with that campground
		res.render('campgrounds/show', {campground: foundCampground});
	});	
});

// EDIT ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if(err) {
			req.flash('error', 'Campground not found');
			res.redirect('back');
		}
		//render show template with that campground
        res.render("campgrounds/edit", {campground: foundCampground});
	});
});

// UPDATE ROUTE
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'),  function(req, res){
	delete req.body.campground.rating;
	geocoder.geocode(req.body.campground.location, function (err, data) {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;

		Campground.findById(req.params.id, async function(err, campground){
			if(err){
				req.flash("error", err.message);
				res.redirect("back");
			} else {
				if(req.file) {
					try {
						await cloudinary.v2.uploader.destroy(campground.imageId, {invalidate: true});
						var result = await cloudinary.v2.uploader.upload(req.file.path);
						campground.imageId = result.public_id;
						campground.image = result.secure_url;
					} catch(err) {
						req.flash("error", err.message);
						res.redirect("back");
					}
				}
				campground.name = req.body.campground.name;
				campground.description = req.body.campground.description;
				campground.price = req.body.campground.price;
				campground.save();
				req.flash("success","Successfully Updated!");
				res.redirect("/campgrounds/" + campground._id);
			}
		});
	});
});

// DESTROY ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, async function(err, foundCampground) {
		if(err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		try {
			await cloudinary.v2.uploader.destroy(foundCampground.imageId, {invalidate: true});
			// deletes all comments associated with the campground
			Comment.remove({"_id": {$in: foundCampground.comments}}, function(err) {
				if(err) {
					req.flash("error", err.message);
					return res.redirect("back");
				}
				// deletes all reviews associated with the campground
				Review.remove({"_id": {$in: foundCampground.reviews}}, function(err) {
					if(err) {
						req.flash("error", err.message);
						return res.redirect("back");
					}
					foundCampground.remove();
					req.flash('success', 'Campground deleted successfully!');
					res.redirect('/campgrounds');
				});
			});
		} catch(err) {
			if(err) {
				req.flash("error", err.message);
				return res.redirect("back");
			}
		}
	});
});

// Campground Like Route
router.post('/:id/like', middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function (err, foundCampground) {
		if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
		// check if req.user._id exists in foundCampground.likes
		var foundUserLike = foundCampground.likes.some(function (like) {
			return like.equals(req.user._id);
		});
		if(foundUserLike) {
			// user already liked, remove like
			foundCampground.likes.pull(req.user._id);
		} else {
			foundCampground.likes.push(req.user);
		}
		foundCampground.save(function(err) {
			if (err) {
				req.flash("error", err.message);
				return res.redirect("back");
			}
			return res.redirect("/campgrounds/" + foundCampground._id);
		});
	});
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
	

module.exports = router;

