const db = require('../config/connection');

const collection = require('../config/collections');

const bcrypt = require('bcrypt');

const userHelpers = require('../helpers/user-helpers')

const productHelpers = require('../helpers/product-helpers');

const orderHelpers = require('../helpers/order-helpers');

const adminControllers = require('./admin-controllers');

const categoryHelpers = require('../helpers/category-helpers');

const bannerHelpers = require('../helpers/banner-helpers');

const { resolve } = require('path');

const { log } = require('console');

const objectId = require('mongodb-legacy').ObjectId;



module.exports = {

    userGet: async (req, res) => {
        try {
            let user = req.session.user;
            let userName = req.session.userName
            let cartCount = null
            let banners = await bannerHelpers.getAllBanners();
            if (req.session.loggedIn) {
                cartCount = await userHelpers.getCartCount(req.session.user._id)
                res.render('user/user-view', { user, banners, cartCount, userHeader: true, userName : req.session.userName });
            }

            res.render('user/user-view', {cartCount, banners, userHeader: true });
        }
        catch (err) {
            console.log(err);
        }
    },

    userLogin: (req, res) => {
        try {
            if (req.session.loggedIn) {
                res.redirect('/');
            } else {
                res.render('user/user-login', { loginErr: req.session.loginErr });
                req.session.loginErr = false;
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    userLoginPost: (req, res) => {
        try {
            userHelpers.doLogin(req.body).then((response) => {
                if (response.status) {
                    req.session.loggedIn = true;
                    req.session.user = response.user;
                    req.session.userName = response.user.name
                    res.redirect('/');
                } else {
                    req.session.loginErr = "Invalid username or password";
                    res.redirect('/login');
                }
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    userLoginOtp: (req, res) => {
        try {
            if (req.session.loggedIn == true) {
                res.redirect('/');
            } else {
                res.render('user/otp-login');
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    validateUser: (req, res) => {
        try {
            userHelpers.validateUser(req.body).then((response) => {
                req.session.userId = response._id
                res.json(response)
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    verifyUser: (req, res) => {
        try {
            userHelpers.verifyUser(req.body).then((response) => {
                req.session.loggedIn = true;
                req.session.user = response.user;
                res.json(response)
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    verifyForgotPasswordUser: (req, res) => {
        try {
            userHelpers.verifyUser(req.body).then((response) => {
                req.session.loggedIn = false;
                req.session.user = response.user;
                res.json(response)
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    forgotPassword: (req, res) => {
        try {
            if (req.session.loggedIn == true) {
                res.redirect('/');
            } else {
                res.render('user/forgot-password');
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    resetPassword: (req, res) => {
        try {
            if (req.session.loggedIn == true) {
                res.redirect('/');
            } else {
                res.render('user/reset-password');
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    resetNewPassword: async (req, res) => {
        try {
            let userId = req.session.userId
            let userData = req.body
            userHelpers.continuePassword(userId, userData).then((response) => {
                res.redirect('/login');
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    userSignup: (req, res) => {
        try {
            if (req.session.loggedIn == true) {
                res.redirect('/');
            } else {
                res.render('user/user-signup', { loginErr: req.session.loginErr });
                req.session.loginErr = false;
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    userSignupPost: (req, res) => {
        try {
            req.body.userStatus = true;
            userHelpers.doSignUp(req.body).then((response) => {
                if (response.status) {
                    req.session.loggedIn = true;
                    req.session.user = response;
                    res.redirect('/');
                } else {
                    req.session.loginErr = "Already Registered!!!";
                    res.redirect('/signup');
                }
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    userLogout: (req, res) => {
        try {
            req.session.loggedIn = false
            res.redirect('/login');
        }
        catch (err) {
            console.log(err);
        }
    },

    userProfile: async (req, res) => {
        try {
            let cartCount = null
            if (req.session.loggedIn == true) {
                // let user=req.session.user
                let userId = req.session.user._id
                let user = req.session.user
                cartCount = await userHelpers.getCartCount(req.session.user._id)
                let users = await userHelpers.getUserDetails(userId)
                res.render('user/user-profile', { user, users, cartCount, userName: req.session.userName });
            }
            else {
                res.redirect('/login');
            }
        }
        catch (err) {
            console.log(err);
        }
    },


    userProfilePost: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            // let userDetails = await userHelpers.updateUserDetails(req.params.id);
            try {
                userHelpers.updateUserDetails(req.session.user._id, req.body).then((response) => {
                    console.log(response);
                    // res.render('user/user-profile',{user,cartCount,userName:req.session.userName}); 
                    res.redirect('/userprofile')
                })
            }
            catch (error) {
                console.log(error);
                // res.render('user/user-profile',{user,cartCount,userName:req.session.userName}); 
                res.redirect('/userprofile')
            }

        }
        catch (err) {
            console.log(err);
        }
    },


    userOrders: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            userHelpers.getOrderDetails(req.session.user._id).then((orders) => {
                for (let i = 0; i < orders.length; i++) {
                    orders[i].totalAmount = orders[i].totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                }
                orders.forEach(order => {
                    order.isCancelled = order.status === "CANCELLED" ? true : false;
                    order.isDelivered = order.status === "DELIVERED" ? true : false;
                    order.isRequested = order.status === "REQUESTED" ? true : false;
                    order.isReturned = order.status === "RETURNED" ? true : false;
                });
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
                res.render('user/user-orders', { user, orders, cartCount, userName: req.session.userName });
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    viewOrderProducts: async (req, res) => {
        try {
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            let products = await userHelpers.getOrderProducts(req.params.id)
            let details = await orderHelpers.viewOrderDetails(req.params.id)
            // let products = await orderHelpers.orderProductDetails(orderId)

            res.render('user/view-order-products', { user: true, products, details, cartCount, userName: req.session.userName });
        }
        catch (err) {
            console.log(err);
        }
    },

    cancelOrder: async (req, res) => {
        try {
            let cartCount = null
            let orderId = req.params.id;
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            orderHelpers.cancelOrder(orderId).then(async (response) => {
                let orders = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: new objectId(orderId) })
                for (let i = 0; i < orders.products.length; i++) {
                    userHelpers.stockIncrement(orders.products[i].item, orders.products[i].quantity)
                }
                res.redirect('back');
                // res.render('user/view-order-products',{user:true,products,cartCount,userName:req.session.userName});  
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    returnRequestOrder: async (req, res) => {
        try {
            let cartCount = null
            let orderId = req.params.id;
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            orderHelpers.returnRequestOrder(orderId).then((response) => {

                res.redirect('back');
                // res.render('user/view-order-products',{user:true,products,cartCount,userName:req.session.userName});  
            })
        }
        catch (err) {
            console.log(err);
        }
    },
    returnOrder: async (req, res) => {
        try {
            let cartCount = null
            let orderId = req.params.id;
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            orderHelpers.returnOrder(orderId).then((response) => {

                res.redirect('back');
                // res.render('user/view-order-products',{user:true,products,cartCount,userName:req.session.userName});  
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    pendingOrder: async (req, res) => {
        try {
            let cartCount = null
            let orderId = req.params.id;
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            orderHelpers.pendingOrder(orderId).then((response) => {

                res.redirect('back');
                // res.render('user/view-order-products',{user:true,products,cartCount,userName:req.session.userName});  
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    userAddress: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            let userId = req.session.user._id
            if (req.session.loggedIn == true) {
                cartCount = await userHelpers.getCartCount(req.session.user._id)
                let address = await userHelpers.getUserAddress(userId)
                res.render('user/user-address', { user: true, user, address, cartCount, userName: req.session.userName });
            }
            else {
                res.redirect('/login');
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    userAddressPost: async (req, res) => {
        try {
            let cartCount = null
            // let user=req.session.user
            let addressId = req.params.id
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            try {
                userHelpers.updateAddressDetails(req.session.user._id, req.body, addressId).then((response) => {
                    console.log(response);
                    res.redirect('back')
                })
            }
            catch (error) {
                console.log(error);
                res.redirect('back')
            }

        }
        catch (err) {
            console.log(err);
        }
    },

    deleteAddress: (req, res) => {
        try {
            let userId = req.session.user._id
            let addressId = req.params.id
            userHelpers.deleteAddress(userId, addressId).then((response) => {
                res.redirect('back')
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    userAddAddress: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            if (req.session.loggedIn == true) {
                cartCount = await userHelpers.getCartCount(req.session.user._id)
                res.render('user/user-add-address', { user, cartCount, userName: req.session.userName });
            }
            else {
                res.redirect('/login');
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    addAddress: async (req, res) => {
        try {
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            let userId = req.session.user._id
            userHelpers.addAddress(userId, req.body).then((response) => {
                res.redirect(`/user-address/${userId}`);
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    changePassword: async (req, res) => {
        try {
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            res.render('user/change-password', { user: true, cartCount, userName: req.session.userName });
        }
        catch (err) {
            console.log(err);
        }
    },

    changePasswordPost: async (req, res) => {
        try {
            console.log("1234", req.body)
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            let userId = req.session.user._id
            let userData = req.body
            userHelpers.changePassword(userId, userData).then((response) => {
                res.render('user/continue-password', { user: true, cartCount, userName: req.session.userName });
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    // continuePassword :async (req,res)=>{
    //     try{
    //     let cartCount = null
    //     cartCount = await userHelpers.getCartCount(req.session.user._id)
    //     res.render('user/continue-password',{user:true,cartCount,userName:req.session.userName}); 
    // }
    // catch(err){
    //     console.log(err);
    // }
    // },

    continuePasswordPost: async (req, res) => {
        try {
            console.log("1234", req.body)
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            let userId = req.session.user._id
            let userData = req.body
            userHelpers.continuePassword(userId, userData).then((response) => {
                res.redirect('/login');
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    myWallet: async (req, res) => {
        try {
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            const userId = req.session.user._id
            userHelpers.myWallet(userId).then((wallet) => {
                res.render('user/my-wallet', { user: true, wallet, cartCount, userName: req.session.userName });
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    userShop: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            const minPrice = req.session.minPrice
            const maxPrice = req.session.maxPrice
            const filteredProducts = req.session.filteredProducts

            let currentPage = req.query.page || 1

            let productCount = await productHelpers.getProductCount()

            categoryHelpers.getAllUserCategory().then((categories) => {
                if (filteredProducts) {
                    for (let i = 0; i < filteredProducts.length; i++) {
                        filteredProducts[i].price = filteredProducts[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                    }
                    res.render('user/shop-view', { user, cartCount, minPrice, maxPrice, filteredProducts, categories, userName: req.session.userName });
                } else {
                    productHelpers.getAllUserProducts(currentPage).then((products) => {
                        for (let i = 0; i < products.length; i++) {
                            products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                        }
                        res.render('user/shop-view', { user, cartCount, minPrice, maxPrice, products, currentPage, productCount, categories, userName: req.session.userName });
                    });
                }
            })
            req.session.minPrice = false;
            req.session.maxPrice = false;
            req.session.filteredProducts = false;
        }
        catch (err) {
            console.log(err);
        }
    },

    productSearch: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            cartCount = await userHelpers.getCartCount(req.session.user._id)

            let currentPage = req.query.page || 1

            let productCount = await productHelpers.getProductCount()
            let text = req.body
            // let categoryName = await categoryHelpers.getCategoryName(req.params.id)
            categoryHelpers.getAllCategory().then(async (categories) => {

                let filteredProducts = await productHelpers.productSearch(text)
                for (let i = 0; i < filteredProducts.length; i++) {
                    filteredProducts[i].price = filteredProducts[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                }
                res.render('user/filter-category', { user: true,user, cartCount, currentPage, productCount, categories, filteredProducts, userName: req.session.userName });
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    filterCategories: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            cartCount = await userHelpers.getCartCount(req.session.user._id)

            let currentPage = req.query.page || 1

            let productCount = await productHelpers.getProductCount()

            let categoryName = await categoryHelpers.getCategoryName(req.params.id)
            categoryHelpers.getAllCategory().then((categories) => {
                productHelpers.getFilterByCategory(req.params.id).then((filteredProducts) => {
                    req.session.catId = req.params.id
                    req.session.categoryFilteredProducts = filteredProducts;
                    const minPrice = req.session.minPrice;
                    const maxPrice = req.session.maxPrice;
                    for (let i = 0; i < filteredProducts.length; i++) {
                        filteredProducts[i].price = filteredProducts[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                    }
                    res.render('user/filter-category', { user: true,user, cartCount, categoryName, currentPage, productCount, maxPrice, minPrice, categories, filteredProducts, userName: req.session.userName });
                })
            })

        }
        catch (err) {
            console.log(err);
        }
    },


    filterCategory: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            let price = parseInt(req.body.price)
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            categoryHelpers.getAllCategory().then((categories) => {
                productHelpers.filterPrice(req.body.minPrice, req.body.maxPrice, req.body.search).then((products) => {
                    res.render('user/filter-category', { user: true, cartCount, categories, products, userName: req.session.userName });
                })
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    filterPrice: async (req, res) => {
        try {
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            productHelpers.filterPrice(req.body.minPrice, req.body.maxPrice, req.body.search).then((products) => {
                req.session.filteredProducts = products;
                req.session.minPrice = req.body.minPrice;
                req.session.maxPrice = req.body.maxPrice;
                req.session.searchValue = req.body.search;

                res.json({
                    status: "success"
                });
            });

        }
        catch (err) {
            console.log(err);
        }
    },

    lowHighPrice: async (req, res) => {
        try {
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            categoryHelpers.getAllCategory().then((categories) => {
                productHelpers.lowHighPrice().then((filteredProducts) => {
                    for (let i = 0; i < filteredProducts.length; i++) {
                        filteredProducts[i].price = filteredProducts[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                    }
                    res.render('user/filter-category', { user: true, cartCount, categories, filteredProducts, userName: req.session.userName });

                })
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    highLowPrice: async (req, res) => {
        try {
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            categoryHelpers.getAllCategory().then((categories) => {
                productHelpers.highLowPrice().then((filteredProducts) => {
                    for (let i = 0; i < filteredProducts.length; i++) {
                        filteredProducts[i].price = filteredProducts[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                    }
                    res.render('user/filter-category', { user: true, cartCount, categories, filteredProducts, userName: req.session.userName });

                })
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    categoryHighLowPrice: async (req, res) => {
        try {
            let cartCount = null
            let categoryId = req.session.catId
            console.log('categoryId!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11',categoryId);
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            categoryHelpers.getAllCategory().then((categories) => {
                productHelpers.categoryHighLowPrice(categoryId).then((filteredProducts) => {
                    for (let i = 0; i < filteredProducts.length; i++) {
                        filteredProducts[i].price = filteredProducts[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                    }
                    res.render('user/filter-category', { user: true, cartCount, categories, filteredProducts, userName: req.session.userName });

                })
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    categoryLowHighPrice: async (req, res) => {
        try {
            let cartCount = null
            let categoryId = req.session.catId
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            categoryHelpers.getAllCategory().then((categories) => {
                productHelpers.categoryLowHighPrice(categoryId).then((filteredProducts) => {
                    for (let i = 0; i < filteredProducts.length; i++) {
                        filteredProducts[i].price = filteredProducts[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                    }
                    res.render('user/filter-category', { user: true, cartCount, categories, filteredProducts, userName: req.session.userName });

                })
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    userProductView: async (req, res) => {
        try {
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            let userName = req.session.user;
            let user = req.session.user
            let id = req.params.id;
            productHelpers.getProductDetails(id).then((product) => {
                product.price = product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                res.render('user/product-view', { product, cartCount, user, userName });
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    userCart: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            let userId = "" + req.session.user._id
            console.log(userId)
            // let user=req.session.user
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            let product = await userHelpers.getCartProducts(req.session.user._id)
            let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
            // totalValue.price = totalValue.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

            res.render('user/cart', { user, userId, product, cartCount, totalValue, stockErr: req.session.stockErr })
            req.session.stockErr = false;
        }
        catch (err) {
            console.log(err);
        }
    },


    cartView: async (req, res) => {
        try {
            userHelpers.addToCart(req.params.id, req.session.user._id).then((response) => {
                res.json(response)
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    changeProductQuantity: (req, res) => {
        try {
            userHelpers.changeProductQuantity(req.body).then(async (response) => {
                response.total = await userHelpers.getTotalAmount(req.body.user)
                res.json(response)
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    getTotalAmount: async (req, res) => {
        try {
            let cartCount = null
            let discountDetails = req.session.coupon ? req.session.coupon : 0
            let product = await userHelpers.getCartProducts(req.session.user._id)
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            let ordertotal = await userHelpers.getTotalAmount(req.session.user._id)
            let total = ordertotal - discountDetails;
            let userAddress = await userHelpers.getUserAddress(req.session.user._id)
            let wallet = await userHelpers.myWallet(req.session.user._id);
            let walletAmount = wallet.wallet
            let outOfStock = false;
            for (let i = 0; i < product.length; i++) {
                if (product[i].product.stock == 0) {
                    outOfStock = true;
                }
            }
            if (outOfStock) {
                req.session.stockErr = 'Remove Out of stock prouct from the cart'
                res.redirect('back');
            }
            else {
                res.render('user/place-order', { total, product, discountDetails, ordertotal, walletAmount, userAddress, cartCount, user: true, user: req.session.user });
            }
        }
        catch (err) {
            console.log(err);
        }
    },

    checkOut: async (req, res) => {
        try {
            const userId = req.session.user._id
            let products = await userHelpers.getCartProductList(userId);
            let price = await userHelpers.getTotalAmount(userId)
            let couponAmount = req.session.coupon
            let couponId = req.session.couponId
            let totalPrice = price - couponAmount
            userHelpers.checkOut(userId, req.body, products, totalPrice).then((orderId) => {


                if (req.body['payment-method'] === 'COD') {
                    for (let i = 0; i < products.length; i++) {
                        userHelpers.stockDecrement(products[i].item, products[i].quantity)
                    }
                    res.json({ codSuccess: true })
                    userHelpers.deleteCart(req.session.user._id);
                    userHelpers.addUsedCoupons(couponId, req.session.user._id);
                }
                else if (req.body['payment-method'] === 'WALLET') {
                    for (let i = 0; i < products.length; i++) {
                        userHelpers.stockDecrement(products[i].item, products[i].quantity)
                    }
                    res.json({ walletSuccess: true })
                    userHelpers.decrementWallet(req.session.user._id, totalPrice);
                    userHelpers.deleteCart(req.session.user._id);
                    userHelpers.addUsedCoupons(couponId, req.session.user._id);
                }
                else {
                    userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
                        res.json(response)
                    })
                }

            })
        }
        catch (err) {
            console.log(err);
        }
    },

    removeCartProduct: (req, res) => {
        try {
            userHelpers.removeCartProduct(req.body).then(async (response) => {
                res.json(response)
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    applyCoupon: (req, res) => {
        try {
            console.log(req.body);
            const userId = req.session.user._id;
            userHelpers.applyCoupon(req.body, userId).then(async (response) => {
                req.session.couponId = response._id
                req.session.coupon = response.disamount;
                let couponAmount = req.session.coupon
                console.log('coupon applied amount',couponAmount);
                console.log();
                res.json(response)
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    getWishlist: async (req, res) => {
        try {
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            let user = req.session.user;
            userHelpers.getWishlist(req.session.user._id).then((products) => {
                let wishlistLength = products.length
                for (let i = 0; i < wishlistLength; i++) {
                    products[i].price = products[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                }
                res.render('user/wishlist', { products, wishlistLength, user, cartCount, userId: req.session.user._id })
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    addToWishlist: async (req, res) => {
        try {
            let cartCount = null
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            let productId = req.params.id
            let userId = req.session.user._id
            userHelpers.addToWishlist(userId, productId).then((response) => {
                res.json(response)
                // res.redirect('back')
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    removeWishlistProduct: (req, res) => {
        try {
            let userId = new objectId(req.body.user)
            let productId = new objectId(req.body.product)

            userHelpers.removeWishlistProduct(userId, productId).then(async (response) => {
                res.json(response)
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    thankYou: async (req, res) => {
        try {
            let cartCount = null
            let user=req.session.user
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            res.render('user/thank-you', { user: true,user, cartCount, userName: req.session.userName });
            req.session.coupon = false;

        }
        catch (err) {
            console.log(err);
        }
    },


    fabricView: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            res.render('user/fabric-view', { user, cartCount, userName: req.session.userName });
        }
        catch (err) {
            console.log(err);
        }
    },

    aboutUs: async (req, res) => {
        try {
            let cartCount = null
            let user = req.session.user
            cartCount = await userHelpers.getCartCount(req.session.user._id)

            res.render('user/about-us', { user, cartCount, userName: req.session.userName });
        }
        catch (err) {
            console.log(err);
        }
    },


    verifyPayment: async (req, res) => {
        try {
            console.log(req.body);
            let products = await userHelpers.getCartProductList(req.session.user._id);

            userHelpers.verifyPayment(req.body).then(() => {
                userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
                    for (let i = 0; i < products.length; i++) {
                        userHelpers.stockDecrement(products[i].item, products[i].quantity)
                    }
                    console.log('Payment Successfull');
                    res.json({ status: true })
                    userHelpers.deleteCart(req.session.user._id)
                })
            }).catch((err) => {
                console.log(err);
                res.json({ status: false, errMsg: '' })
            })

        }
        catch (err) {
            console.log(err);
        }
    },
    categoryPriceFilter: async (req, res) => {
        let minPrice = req.query.minvalue
        let maxPrice = req.query.maxvalue
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id);
        const catId = req.session.catId

        cartCount = await userHelpers.getCartCount(req.session.user._id)
        categoryHelpers.getAllCategory().then((categories) => {
            productHelpers.categoryPriceFilter(minPrice, maxPrice, catId).then((filteredProducts) => {
                for (let i = 0; i < filteredProducts.length; i++) {
                    filteredProducts[i].price = filteredProducts[i].price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                }
                res.render('user/filter-category', { user: true, cartCount, categories, filteredProducts, userName: req.session.userName });
            })
        })
    }


}