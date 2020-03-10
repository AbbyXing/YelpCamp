var express = require('express'),
	router = express.Router({mergeParams: true});
var Campground = require('../models/campground'),
	Comment = require('../models/comment');
var middleware = require('../middleware'); // automatically take 'index.js' in the directory

// NEW COMMENT - show new comment form
router.get('/new', middleware.isLoggedIn, function(req, res) {
	// find the campground by id
	Campground.findById(req.params.id, function(err, campground) {
		if(err) return console.error(err);
		res.render('comments/new', {campground: campground});
	});
});

// CREATE COMMENT - add comment to DB
router.post('/', middleware.isLoggedIn, function(req, res) {
	// look up campground using id
	Campground.findById(req.params.id, function(err, campground) {
		if(err) {
			console.error(err);
			res.redirect('/campgrounds');
		} else {
			// create new comment
			Comment.create(req.body.comment, function(err, newComment) {
				if(err) {
					req.flash('error', 'Something went wrong');
				}
				// add username and userid to comment
				newComment.author.id = req.user._id;
				newComment.author.username = req.user.username;
				// save comment
				newComment.save();
				// connect new comment to campground
				campground.comments.push(newComment);
                campground.save();
				// redirect to campground show page
				req.flash('success', 'Successfully added comment!');
				res.redirect('/campgrounds/' + campground._id);
			});
		}
	});
});

// EDIT ROUTE - show edit form
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if(err) {
			req.flash('error', 'Campground not found');
			res.redirect('back');
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				req.flash('error', 'Comment not found');
				res.redirect("back");
			}
		    res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
		});
	});
});

// UPDATE ROUTE
router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
		if(err) return res.redirect('back');
		res.redirect('/campgrounds/' + req.params.id);
	});
});

//DESTROY ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect('back');
       } else {
		   Campground.findById(req.params.id, function(err, foundCampground) {
			   if(err) return res.redirect('back');
			   foundCampground.comments = removeByValue(foundCampground.comments, req.params.comment_id);
			   foundCampground.save();
		   });
		   req.flash('success', "Comment deleted!");
		   res.redirect("/campgrounds/" + req.params.id);
	   }
    });
});



// remove element by value
function removeByValue(arr, v) {
	for( var i = 0; i < arr.length; i++){ 
	    if (arr[i].toHexString() === v) {
			arr.splice(i, 1); 
	    }
	}
	return arr;
}

module.exports = router;

