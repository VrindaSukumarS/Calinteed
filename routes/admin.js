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

router.get('/listCategory/:id', authAdmin.verifyLogin, controllers.listCategory);

router.get('/unlistCategory/:id', authAdmin.verifyLogin, controllers.unlistCategory);



router.get('/order-management', authAdmin.verifyLogin, controllers.orderManagement);

router.get('/banner-management', authAdmin.verifyLogin, controllers.bannerManagement);


module.exports = router;
