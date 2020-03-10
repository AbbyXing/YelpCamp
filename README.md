# YelpCamp

* Add Landing Page
* Add Campground Page that lists all campgrounds

# Each Campground Has:
* Name: String
* Image(URL): String

# Layout and Basic Styling
* Create our header and footer partials
* Add in Bootstrap

# Creating New Campgrounds
* Setup new campground POST route
* Add in body-parser
* Setup route to show form
* Add basic unstyled from

# Style the Campground Page
* Add a better header/title
* Make campgrounds display in a grid

# Style the Navbar and From
* Add a navbar to all templates
* Style the new campground from

# Add Mongoose
* Install and configure mongoose
* Setup campground model
* Use campground model inside our routes!

# Show Page
* Review the RESTful routes we've seen so far
* Add description to our campground model
* Show db.collection.drop() - delete all data in DB(collection = 'campground')
* Add a show route/template

# Refactor Mongoose Code
* Create a model directory
* Use module.exports
* Require everything correctly!

# Add Seed Files
* Add a seed.js file
* Run the seed file every time the server starts

# Add The Comment Model
* Display comments on campground show page

# Comment New/Create
* Nested route
* Add the new comment and creates routes
* Add the new comment form

# Style Show Page
* Add sidebar to show page
* Display comments nicely

# Add User Model
* Install all packages needed for auth
* Define user model

# Register
* Configure passport
* Add register routes
* Add register template

# Login
* Add login routes
* Add login template

# Logout/Navbar
* Add logout route
* prevent user from adding a comment if not signed in
* Add links to navbar
* Show/hide auth links correctly

# Refactor The Routes
* Use express.Router() to recognize all routes

# Users + Comments
* Associate users and comments
* Save author's name to a comment automatically

# Users + Campgrounds
* Preventing an unauthenticcted user from creating a new campground
* Save username+id to newly created campground

# Editing Campgrounds
* Add method-override
* Add edit route for campgrounds
* Add link to edit page
* Add Update route
* Fix $set problem

# Deleting Campgrounds
* Add destroy route
* Add delete button

# Authorization Part 1: Campgrounds
* User can only edit his/her campgrounds
* User can only delete his/her campgrounds
* Hide/show edit and delet buttons

# Editing Comments
* Add edit route for comment
* Add edit button
* Add update route

# Deleting Comments
* Add destroy route
* Add delete button

# Authorization Part 2: Comments
* User can only edit his/her comments
* User can only delete his/her comments
* Hide/show edit and delet buttons
* Refactor middleware

# Adding In Flash And UI Improvement
* Add error and success flash
* refactor middleware
* improve landing page
* Add price to campground