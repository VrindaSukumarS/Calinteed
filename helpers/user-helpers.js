const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { resolve } = require('path');
const { response } = require('../app');
// const { loadavg } = require('os');
const objectId=require('mongodb-legacy').ObjectId;

// const Razorpay = require('razorpay');
// var instance = new Razorpay({
//     key_id: 'rzp_test_qoL5ARjplvfe2r',
//     key_secret: 'IHpzmc7dmdgx5XBIXoOtWUEs',
// });
    

module.exports={
    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.userStatus=Boolean(userData.userStatus)
            userData.password = await bcrypt.hash(userData.password,10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async(data)=>{
                // resolve(data);
                dataDoc = await db.get().collection(collection.USER_COLLECTION).findOne({_id:data.insertedId});
                resolve(dataDoc);
            })
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email});
            if(user){
                if(user.userStatus){
                    bcrypt.compare(userData.password,user.password).then((status)=>{
                        console.log(status);
                        if(status){
                            response.user=user;
                            response.status=true;
                            resolve(response);
                        }else{
                            resolve({status:false});
                        }
                    })
                }
                else{
                    resolve({status:false});
                }
                
            }else{
                console.log("user not found !!");
                resolve({status:false});
            }
        })
    },

    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(users);
        })
    },


    getUserDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({_id:new objectId(userId)}).then((response)=>{
                resolve(response);
            })
            
        })
    },

    blockUser : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:new objectId(userId)},{ $set: { userStatus: false } }).then((response) => {
              resolve(response);
              console.log(response);
            });
        })
    },

    unblockUser : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:new objectId(userId)},{ $set: { userStatus: true } }).then((response) => {
              resolve(response);
              console.log(response);
            });
        })
    },

    addToCart: (proId, userId) => {
        let proObj = {
          item: new objectId(proId),
          quantity: 1,
        };
        return new Promise(async (resolve, reject) => {
          let userCart = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .findOne({ user: new objectId(userId) });
          if (userCart) {
            let proExist = userCart.products.findIndex(
              (product) => product.item == proId
            );
            if (proExist !== -1) {
              db.get().collection(collection.CART_COLLECTION).updateOne(
                {
                  user: new objectId(userId),
                  "products.item": new objectId(proId),
                },
                {
                  $inc: { "products.$.quantity": 1 },
                }
              ).then((response) => {
                resolve(response);
              });
            } else {
              db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                  { user: new objectId(userId) },
                  { $push: { products: proObj } }
                )
                .then((response) => {
                  resolve(response);
                });
            }
          } else {
            let cartObj = {
              user: new objectId(userId),
              products: [proObj],
            };
            db.get()
              .collection(collection.CART_COLLECTION)
              .insertOne(cartObj)
              .then((response) => {
                resolve(response);
              });
          }
        });
    },
      


    getCartProducts : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match :{user:new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item :'$products.item',
                        quantity :'$products.quantity'
                    }
                },
                {
                    $lookup : {
                        from : collection.PRODUCT_COLLECTION,
                        localField : 'item',
                        foreignField : '_id',
                        as : 'product'
                    }
                },
                {
                   $project : {
                    item : 1, quantity : 1, product : {$arrayElemAt : ['$product',0]}
                   }
                }
            ]).toArray();
            try{
                resolve(cartItems);
            }catch{
                resolve(null)
            }
        })
    },

    getTotalAmount : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match :{user:new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item :'$products.item',
                        quantity :'$products.quantity'
                    }
                },
                {
                    $lookup : {
                        from : collection.PRODUCT_COLLECTION,
                        localField : 'item',
                        foreignField : '_id',
                        as : 'product'
                    }
                },
                {
                   $project : {
                    item : 1, quantity : 1, product : {$arrayElemAt : ['$product',0]}
                   }
                },
                {
                    $group :{
                        _id:null,
                        total : {$sum:{$multiply:['$quantity','$product.price']}}
                    }
                }
            ]).toArray();
            try{
                console.log(total[0].total);
                resolve(total[0].total);
            }catch{
                resolve(null)
            }
              
        })
    },


    getCartCount : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user: new objectId(userId)})
            if(cart){
               count = cart.products.length 
            }
            resolve(count)
        })
    },

    
    changeProductQuantity : (details)=>{
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        
        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION).updateOne({_id :new objectId(details.cart)},
                {
                    $pull : {products:{item:new objectId(details.product)}}
                }).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{
                db.get().collection(collection.CART_COLLECTION).updateOne(
                    {
                        _id : new objectId(details.cart),
                    "products.item": new objectId(details.product),
                    },
                    {
                    $inc: { "products.$.quantity": details.count }
                    }
                ).then((response) => {
                    resolve({status:true});
                })
            }
        })
    },

    removeCartProduct : (details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id :new objectId(details.cart)},
            {
                $pull : {products:{item:new objectId(details.product)}}
            }).then((response)=>{
                resolve({removeProduct:true})
            })
        })
    },


    getCartProductList :(userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userId);
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
            resolve(cart.products)
        })
    },

    getOrderDetails :(userId)=>{
        console.log(userId);
        return new Promise(async(resolve,reject)=>{
            let orders= await db.get().collection(collection.ORDER_COLLECTION).find({userId:new objectId(userId)}).toArray()
            resolve(orders)
            
        })
    },


    getOrderProducts :(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match :{_id:new objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item :'$products.item',
                        quantity :'$products.quantity'
                    }
                },
                {
                    $lookup : {
                        from : collection.PRODUCT_COLLECTION,
                        localField : 'item',
                        foreignField : '_id',
                        as : 'product'
                    }
                },
                {
                   $project : {
                    item : 1, quantity : 1, product : {$arrayElemAt : ['$product',0]}
                   }
                }
            ]).toArray();
            try{
                resolve(orderItems);
                console.log(orderItems);
            }catch{
                resolve(null)
            }
        })

    },


    checkOut : (order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,products,total);
            let status=order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    firstname:order.firstname,
                    lastname:order.lastname,
                    address:order.address,
                    country:order.country,
                    state:order.state,
                    pincode:order.pincode,
                    email:order.email,
                    phone:order.phone
                },
                userId:new objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteMany({user:new objectId(order.userId)})
                    resolve(response.ops[0]._id)
            })
            
        })
    },

    getWishlist :async (userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userId);
            let result=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match :{'userId':new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item :'$products.item'
                    }
                },
                {
                    $lookup : {
                        from : collection.PRODUCT_COLLECTION,
                        localField : 'item',
                        foreignField : '_id',
                        as : 'product'
                    }
                }
                ,{
                   $project : {
                    item : 1, product : {$arrayElemAt : ['$product',0]}
                }
                }
            ]).toArray();
            try{
                console.log(result);

                resolve(result);
            }catch{
                resolve(null)
            }
        })
    },


    addToWishlist : (userId,productId)=>{
        return new Promise(async(resolve,reject)=>{
            userId= new objectId(userId)
            productId=new objectId(productId)
            let product={
                item: productId,
                wishStatus: true
            }
            const isWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({userId:userId})
            if(isWishlist){
                db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
                {
                    userId : userId
                },
                {
                    $push :{
                        products: product
                    }
                }
                ).then((response)=>{
                    resolve(response)
                });
            }else{
                let wishlist={
                    userId : userId,
                    products : [product]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlist).then((response)=>{
                    resolve(response);
                });
            }
        })
    },


    removeWishlistProduct : (details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({_id :new objectId(details.wishlist)},
            {
                $pull : {products:{item:new objectId(details.product)}}
            }).then((response)=>{
                resolve({removeProduct:true})
            })
        })
    },


    // generateRazorpay : (orderId,total)=>{
    //     return new Promise((resolve,reject)=>{
    //         // var options={
    //         // amount: total,
    //         // currency: "INR",
    //         // receipt: orderId,
    //         // // notes: {
    //         // //     key1: "value3",
    //         // //     key2: "value2"
    //         // // }
    //         // };
    //         // instance.orders.create(options,function(err, order){
    //         //     console.log(order);
    //         //     resolve(order)
    //         // })

    //         instance.orders.create({
    //             amount: total,
    //             currency: "INR",
    //             receipt: orderId,
    //             // notes: {
    //             //   key1: "value3",
    //             //   key2: "value2"
    //             // }
    //         }),
    //         function(err, order){
    //             console.log(order);
    //             resolve(order)
    //         }

    //     })
    // }



}