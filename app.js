require('dotenv').config();
var express 	= require('express'),
	app 		= express(),
    bodyParser  = require('body-parser'),
	mongoose 	= require('mongoose'),
	flash		= require('connect-flash'),
	passport	= require('passport'),
	LocalStrategy = require('passport-local'),
	session		= require('express-session'),
	methodOverride = require('method-override'),
	Campground	= require('./models/campground'),
	Comment		= require('./models/comment'),
	User		= require('./models/user'),
	seedDB		= require('./seed');

// requiring routes
var campgroundRoutes = require('./routes/campgrounds'),
	commentRoutes = require('./routes/comments'),
	reviewRoutes     = require('./routes/reviews'),
	indexRoutes = require('./routes/index');
	

// mongoose.connect('mongodb+srv://AbbyXing:Asdf1234@cluster0-k6emz.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true}).then(() => {
// 	console.log('connected to DB!!!');
// }).catch(err => {
// 	console.log('Error:', err.message);
// });
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true}).then(() => {
	console.log('connected to DB!!!');
}).catch(err => {
	console.log('Error:', err.message);
});
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());
app.set('view engine', 'ejs');

//seedDB();

// require moment
app.locals.moment = require('moment'),

// 	PASSPORT CONFIGURATION
app.use(session({
	secret: 'The YelpCamp is the best rating app for campgrounds!',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.listen(process.env.PORT || 3000, function() {
	console.log('The YelpCamp Server has started!');
});