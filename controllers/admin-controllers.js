const db = require('../config/connection');
const collection = require('../config/collections');
const userHelpers = require('../helpers/user-helpers');
const orderHelpers = require('../helpers/order-helpers');
const categoryHelpers = require('../helpers/category-helpers');


const upload = require('../utils/multer');
const cloudinary = require('cloudinary');
const productHelpers = require('../helpers/product-helpers');
const { url } = require('../utils/cloudinary');
const { response } = require('../app');

module.exports={
    
    adminLogin : (req,res)=>{
        if(req.session.adminLoggedIn){
            res.redirect('/admin');
        }else{
            res.render('admin/admin-login',{admin:true,adminLoginErr:req.session.adminLoginErr});
            req.session.adminLoginErr=false;
        }
    },
          
    adminLoginPost : async(req,res)=>{
        // console.log('ywtsljcfdbslcdc');
        console.log(`email:  ${req.body.email}`);
        console.log(`password: ${req.body.password}`);
        let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({adminEmail:req.body.email});
        // console.log(admin.adminName)
        if(req.body.email==admin.adminEmail&&req.body.password==admin.adminPassword){
            req.session.admin=req.body.email;
            req.session.adminLoggedIn=true;
            req.session.adminName=admin.adminName;
            res.render('admin/admin-view', {adminName:req.session.adminName, admin:true});
        }else{
            req.session.adminLoginErr="Invalid username or password";
            res.redirect('/admin/login');
        }
    },

    adminLogout : (req,res)=>{
        req.session.adminLoggedIn=false;
        res.redirect('/admin/login');
    },

    adminView : (req, res)=>{
        res.render('admin/admin-view',{admin:true,adminName:req.session.adminName});
    },
    productManagement : (req, res)=>{
        productHelpers.getAllProducts().then((products)=>{
            console.log(products);
            res.render('admin/product-management',{admin:true,products,adminName:req.session.adminName});            
        })
    },

   
    addProduct : (req,res)=>{
        categoryHelpers.getAllCategory().then((categories)=>{
            res.render('admin/add-product',{admin:true,categories,adminName:req.session.adminName});
        })
    },

    addProductPost : async(req,res)=>{
        console.log(req.body);
        try{
            const imageUrls=[]
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imageUrls.push(result.url);
            }
            productHelpers.addProduct(req.body, async(id)=>{
                productHelpers.addImage(id,imageUrls).then((response)=>{
                    console.log(response);
                })
            })
        }
        catch(err){
            console.log(err);
        }
        finally{
            res.redirect('/admin/add-product');
        }

    },

    editProduct : async(req,res)=>{
        let product = await productHelpers.getProductDetails(req.params.id);
        res.render('admin/edit-product',{admin:true,product,adminName:req.session.adminName});
    },


    editProductPost: async(req, res) => {

        try{
            const imageUrls=[]
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
            productHelpers.updateProduct(req.params.id,req.body).then(()=>{
                if(imageUrls!=0){
                    productHelpers.addImage(req.params.id,imageUrls).then((response)=>{
                        console.log(response);
                    })
                }
            })
        }
        catch(err){
            console.log(err);
        }
        finally{
            res.redirect('/admin/product-management');
        }
    
    },

    listProduct : (req,res)=>{
        let productId = req.params.id;
        console.log((productId));
        productHelpers.listProduct(productId).then((response) =>{
            res.redirect('/admin/product-management');
        })
    },

    unlistProduct : (req,res)=>{
        let productId = req.params.id;
        console.log((productId));
        productHelpers.unlistProduct(productId).then((response) =>{
            res.redirect('/admin/product-management');
        })
    },
      
      

    userManagement : (req, res)=>{
        userHelpers.getAllUsers().then((users)=>{
            res.render('admin/user-management',{admin:true,users,adminName:req.session.adminName});
        })
    },

    addUser : (req,res)=>{
        res.render('admin/add-user',{admin:true,adminName:req.session.adminName});
    },

    addUserPost : (req,res)=>{
        req.body.userStatus = true;
        userHelpers.doSignUp(req.body).then((response)=>{
            if(response){
                res.redirect('/admin/user-management')
            }
        })
        
    },

    blockUser : (req,res)=>{
        let userId = req.params.id;
        console.log((userId));
        userHelpers.blockUser(userId).then((response) =>{
            res.redirect('/admin/user-management');
        })
    },


    unblockUser : (req,res)=>{
        let userId = req.params.id;
        console.log((userId));
        userHelpers.unblockUser(userId).then((response) =>{
            res.redirect('/admin/user-management');
        })
    },

    orderManagement : (req, res)=>{
        res.render('admin/order-management',{admin:true,adminName:req.session.adminName});
    },

    categoryManagement : (req, res)=>{
        categoryHelpers.getAllCategory().then((categories)=>{
            res.render('admin/category-management',{admin:true,categories,adminName:req.session.adminName});            
        })
    },

    addCategory : (req,res)=>{
        res.render('admin/add-category',{admin:true,adminName:req.session.adminName});
    },

    addCategoryPost: async (req, res) => {
        console.log(req.body);
        categoryHelpers.addCategory(req.body).then((response)=>{
            console.log(response);
            res.redirect('/admin/add-category')
        })
          
    },

    listCategory : (req,res)=>{
        let categoryId = req.params.id;
        console.log((categoryId));
        categoryHelpers.listCategory(categoryId).then((response) =>{
            res.redirect('/admin/category-management');
        })
    },

    unlistCategory : (req,res)=>{
        let categoryId = req.params.id;
        console.log((categoryId));
        categoryHelpers.unlistCategory(categoryId).then((response) =>{
            res.redirect('/admin/category-management');
        })
    },


    orderManagement : (req, res)=>{
        orderHelpers.getAdminOrders().then((orders)=>{
                console.log(orders);
                res.render('admin/order-management',{admin:true,orders,adminName:req.session.adminName});  
            })
    },

    bannerManagement : (req, res)=>{
        res.render('admin/banner-management',{admin:true,adminName:req.session.adminName});
    }
    
}
