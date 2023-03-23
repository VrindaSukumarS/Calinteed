const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt=require('bcrypt');
const userHelpers=require('../helpers/user-helpers')
const productHelpers = require('../helpers/product-helpers');
const adminControllers = require('./admin-controllers');
const categoryHelpers = require('../helpers/category-helpers');
const { resolve } = require('path');
const objectId=require('mongodb-legacy').ObjectId;



module.exports={
    
    userGet : async(req,res)=>{
        let user = req.session.user;
        let cartCount = null
        if(req.session.loggedIn){
            cartCount = await userHelpers.getCartCount(req.session.user._id)
        res.render('user/user-view',{user,cartCount,userHeader:true});
        }
        res.render('user/user-view',{cartCount,userHeader:true});
    },

    userLogin : (req,res)=>{
        if(req.session.loggedIn){
            res.redirect('/');
          }else{
            res.render('user/user-login',{loginErr:req.session.loginErr});
            req.session.loginErr=false;
        }
    },

    userLoginPost : (req,res)=>{
        userHelpers.doLogin(req.body).then((response)=>{
            if(response.status){
              req.session.loggedIn=true;
              req.session.user=response.user;
              res.redirect('/');
            }else{
              req.session.loginErr="Invalid username or password";
              res.redirect('/login');
            }
        })
    },

    userSignup : (req,res)=>{
        if(req.session.loggedIn==true){
            res.redirect('/');
        }else{
            res.render('user/user-signup');
        }
    },

    userSignupPost : (req,res)=>{
        req.body.userStatus = true;
    
        userHelpers.doSignUp(req.body).then((response)=>{
            req.session.loggedIn=true;
            req.session.user=response;
            res.redirect('/');
        })
    },
    
    userLogout : (req,res)=>{
        req.session.loggedIn=false
        res.redirect('/login');
    },

    userProfile :async (req,res)=>{
        
        let cartCount = null
        if(req.session.loggedIn==true){
            // let user=req.session.user
            let userId=req.params.id
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            let user=await userHelpers.getUserDetails(userId)
            res.render('user/user-profile',{user,cartCount,userName:req.session.userName});    
        }
        else{
            res.redirect('/login');
        } 
    },
    
    userOrders :async (req,res)=>{
        let cartCount = null
        let user=req.session.user
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        userHelpers.getOrderDetails(req.session.user._id).then((orders)=>{
            res.render('user/user-orders',{user:true,orders,cartCount,userName:req.session.userName});  
        })
    },


    viewOrderProducts :async (req,res)=>{
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        let products=await userHelpers.getOrderProducts(req.params.id)
    
        res.render('user/view-order-products',{user:true,products,cartCount,userName:req.session.userName});  
    },


    userAddress : async(req,res)=>{
        let cartCount = null
        if(req.session.loggedIn==true){
            cartCount = await userHelpers.getCartCount(req.session.user._id)

            res.render('user/user-address',{user:true,cartCount,userName:req.session.userName}); 
        }
        else{
            res.redirect('/login');
        } 
    },
    userAddAddress : async(req,res)=>{
        let cartCount = null
        if(req.session.loggedIn==true){
            cartCount = await userHelpers.getCartCount(req.session.user._id)

            res.render('user/user-add-address',{user:true,cartCount,userName:req.session.userName}); 
        }
        else{
            res.redirect('/login');
        } 
    },
    addAddress:async(req,res)=>{

        // let products=await userHelpers.getCartProductList(req.body.userId)
        // let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
        // userHelpers.addAddress().then((response)=>{
            res.redirect('/user-address');
        // }) 
    },
    
    userShop : async(req,res)=>{
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)

        categoryHelpers.getAllCategory().then((categories)=>{
            productHelpers.getAllUserProducts().then((products)=>{
                res.render('user/shop-view',{user:true,cartCount,products,categories,userName:req.session.userName}); 
            });
        })
    },

    filterCategories : async(req,res)=>{
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        categoryHelpers.getAllCategory().then((categories)=>{
            productHelpers.getFilterByCategory(req.params.id).then((products)=>{
                res.render('user/filter-category',{user:true,cartCount,categories,products,userName:req.session.userName});
            })
        })
    },


    filterCategory : async(req,res)=>{
        let cartCount = null
        let price=parseInt(req.body.price)
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        categoryHelpers.getAllCategory().then((categories)=>{
            productHelpers.getFilterByPrice(price).then((products)=>{
                res.render('user/filter-category',{user:true,cartCount,categories,products,userName:req.session.userName});
            })
        })
    },


    userProductView : async(req,res)=>{
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        let userName = req.session.user;
        let id = req.params.id;
        productHelpers.getProductDetails(id).then((product)=>{
            res.render('user/product-view',{product,cartCount,user:true,userName});
        })
    },


    userCart : async(req,res)=>{
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        let product = await userHelpers.getCartProducts(req.session.user._id)
        let totalValue= await userHelpers.getTotalAmount(req.session.user._id)

        res.render('user/cart',{product,cartCount,totalValue,user:req.session.user._id})
    },


    cartView : async(req,res)=>{
        userHelpers.addToCart(req.params.id, req.session.user._id).then(()=>{
            // res.redirect('/shop-view')
            res.json({status:true})
        })
    },

    changeProductQuantity : (req,res)=>{
        userHelpers.changeProductQuantity(req.body).then(async(response)=>{
            response.total= await userHelpers.getTotalAmount(req.body.user)
            res.json(response)
        })
    },

    getTotalAmount : async(req,res)=>{
        let cartCount = null

        let product = await userHelpers.getCartProducts(req.session.user._id)
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        let total = await userHelpers.getTotalAmount(req.session.user._id)
        res.render('user/place-order',{total,product,cartCount,user:true,user:req.session.user});    
    },

    checkOut:async(req,res)=>{

        let products=await userHelpers.getCartProductList(req.body.userId)
        let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
        userHelpers.checkOut(req.body,products,totalPrice).then((orderId)=>{
            if(req.body['payment-method']=='COD'){
                res.json({status:true})
            }
            // else{
            //     userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
            //         res.json(response)
            //     })
            // }
            
        }) 
    },

    removeCartProduct : (req,res)=>{
        userHelpers.removeCartProduct(req.body).then(async(response)=>{
            res.json(response)
        })
    },


    getWishlist : async(req,res)=>{
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        let user = req.session.user;
        userHelpers.getWishlist(req.session.user._id).then((products)=>{
            res.render('user/wishlist',{products,user,cartCount,user:req.session.user._id})
        })
    },


    addToWishlist :async(req,res)=>{
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        let productId = req.params.id
        let userId= req.session.user._id
        userHelpers.addToWishlist(userId,productId).then((response)=>{ 
        })
    },

    removeWishlistProduct : (req,res)=>{
        userHelpers.removeWishlistProduct(req.body).then(async(response)=>{
            res.json(response)
        })
    },

    thankYou :async (req,res)=>{
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        res.render('user/thank-you',{user:true,cartCount,userName:req.session.userName}); 
    },


    fabricView :async (req,res)=>{
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        res.render('user/fabric-view',{user:true,cartCount,userName:req.session.userName}); 
    },
      
    aboutUs : async(req,res)=>{
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)

        res.render('user/about-us',{user:true,cartCount,userName:req.session.userName}); 
    }
    
 
}