var express = require('express');

var router = express.Router();

const productHelpers = require('../helpers/product-helpers');

const orderHelpers = require('../helpers/order-helpers');

const upload = require('../utils/multer');

const cloudinary = require('cloudinary');

const authAdmin = require('../middlewares/admin-middleware');

var controllers=require('../controllers/admin-controllers');


/* GET home page. */
router.get('/login',controllers.adminLogin);

router.post('/login', controllers.adminLoginPost);

router.get('/logout',controllers.adminLogout);

router.get('/',authAdmin.verifyLogin,controllers.adminView);

router.get('/sales-report',authAdmin.verifyLogin,controllers.salesReport);

router.post('/sales-report',authAdmin.verifyLogin,controllers.filterByDate)

router.get('/filter-sales',authAdmin.verifyLogin,controllers.filterByDate)


router.get('/user-management', authAdmin.verifyLogin, controllers.userManagement);

router.get('/add-user', authAdmin.verifyLogin, controllers.addUser);

router.post('/add-user', authAdmin.verifyLogin, controllers.addUserPost);

router.get('/blockUser/:id', authAdmin.verifyLogin, controllers.blockUser);

router.get('/unblockUser/:id', authAdmin.verifyLogin, controllers.unblockUser);



router.get('/product-management',  authAdmin.verifyLogin, controllers.productManagement);

router.get('/add-product',  authAdmin.verifyLogin, controllers.addProduct);

router.post('/add-product', authAdmin.verifyLogin,  upload.array('image'),controllers.addProductPost);

router.get('/edit-product/:id', authAdmin.verifyLogin, controllers.editProduct);

router.post('/edit-product/:id', authAdmin.verifyLogin, upload.array('image'),controllers.editProductPost);

router.get('/unlistProduct/:id', authAdmin.verifyLogin, controllers.unlistProduct);

router.get('/listProduct/:id', authAdmin.verifyLogin, controllers.listProduct);



router.get('/category-management', authAdmin.verifyLogin, controllers.categoryManagement);

router.get('/add-category', authAdmin.verifyLogin, controllers.addCategory);

router.post('/add-category', authAdmin.verifyLogin, controllers.addCategoryPost);

router.get('/edit-category/:id', authAdmin.verifyLogin, controllers.editCategory);

router.post('/edit-category/:id', authAdmin.verifyLogin, controllers.editCategoryPost);

router.get('/listCategory/:id', authAdmin.verifyLogin, controllers.listCategory);

router.get('/unlistCategory/:id', authAdmin.verifyLogin, controllers.unlistCategory);



router.get('/order-management', authAdmin.verifyLogin, controllers.orderManagement);

router.get('/view-order-details/:id', authAdmin.verifyLogin, controllers.viewOrderDetails);

router.get('/shipOrder/:id', authAdmin.verifyLogin, controllers.shipOrder);

router.get('/deliverOrder/:id', authAdmin.verifyLogin, controllers.deliverOrder);

router.get('/returnAcceptOrder/:id', authAdmin.verifyLogin, controllers.returnAcceptOrder);

router.get('/cancelOrder/:id', authAdmin.verifyLogin, controllers.cancelOrder);

router.get('/banner-management', authAdmin.verifyLogin, controllers.bannerManagement);

router.get('/add-banner',  authAdmin.verifyLogin, controllers.addBanner);

router.post('/add-banner', authAdmin.verifyLogin, upload.single('image'),controllers.addBannerPost);

router.get('/activate-banner/:id', authAdmin.verifyLogin, controllers.activateBanner);

router.get('/edit-banner/:id', authAdmin.verifyLogin, controllers.editBanner);

router.post('/edit-banner/:id', authAdmin.verifyLogin, upload.single('image'),controllers.editBannerPost);

router.get('/delete-banner/:id', authAdmin.verifyLogin, controllers.deleteBanner);


router.get('/coupon-management', authAdmin.verifyLogin, controllers.couponManagement);

router.get('/add-coupon', authAdmin.verifyLogin, controllers.addCoupon);

router.post('/add-coupon', authAdmin.verifyLogin, controllers.addCouponPost);

router.get('/edit-coupon/:id', authAdmin.verifyLogin, controllers.editCoupon);

router.post('/edit-coupon/:id', authAdmin.verifyLogin, controllers.editCouponPost);

router.get('/delete-coupon/:id', authAdmin.verifyLogin, controllers.deleteCoupon);

router.get('/chart-details',  authAdmin.verifyLogin, controllers.chartDetails)


module.exports = router;
