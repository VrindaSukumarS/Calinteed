const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { resolve } = require('path');
const { response } = require('../app');
// const { loadavg } = require('os');
const objectId = require('mongodb-legacy').ObjectId;

const Razorpay = require('razorpay');
const { log } = require('console');
var instance = new Razorpay({
    key_id: 'rzp_test_qoL5ARjplvfe2r',
    key_secret: 'IHpzmc7dmdgx5XBIXoOtWUEs',
});


module.exports = {

    validateUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            let user = db.get().collection(collection.USER_COLLECTION).findOne({ tel: userData.number })
            resolve(user);
        })
    },

    verifyUser: (userData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ tel: userData.number });
            response.user = user;
            // response.userName = user.name;
            resolve(response);
        })
    },


    doSignUp: (userData) => {
        console.log('user data is here ',userData);
        return new Promise(async (resolve, reject) => {
            userData.userStatus = Boolean(userData.userStatus)
            userData.password = await bcrypt.hash(userData.password, 10);
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email : userData.email}||{tel : userData.tel})
            if(user){
                resolve({status : false})
            }
            else{
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (data) => {
                    // resolve(data);
                    dataDoc = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: data.insertedId });
                    dataDoc.status = true;
                    resolve(dataDoc);
                })
            }
           
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });
            if (user) {
                if (user.userStatus) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            response.user = user;
                            response.status = true;
                            resolve(response);
                        } else {
                            resolve({ status: false });
                        }
                    })
                }
                else {
                    resolve({ status: false });
                }

            } else {
                console.log("user not found !!");
                resolve({ status: false });
            }
        })
    },

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(users);
        })
    },


    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: new objectId(userId) }).then((response) => {
                resolve(response);
            })

        })
    },
    getUserAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: new objectId(userId) }).then((response) => {
                // console.log(response.addresses);
                resolve(response.addresses);
            })

        })
    },

    updateAddressDetails: (userId, addressDetails, addressId) => {
        return new Promise((resolve, reject) => {
            userId = new objectId(userId);
            addressId = new objectId(addressId);

            db.get().collection(collection.USER_COLLECTION)
                .updateOne(
                    {
                        _id: userId,
                        addresses: { $elemMatch: { _id: addressId } }
                    },
                    {
                        $set: {
                            "addresses.$.name": addressDetails.name,
                            "addresses.$.address": addressDetails.address,
                            "addresses.$.state": addressDetails.state,
                            "addresses.$.country": addressDetails.country,
                            "addresses.$.pincode": addressDetails.pincode,
                            "addresses.$.tel": Number(addressDetails.tel),
                            //    "addresses.$.type": addressDetails.type
                        }
                    }
                )
                .then((response) => {
                    resolve(response);
                }).catch(() => {
                    reject();
                })
        })
    },

    deleteAddress: (userId, addressId) => {
        return new Promise((resolve, reject) => {
            userId = new objectId(userId);
            addressId = new objectId(addressId);
            
            db.get().collection(collection.USER_COLLECTION)
                .updateOne(
                    {
                        _id: userId,
                    },
                    {
                        $pull: { addresses: { _id: addressId } }
                    }
                ).then((response) => {
                    resolve(response)
                }).catch(() => {
                    reject();
                })
        })
    },


    updateUserDetails: (userId, userDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) },
                {
                    $set: {
                        name: userDetails.name,
                        email: userDetails.email,
                        tel: userDetails.tel

                    }
                }).then((response) => {
                    resolve(response);
                })
        })
    },

    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                resolve(coupons)
            } catch (error) {
                reject(error)
            }
        })
    },



    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) }, { $set: { userStatus: false } }).then((response) => {
                resolve(response);
            });
        })
    },

    unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) }, { $set: { userStatus: true } }).then((response) => {
                resolve(response);
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


    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray();
            try {
                resolve(cartItems);
            } catch {
                resolve(null)
            }
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }
            ]).toArray();
            try {
                resolve(total[0].total);
            } catch {
                resolve(null)
            }

        })
    },


    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },


    changeProductQuantity: async (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new objectId(details.product) });
        return new Promise(async (resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: new objectId(details.cart) },
                    {
                        $pull: { products: { item: new objectId(details.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                console.log("this cart button -----", details.count)



                let cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        '$match': {
                            '_id': new objectId(details.cart)
                        }
                    }, {
                        '$unwind': {
                            'path': '$products'
                        }
                    }, {
                        '$match': {
                            'products.item': new objectId(details.product)
                        }
                    }
                ]).toArray()
                console.log("this is count of checking out of stock", cart, details.count);

                if ((product.stock - (cart[0].products.quantity + details.count)) >= 0) {
                    db.get().collection(collection.CART_COLLECTION).updateOne(
                        {
                            _id: new objectId(details.cart),
                            "products.item": new objectId(details.product),
                        },
                        {
                            $inc: { "products.$.quantity": details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true });
                    })
                }
                else {

                    console.log("false")
                    resolve({ status: false });
                }
            }
        })
    },

    removeCartProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: new objectId(details.cart) },
                {
                    $pull: { products: { item: new objectId(details.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },

    applyCoupon: (couponData, userId) => {
        return new Promise(async (resolve, reject) => {
            const today = new Date();

            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code: couponData.couponValue })
            if (coupon) {
                coupon.isValid = true
                const expirydate = new Date(coupon.expirydate)
                if (today <= expirydate) {
                    coupon.isExpired = false

                    const couponId = new objectId(coupon._id)

                    let usedCoupons = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new objectId(userId), coupons: { $in: [new objectId(couponId)] } })
                    if (usedCoupons) {
                        resolve({ errMsg: 'Coupon already used' })
                    }
                    else {
                        
                        resolve(coupon)

                    }
                } else {

                    resolve({ errMsg: 'Coupon Expired', isExpired: true })
                }

            }
            else {
                resolve({ errMsg: 'Invalid Coupon' })
            }
        })
    },

    addUsedCoupons: (couponId,userId) => {
        return new Promise(async (resolve, reject) => {
            let usedCoupons= await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) },
            { $push: { coupons: new objectId(couponId) } }
            );
            resolve(usedCoupons)
        })
    },

    myWallet : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let wallet = await db.get().collection(collection.USER_COLLECTION).findOne({_id : new objectId(userId)})
            resolve(wallet)
        })
    },

    decrementWallet : (userId,totalPrice)=>{
        return new Promise(async(resolve,reject)=>{
            let wallet = await db.get().collection(collection.USER_COLLECTION).updateOne({_id : new objectId(userId)},{ $inc: { wallet: -totalPrice } })
            resolve(wallet)
        })
    },


    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) })
            resolve(cart.products)
        })
    },

    stockDecrement: (productId, quantity) => {
        return new Promise(async (resolve, reject) => {
            let stock = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new objectId(productId) }, {
                $inc: { stock: -quantity }
            })
            resolve(stock)
            // console.log(cart);
        })
    },

    stockIncrement: (productId, quantity) => {
        console.log('productId:',productId);
        console.log('quantity:',quantity);
        return new Promise(async (resolve, reject) => {
            console.log('stock increment requested');
            let stock = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new objectId(productId) }, {
                $inc: { stock: quantity }
            })
            resolve(stock)
            // console.log(cart);
        })
    },

    getOrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: new objectId(userId) }).toArray();
            orders.forEach(order => {
                newDate = new Date();
                startDate = new Date(order.delivered_date);
                endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+14);
                if(newDate>=endDate){
                    order.noReturn=true;
                }
            });
            resolve(orders);
        })
    },


    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: new objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray();
            try {
                resolve(orderItems);
            } catch {
                resolve(null)
            }
        })

    },


    addAddress: (userId, address) => {
        address._id = new objectId();
        return new Promise(async (resolve, reject) => {
            let addressArray = [
                {
                    name: address.name,
                    address: address.address,
                    state: address.state,
                    country: address.country,
                    pincode: address.pincode,
                    tel: address.tel,
                    _id: address._id
                },
            ];
            try {
                // Find the user with the given userId
                let user = await db
                    .get()
                    .collection(collection.USER_COLLECTION)
                    .findOne({ _id: new objectId(userId) });

                if (!user) {
                    throw new Error('User not found');
                }

                // Add the address array to the user document
                let updatedUser = await db
                    .get()
                    .collection(collection.USER_COLLECTION)
                    .updateOne(
                        { _id: new objectId(userId) },
                        { $push: { addresses: { $each: addressArray } } }
                    );

                resolve(updatedUser);
            } catch (error) {
                reject(error);
            }
        });
    },


    changePassword: (userId, userData) => {
        let response = {};
        return new Promise(async (resolve, reject) => {
            userId = new objectId(userId)
            // password = new objectId(password)
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: userId });
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        // response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        resolve({ status: false });
                    }
                })
            }
        })
    },

    continuePassword: (userId, userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) },
                {
                    $set: {
                        password: userData.password,
                        password2: userData.password2
                    }
                }
            ).then((response) => {
                resolve(response)
            })
        })
    },


    checkOut: (userId, order, products, totalPrice) => {
        return new Promise(async (resolve, reject) => {
            order.totalAmount = Number(totalPrice);
            let UserDetails = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: new objectId(userId)
                    }
                }, {
                    $unwind: {
                        path: "$addresses"
                    }
                }, {
                    $match: {
                        "addresses._id": new objectId(order.addressId)
                    }
                }
            ]).toArray();

            let status = order['payment-method'] == 'COD' || 'WALLET' ? 'PLACED' : 'PENDING'
            let orderObj = {
                deliveryDetails: {
                    name: UserDetails[0].addresses.name,
                    tel: UserDetails[0].addresses.tel,
                    address: UserDetails[0].addresses.address,
                    state: UserDetails[0].addresses.state,
                    country: UserDetails[0].addresses.country,
                    pincode: UserDetails[0].addresses.pincode
                },
                userId: new objectId(userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: totalPrice,
                status: status,

                date: new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                resolve(response.insertedId)
            })
        })
    },

    deleteCart: (userId) => {
        db.get().collection(collection.CART_COLLECTION).deleteOne({ user: new objectId(userId) })
    },


    getWishlist: async (userId) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    '$match': {
                        'user': new objectId(userId)
                    }
                }, {
                    '$lookup': {
                        'from': 'product',
                        'localField': 'products.item',
                        'foreignField': '_id',
                        'as': 'proDetails'
                    }
                }
            ]).toArray();
            try {

                resolve(result[0].proDetails);
            } catch {
                resolve(null)
            }
        })
    },


    addToWishlist: (userId, proId) => {
        let productObj = {
            item: new objectId(proId)
        }

        return new Promise(async (resolve, reject) => {
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: new objectId(userId) })
            if (wishlist) {

                let proExist = wishlist.products.findIndex(product => product.item == proId)


                if (proExist != -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: new objectId(userId) },
                        {
                            $pull: { products: { item: new objectId(proId) } }
                        }).then((response) => {
                            resolve({ removeProduct: true })
                        })


                } else {

                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: new objectId(userId) },
                        {
                            $push: { products: productObj }
                        }
                    ).then(() => {
                        resolve({ addProduct: true })
                    })
                }
            }
            else {
                let wishObj = {
                    user: new objectId(userId),
                    products: [productObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((response) => {
                    try {
                        resolve({ addProduct: true })
                    } catch (err) {
                        resolve(0)
                    }
                })
            }
        })
    },
    getWishlistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            //console.log(cartItems[0].products)

            resolve(wishItems)
        })
    },


    addToCart: async (proId, userId) => {
        let proObj = {
            item: new objectId(proId),
            quantity: 1,

        };

        let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new objectId(proId) });
        console.log("this is products from change products quantity-----", product)

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
                    let cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
                        {
                            '$match': {
                                'user': new objectId(userId)
                            }
                        }, {
                            '$unwind': {
                                'path': '$products'
                            }
                        }, {
                            '$match': {
                                'products.item': new objectId(proId)
                            }
                        }
                    ]).toArray()
                    if ((product.stock - (cart[0].products.quantity + 1)) >= 0) {

                        db.get().collection(collection.CART_COLLECTION).updateOne(
                            {
                                user: new objectId(userId),
                                "products.item": new objectId(proId),
                            },
                            {
                                $inc: { "products.$.quantity": 1 },
                            }
                        ).then(() => {
                            resolve({ status: true });
                        });
                    }
                    else {
                        console.log('out of stock');
                        resolve({ status: false })
                    }
                } else {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            { user: new objectId(userId) },
                            { $push: { products: proObj } }
                        )
                        .then(() => {
                            resolve({ status: true });
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
                        resolve({ status: true });
                    });

            }

        });
    },


    removeWishlistProduct: (userId, productId) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: new objectId(userId) },
                {
                    $pull: { products: { item: new objectId(productId) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },


    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                } else {
                    resolve(order)
                }
            });

        })
    },


    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'IHpzmc7dmdgx5XBIXoOtWUEs');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },


    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne(
                {
                    _id: new objectId(orderId)
                },
                {
                    $set: {
                        status: 'PLACED'
                    }
                }
            ).then(() => {
                resolve()
            })
        })
    }


}