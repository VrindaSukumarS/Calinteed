const db = require('../config/connection');

const collection = require('../config/collections');

const userHelpers = require('../helpers/user-helpers');

const orderHelpers = require('../helpers/order-helpers');

const categoryHelpers = require('../helpers/category-helpers');

const bannerHelpers = require('../helpers/banner-helpers');



const upload = require('../utils/multer');

const cloudinary = require('cloudinary');

const productHelpers = require('../helpers/product-helpers');

const { url } = require('../utils/cloudinary');

const { response } = require('../app');

const { resolve } = require('path');

const { rejects } = require('assert');

const objectId = require('mongodb-legacy').ObjectId;


module.exports = {

    adminLogin: (req, res) => {
        try{
            if (req.session.adminLoggedIn) {
                res.redirect('/admin');
            } else {
                res.render('admin/admin-login', { adminLoginErr: req.session.adminLoginErr });
                req.session.adminLoginErr = false;
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    adminLoginPost: async (req, res) => {
        try{
        console.log(`email:  ${req.body.email}`);
        console.log(`password: ${req.body.password}`);
        
        let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ adminEmail: req.body.email });
        if(admin){
            if (req.body.email == admin.adminEmail && req.body.password == admin.adminPassword) {
                req.session.admin = req.body.email;
                req.session.adminLoggedIn = true;
                req.session.adminName = admin.adminName;
                res.redirect('/admin');
            } 
            else{
                req.session.adminLoginErr = "Invalid username or password";
                res.redirect('/admin/login');
            }
        }
        else{
            req.session.adminLoginErr = "Invalid username or password";
                res.redirect('/admin/login');
        }
        }
        catch (err) {
            console.log(err);
        }
    },

    adminLogout: (req, res) => {
        try{
        req.session.adminLoggedIn = false;
        res.redirect('/admin/login');
        }
        catch (err) {
            console.log(err);
        }
    },

    adminView: async(req, res) => {
        try{
        const today = new Date();

        let dailySales=0;
        let weeklySales=0;
        let monthlySales=0;

        let dailyOrders= await orderHelpers.dailySales(today)
        let weeklyOrders= await orderHelpers.weeklySales(today)
        let monthlyOrders= await orderHelpers.monthlySales(today)

        
        for(i=0;i<dailyOrders.length;i++){
            dailySales += dailyOrders[i].totalAmount
        }

        for(i=0;i<weeklyOrders.length;i++){
            weeklySales += weeklyOrders[i].totalAmount
        }

        for(i=0;i<monthlyOrders.length;i++){
            monthlySales += monthlyOrders[i].totalAmount
        }

        
        dailySales = dailySales.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        weeklySales = weeklySales.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        monthlySales = monthlySales.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

        res.render('admin/admin-view', { admin: true,dailyOrders,dailySales,weeklySales,weeklyOrders,monthlyOrders,monthlySales, adminName: req.session.adminName });
    }
    catch (err) {
        console.log(err);
    }
    },

    salesReport: (req, res) => {
        // orderHelpers.getAdminOrders().then((orders) => {
        try{
        orderHelpers.getAllDeliveredOrders().then((orders) => {
            orders.forEach(eachOrder => {
                eachOrder.productCount = eachOrder.products.length;
                // date formatting
                const newDate = new Date(eachOrder.date);
                const year = newDate.getFullYear();
                const month = newDate.getMonth() + 1;
                const day = newDate.getDate();
                const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
                eachOrder.date = formattedDate;
            });
            res.render('admin/sales-report', { admin: true, orders, adminName: req.session.adminName });
        })
        }
        catch (err) {
            console.log(err);
        }
    },


    filterByDate: (req, res) => {
        try{
        let fromDate = new Date(req.body.from_date)
        let toDate = new Date(req.body.to_date)
        
        orderHelpers.filterByDate(fromDate, toDate).then((orders) => {
            orders.forEach(eachorder => {
                eachorder.productCount = eachorder.products.length;
                // date formatting
                const newDate = new Date(eachorder.date);
                const year = newDate.getFullYear();
                const month = newDate.getMonth() + 1;
                const day = newDate.getDate();
                const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
                eachorder.date = formattedDate;
            });
            res.render('admin/sales-report', { admin: true, orders, orders, adminName: req.session.adminName })
            // res.redirect('back')
        })
    }
    catch (err) {
        console.log(err);
    }
    },


    productManagement: (req, res) => {
        try{
        productHelpers.getAllProducts().then((products) => {
            for (let i = 0; i < products.length; i++) {
                products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            }
            res.render('admin/product-management', { admin: true, products, adminName: req.session.adminName });
        })
        }
        catch (err) {
            console.log(err);
        }
    },


    addProduct: (req, res) => {
        try{
        categoryHelpers.getAllCategory().then((categories) => {
            res.render('admin/add-product', { admin: true, categories, adminName: req.session.adminName });
        })
    }
    catch (err) {
        console.log(err);
    }
    },

    addProductPost: async (req, res) => {
        try {
            const imageUrls = []
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imageUrls.push(result.url);
            }
            productHelpers.addProduct(req.body, async (id) => {
                productHelpers.addImage(id, imageUrls).then((response) => {
                })
            })
        }
        catch (err) {
            console.log(err);
        }
        finally {
            res.redirect('/admin/add-product');
        }

    },

    editProduct: async (req, res) => {
        try{
        let product = await productHelpers.getProductDetails(req.params.id);
        categoryHelpers.getAllCategory().then((categories) => {
            res.render('admin/edit-product', { admin: true, categories, product, adminName: req.session.adminName });
        })
    }
    catch (err) {
        console.log(err);
    }
    },


    editProductPost: async (req, res) => {

        try {
            const imageUrls = []
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imageUrls.push(result.url);
                // const updatedProduct = {
                //     name: req.body.name,
                //     code: req.body.code,
                //     description: req.body.description,
                //     price: req.body.price
                // }
            }
            productHelpers.updateProduct(req.params.id, req.body).then(() => {
                if (imageUrls != 0) {
                    productHelpers.addImage(req.params.id, imageUrls).then((response) => {
                    })
                }
            })
        }
        catch (err) {
            console.log(err);
        }
        finally {
            res.redirect('/admin/product-management');
        }

    },

    listProduct: (req, res) => {
        try{
        let productId = req.params.id;
        productHelpers.listProduct(productId).then((response) => {
            res.redirect('/admin/product-management');
        })
        }
        catch (err) {
            console.log(err);
        }
    },

    unlistProduct: (req, res) => {
        try{
        let productId = req.params.id;
        productHelpers.unlistProduct(productId).then((response) => {
            res.redirect('/admin/product-management');
        })
    }
    catch (err) {
            console.log(err);
        }
    },



    userManagement: (req, res) => {
        try{
        userHelpers.getAllUsers().then((users) => {
            res.render('admin/user-management', { admin: true, users, adminName: req.session.adminName });
        })
    }
    catch (err) {
            console.log(err);
        }
    },

    addUser: (req, res) => {
        try{
        res.render('admin/add-user', { admin: true, adminName: req.session.adminName });
        }
        catch (err) {
            console.log(err);
        }
    },

    addUserPost: (req, res) => {
        try{
        req.body.userStatus = true;
        userHelpers.doSignUp(req.body).then((response) => {
            if (response) {
                res.redirect('/admin/user-management')
            }
        })
    }
    catch (err) {
        console.log(err);
    }

    },

    blockUser: (req, res) => {
        try{
        let userId = req.params.id;
        userHelpers.blockUser(userId).then((response) => {
            res.redirect('/admin/user-management');
        })
    }
    catch (err) {
            console.log(err);
        }
    },


    unblockUser: (req, res) => {
        try{
        let userId = req.params.id;
        userHelpers.unblockUser(userId).then((response) => {
            res.redirect('/admin/user-management');
        })
    }
    catch (err) {
        console.log(err);
    }
    },

    orderManagement: (req, res) => {
        try{
        res.render('admin/order-management', { admin: true, adminName: req.session.adminName });
        }
        catch (err) {
            console.log(err);
        }
    },

    categoryManagement: (req, res) => {
        try{
        categoryHelpers.getAllCategory().then((categories) => {
            res.render('admin/category-management', { admin: true, categories, adminName: req.session.adminName });
        })
    }
    catch (err) {
        console.log(err);
    }
    },

    addCategory: (req, res) => {
        try{
        res.render('admin/add-category', { admin: true, adminName: req.session.adminName });
        }
        catch (err) {
            console.log(err);
        }
    },

    addCategoryPost: async (req, res) => {
        try{
        categoryHelpers.addCategory(req.body).then((response) => {
            res.redirect('/admin/add-category')
        })
    }
    catch (err) {
        console.log(err);
    }

    },

    editCategory: async (req, res) => {
        try{
        let category = await categoryHelpers.getCategoryDetails(req.params.id);
        res.render('admin/edit-category', { admin: true, category, adminName: req.session.adminName });
        }
        catch (err) {
            console.log(err);
        }

    },

    editCategoryPost: async (req, res) => {
        try {
            categoryHelpers.updateCategory(req.params.id, req.body).then((response) => {
            })
        }
        catch (error) {
        }
        finally {
            res.redirect('/admin/category-management')
        }
    },

    listCategory: (req, res) => {
        try{
        let categoryId = req.params.id;
        categoryHelpers.listCategory(categoryId).then((response) => {
            res.redirect('/admin/category-management');
        })
        }
        catch (err) {
            console.log(err);
        }
    },

    unlistCategory: (req, res) => {
        try{
        let categoryId = req.params.id;
        categoryHelpers.unlistCategory(categoryId).then((response) => {
            res.redirect('/admin/category-management');
        })
    }
    catch (err) {
        console.log(err);
    }
    },


    orderManagement: (req, res) => {
        try{
        orderHelpers.getAdminOrders().then((orders) => {
            orders.forEach(eachOrder => {
                eachOrder.productCount = eachOrder.products.length;
                // date formatting
                const newDate = new Date(eachOrder.date);
                const year = newDate.getFullYear();
                const month = newDate.getMonth() + 1;
                const day = newDate.getDate();
                const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
                eachOrder.date = formattedDate;
            });
            orders.forEach(order => {
                order.isCancelled = order.status === "DELIVERED" || order.status === "CANCELLED" || order.status==="RETURNED" || order.status==="REQUESTED"? true : false;
                order.isPlaced = order.status === "PLACED" || order.status === "PENDING" ? true : false;
                order.isShipped = order.status === "SHIPPED" ? true : false;
                order.isDelivered = order.status === "DELIVERED" ? true : false;
                order.isRequested = order.status === "REQUESTED" ? true : false;
                // order.isAccepted = order.status === "ACCEPTED" ? true : false;
                order.isReturned = order.status === "RETURNED" ? true : false;
            });
            res.render('admin/order-management', { admin: true, orders, adminName: req.session.adminName });
        })
    }
    catch (err) {
        console.log(err);
    }
    },

    viewOrderDetails: async (req, res) => {
        try{
        let orderId = req.params.id
        let details = await orderHelpers.viewOrderDetails(orderId)
        let products = await orderHelpers.orderProductDetails(orderId)

        console.log(details);
        res.render('admin/view-order-details', { admin: true, details, products, adminName: req.session.adminName })
        }
        catch (err) {
            console.log(err);
        }

    },

    shipOrder: (req, res) => {
        try{
        let orderId = req.params.id;
        console.log((orderId));
        orderHelpers.shipOrder(orderId).then((response) => {
            res.redirect('/admin/order-management');
        })
        }
        catch (err) {
            console.log(err);
        }
    },

    deliverOrder: (req, res) => {
        try{
        let orderId = req.params.id;
        console.log((orderId));
        orderHelpers.deliverOrder(orderId).then((response) => {
            res.redirect('/admin/order-management');
        })
        }
        catch (err) {
            console.log(err);
        }
    },

    returnAcceptOrder: async(req, res) => {
        try{
        let orderId = req.params.id;
        orderHelpers.returnAcceptOrder(orderId).then(async(response) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id : new objectId(orderId)})
            for(let i=0;i<orders.products.length;i++){
                userHelpers.stockIncrement(orders.products[i].item,orders.products[i].quantity)
            }
            res.redirect('/admin/order-management');
        })
        }
        catch (err) {
            console.log(err);
        }
    },

    cancelOrder: (req, res) => {
        try{
        let orderId = req.params.id;
        orderHelpers.cancelOrder(orderId).then(async(response) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id : new objectId(orderId)})
            for(let i=0;i<orders.products.length;i++){
                userHelpers.stockIncrement(orders.products[i].item,orders.products[i].quantity)
            }
            res.redirect('/admin/order-management');
        })
        }
        catch (err) {
            console.log(err);
        }
    },

    bannerManagement: (req, res) => {
        try{
        bannerHelpers.getAllBanners().then((banners) => {
            res.render('admin/banner-management', { admin: true, banners, adminName: req.session.adminName });
        });
        }
        catch (err) {
            console.log(err);
        }
    },

    addBanner: (req, res) => {
        try{
        res.render('admin/add-banner', { admin: true, adminName: req.session.adminName });
        }
        catch (err) {
            console.log(err);
        }
    },

    addBannerPost: async (req, res) => {
        console.log(req.body);
        try {
            const result = await cloudinary.uploader.upload(req.file.path);

            bannerHelpers.addBanner(req.body, async (id) => {
                bannerHelpers.addImage(id, result.url).then((response) => {
                })
            })
        }
        catch (err) {
            console.log(err);
        }
        finally {
            res.redirect('/admin/add-banner');
        }

    },

    activateBanner: (req, res) => {
        try{
        let bannerId = req.params.id;
        bannerHelpers.activateBanner(bannerId).then((response) => {
            res.redirect('/admin/banner-management');
        })
        }
        catch (err) {
            console.log(err);
        }
    },


    editBanner: async (req, res) => {
        try{
        let banner = await bannerHelpers.getBannerDetails(req.params.id);
        res.render('admin/edit-banner', { admin: true, banner, adminName: req.session.adminName });
        }
        catch (err) {
            console.log(err);
        }
    },


    editBannerPost: async (req, res) => {
        // try{
        //         const result = await cloudinary.uploader.upload(req.files.path);
        //         // const updatedProduct = {
        //         //     name: req.body.name,
        //         //     code: req.body.code,
        //         //     description: req.body.description,
        //         //     price: req.body.price
        //         // }

        //     bannerHelpers.updateBanner(req.params.id,req.body).then(()=>{
        //         if(imageUrls!=0){
        //                 bannerHelpers.addImage(id,result.url).then((response)=>{
        //                     console.log(response);
        //                 })
        //         }
        //     })
        // }
        // catch(err){
        //     console.log(err);
        // }
        // finally{
        //     res.redirect('/admin/product-management');
        // }


        try {
            bannerHelpers.updateBanner(req.params.id, req.body).then((response) => {
            })
        }
        catch (error) {
            console.log(erro);
        }
        finally {
            res.redirect('/admin/banner-management')
        }
    },

    deleteBanner : async(req,res) => {
        try{
        bannerHelpers.deleteBanner(req.params.id).then((response)=>{
            res.redirect('back')
        })
        }
        catch (err) {
            console.log(err);
        }
    },

    couponManagement: (req,res) => {
        try{
        orderHelpers.getAllCoupons().then((coupons) => {
            res.render('admin/coupon-management', { admin: true,coupons, adminName: req.session.adminName });
        })
        }
        catch (err) {
            console.log(err);
        }
    },

    addCoupon: (req,res) => {
        try{
        res.render('admin/add-coupon', { admin: true,couponErr: req.session.couponErr, adminName: req.session.adminName });
        req.session.couponErr = false;
        }
        catch (err) {
            console.log(err);
        }
    },

    addCouponPost: async (req,res) => {
        try{
            orderHelpers.addCoupon(req.body).then((response) => {
            if(response.status){
                res.redirect('/admin/add-coupon')
            }
            else{
                req.session.couponErr="Coupon already existed!!!";
                res.redirect('/admin/add-coupon')
            }
         })
        }
        catch(err){
            console.log(err);
        }
    },

    editCoupon: async (req,res) => {
        try{
        let coupon = await orderHelpers.getCouponDetails(req.params.id);
        res.render('admin/edit-coupon', { admin: true, coupon, adminName: req.session.adminName });
        }
        catch (err) {
            console.log(err);
        }
    },

    editCouponPost: async (req,res) => {
        try {
            orderHelpers.updateCoupon(req.params.id, req.body).then((response) => {
            })
        }
        catch (error) {
        }
        finally {
            res.redirect('/admin/coupon-management')
        }
    },

    deleteCoupon : async(req,res)=>{
        try{
        orderHelpers.deleteCoupon(req.params.id).then((response)=>{
            res.redirect('back')
        })
    }
    catch (err) {
            console.log(err);
        }
    },

    chartDetails : async(req,res)=>{
        try{
        let deliverGraph = await orderHelpers.deliverGraph()
        let ordersGraph = await orderHelpers.ordersGraph()
        res.json({deliverGraph,ordersGraph})
        }
        catch (err) {
            console.log(err);
        }
        
    }

}
