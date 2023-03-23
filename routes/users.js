var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

var controllers=require('../controllers/user-controllers');

const cloudinary = require('../utils/cloudinary');
const multer = require('../utils/multer');
const authUser = require('../middlewares/user-middlleware');


router.get('/',controllers.userGet);

router.get('/login',controllers.userLogin);

router.post('/login',controllers.userLoginPost);


router.get('/signup',controllers.userSignup);

router.post('/signup',controllers.userSignupPost);


router.get('/logout',controllers.userLogout);


router.get('/userprofile/:id', authUser.verifyLogin, controllers.userProfile);

router.get('/user-orders', authUser.verifyLogin, controllers.userOrders);

router.get('/view-order-products/:id', authUser.verifyLogin, controllers.viewOrderProducts);

router.get('/user-address', authUser.verifyLogin, controllers.userAddress);

router.get('/user-add-address', authUser.verifyLogin, controllers.userAddAddress);

router.post('/user-add-address', authUser.verifyLogin, controllers.addAddress);


router.get('/shop-view', authUser.verifyLogin, controllers.userShop);


router.get('/filter-category/:id', authUser.verifyLogin, controllers.filterCategories);

router.post('/filter-category', authUser.verifyLogin, controllers.filterCategory);


router.get('/product-view/:id', authUser.verifyLogin, controllers.userProductView); 


router.get('/usercart', authUser.verifyLogin, controllers.userCart);

router.get('/cart/:id', authUser.verifyLogin, controllers.cartView);

router.post('/change-product-quantity', authUser.verifyLogin, controllers.changeProductQuantity);

router.post('/remove-cart-product', authUser.verifyLogin, controllers.removeCartProduct);


router.get('/wishlist', authUser.verifyLogin, controllers.getWishlist);

router.get('/addToWishlist/:id', authUser.verifyLogin, controllers.addToWishlist);

router.post('/remove-wishlist-product', authUser.verifyLogin, controllers.removeWishlistProduct);



router.get('/checkout', authUser.verifyLogin, controllers.getTotalAmount);

router.post('/checkout', authUser.verifyLogin, controllers. checkOut); 

router.get('/thank-you', authUser.verifyLogin, controllers.thankYou);  


router.get('/fabric-view', authUser.verifyLogin, controllers.fabricView);


router.get('/about-us', authUser.verifyLogin, controllers.aboutUs);

// router.get('/new-location', function(req, res) {
//   res.render('new-address-form');
// });

// app.post('/new-location', function(req, res) {
//   // Save new address to database
//   // Construct HTML for new address using Handlebars
//   var newAddressHtml = ...;

//   res.send(newAddressHtml);
// });



module.exports = router;
