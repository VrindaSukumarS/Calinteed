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

router.get('/login-otp',controllers.userLoginOtp);

router.post('/login-otp',controllers.validateUser);

router.post('/verify-otp',controllers.verifyUser);

router.get('/forgot-password',controllers.forgotPassword)

router.post('/forgot-password',controllers.validateUser);

router.post('/verifyforgot-otp',controllers.verifyForgotPasswordUser);

router.get('/reset-password',controllers.resetPassword)

router.post('/reset-password',controllers.resetNewPassword)


router.get('/signup',controllers.userSignup);

router.post('/signup',controllers.userSignupPost);


router.get('/logout',controllers.userLogout);



router.get('/userprofile', authUser.verifyLogin, controllers.userProfile);

router.post('/userprofile', authUser.verifyLogin, controllers.userProfilePost);

router.get('/user-orders', authUser.verifyLogin, controllers.userOrders);

router.get('/view-order-products/:id', authUser.verifyLogin, controllers.viewOrderProducts);

router.get('/cancel-order/:id', authUser.verifyLogin, controllers.cancelOrder);

router.get('/return-request-order/:id', authUser.verifyLogin, controllers.returnRequestOrder);

router.get('/return-order/:id', authUser.verifyLogin, controllers.returnOrder);

// router.get('/pending-order/:id', authUser.verifyLogin, controllers.pendingOrder);

router.get('/user-address/:id', authUser.verifyLogin, controllers.userAddress);

router.post('/user-address/:id', authUser.verifyLogin, controllers.userAddressPost);

router.post('/user-cart-address/:id', authUser.verifyLogin, controllers.userCartAddressPost);

router.get('/user-delete-address/:id', authUser.verifyLogin, controllers.deleteAddress);

router.get('/user-add-address', authUser.verifyLogin, controllers.userAddAddress);

router.post('/user-add-address', authUser.verifyLogin, controllers.addAddress);

router.post('/user-cartadd-address', authUser.verifyLogin, controllers.addCartAddress);

router.get('/change-password', authUser.verifyLogin, controllers.changePassword);

router.post('/change-password', authUser.verifyLogin, controllers.changePasswordPost);

router.post('/continue-password', authUser.verifyLogin, controllers.continuePasswordPost);

router.get('/my-wallet', authUser.verifyLogin, controllers.myWallet);

// router.get('/dec-wallet', authUser.verifyLogin, controllers.decrementWallet);


router.get('/shop-view', authUser.verifyLogin, controllers.userShop);

router.post('/product-search', authUser.verifyLogin, controllers.productSearch);


router.get('/filter-category/:id', authUser.verifyLogin, controllers.filterCategories);

router.post('/filter-category', authUser.verifyLogin, controllers.filterCategory);

router.post('/filter-price', authUser.verifyLogin, controllers.filterPrice);

router.get('/low-high-price', authUser.verifyLogin, controllers.lowHighPrice);

router.get('/high-low-price', authUser.verifyLogin, controllers.highLowPrice);

router.get('/categoryhigh-low-price', authUser.verifyLogin, controllers.categoryHighLowPrice);

router.get('/categorylow-high-price', authUser.verifyLogin, controllers.categoryLowHighPrice);



router.get('/product-view/:id', authUser.verifyLogin, controllers.userProductView); 


router.get('/usercart', authUser.verifyLogin, controllers.userCart);

router.get('/cart/:id', authUser.verifyLogin, controllers.cartView);

router.post('/change-product-quantity', authUser.verifyLogin, controllers.changeProductQuantity);

router.post('/remove-cart-product', authUser.verifyLogin, controllers.removeCartProduct);

router.post('/apply-coupon', authUser.verifyLogin, controllers.applyCoupon);



router.get('/wishlist', authUser.verifyLogin, controllers.getWishlist);

router.get('/addToWishlist/:id', authUser.verifyLogin, controllers.addToWishlist);

router.post('/remove-wishlist-product', authUser.verifyLogin, controllers.removeWishlistProduct);



router.get('/checkout', authUser.verifyLogin, controllers.getTotalAmount);

router.post('/checkout', authUser.verifyLogin, controllers.checkOut); 

router.get('/thank-you', authUser.verifyLogin, controllers.thankYou);  


router.get('/fabric-view', authUser.verifyLogin, controllers.fabricView);


router.get('/about-us', authUser.verifyLogin, controllers.aboutUs);


router.post('/verify-payment', controllers.verifyPayment)


router.get('/filter-priceForCategory', authUser.verifyLogin, controllers.categoryPriceFilter);

module.exports = router;
