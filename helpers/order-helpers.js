const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { resolve } = require('path');
const { response } = require('../app');
const objectId = require('mongodb-legacy').ObjectId;


module.exports = {

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{
        $lookup: {
          from: 'category',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryname'
        }
      }]).toArray();
      resolve(products);
    })
  },

  getAdminOrders: () => {
    return new Promise(async (resolve, reject) => {

      let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $lookup: {
            from: collection.USER_COLLECTION,
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails'
          }

        }
      ]).toArray();
      resolve(orders);
    })
  },

  getAllDeliveredOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).
        aggregate([
          {
            $match: { status: "DELIVERED" }
          },
          {
            $lookup: {
              from: collection.USER_COLLECTION,
              localField: 'userId',
              foreignField: '_id',
              as: 'userDetails'
            }

          },
        ]).toArray();
      resolve(orders);
    })
  },

  filterByDate: async (fromDate, toDate) => {
    return new Promise(async (resolve, reject) => {
      let filteredOrders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { status: "DELIVERED" }
        },
        {
          $match: {
            date: {
              $gte: fromDate,
              $lte: toDate
            }
          }
        },
        {
          $lookup: {
            from: collection.USER_COLLECTION,
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails'
          }
        }
      ]).toArray();
      resolve(filteredOrders);
    });
  },

  viewOrderDetails: async (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: new objectId(orderId) })
      resolve(orderDetails)
    })

  },


  orderProductDetails: async (orderId) => {
    return new Promise(async (resolve, reject) => {
      let productDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            '_id': new objectId(orderId)
          }
        }, {
          $unwind: {
            path: '$products'
          }
        }, {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        }, {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]).toArray();
      try {
        resolve(productDetails);
      } catch {
        resolve(null)
      }
    })
  },

  shipOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new objectId(orderId) }, { $set: { status: 'SHIPPED' } }).then((response) => {
        resolve(response);

      });
    })
  },

  deliverOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION)
        .updateOne(
          {
            _id: new objectId(orderId)
          },
          {
            $set: {
              status: 'DELIVERED',
              delivered_date: new Date()
            }
          })
        .then((response) => {
          resolve(response);
        });
    })
  },



  returnAcceptOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new objectId(orderId) }, { $set: { status: 'RETURNED' } }).then((response) => {
        resolve(response);
      });
      let total = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: new objectId(orderId) })
      resolve(total.totalAmount);
      let totalAmount = total.totalAmount

      let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: new objectId(orderId) })
      let userId = order.userId
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new objectId(userId) });
      if (user.wallet) {
        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) }, { $inc: { wallet: totalAmount } })
      }
      else {
        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) }, { $set: { wallet: totalAmount } })
      }

      let productId = order.products[0].item
      // console.log('this is productid : ',productId);
    })
  },


  cancelOrder: async (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new objectId(orderId) }, { $set: { status: 'CANCELLED' } }).then(async (response) => {
        resolve(response);

        let total = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: new objectId(orderId) })
        resolve(total.totalAmount);
        let totalAmount = total.totalAmount

        let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: new objectId(orderId) })
        let userId = order.userId
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new objectId(userId) });
        if (order.paymentMethod != "COD") {
          if (user.wallet) {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) }, { $inc: { wallet: totalAmount } })
          }
          else {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) }, { $set: { wallet: totalAmount } })
          }
        }
      });
    })
  },

  returnRequestOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new objectId(orderId) }, { $set: { status: 'REQUESTED' } }).then((response) => {
        resolve(response);
      });
    })
  },

  returnOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new objectId(orderId) }, { $set: { status: 'RETURNED' } }).then((response) => {
        resolve(response);
      });
    })
  },

  getAllCoupons: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray();
        resolve(coupons);
      }
      catch (error) {
        reject(error)
      }
    })
  },

addCoupon: (coupondata) => {
    // coupondata.status=true;
    console.log('this is coupon data');
    coupondata.disamount = parseInt(coupondata.disamount)
    let couponName = coupondata.name
    let couponCode = coupondata.code
    return new Promise(async (resolve, reject) => {
      let couponExist = await db.get().collection(collection.COUPON_COLLECTION).findOne({$or : [
       { name : couponName},
       {code : couponCode}
      ]})
      if(couponExist){
        resolve({status : false})
      }
      else{
      db.get().collection(collection.COUPON_COLLECTION).insertOne(coupondata).then((response) => {
        response.status = true
        resolve(response);
      })
    }
    })
  },

  getCouponDetails:(couponId)=>{
    // let productId=req.params.id;
    return new Promise((resolve,reject)=>{
        // console.log(proId);
        db.get().collection(collection.COUPON_COLLECTION).findOne({_id: new objectId(couponId)}).then((coupon)=>{
            resolve(coupon);
        })
    })
  },

  updateCoupon : (couponId,couponDetails)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:new objectId(couponId)},
        {$set:{
            name: couponDetails.name,
            code: couponDetails.code,
            disamount: couponDetails.disamount,
            expirydate: couponDetails.expirydate
           
        }}).then((response)=>{
            resolve(response);
        })
    })
  },

  deleteCoupon :(couponId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id : new objectId(couponId)}).then((response)=>{
        resolve(response)
      })
    })
  },

  dailySales: async (today) => {
    return new Promise(async (resolve, reject) => {
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find({
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        }, status: 'DELIVERED'
      }).toArray();
      resolve(orders)

    })
  },

  weeklySales: async (today) => {
    return new Promise(async (resolve, reject) => {
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find({
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        }, status: 'DELIVERED'
      }).toArray();
      resolve(orders)

    })
  },

  monthlySales: async (today) => {
    return new Promise(async (resolve, reject) => {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find({
        date: {
          $gte: startOfMonth,
          $lt: endOfMonth
        }, status: 'DELIVERED'
      }).toArray();
      resolve(orders)

    })
  },

  deliverGraph : () =>{
    return new Promise(async(resolve, reject) =>{
      let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            status: 'DELIVERED'
          }
        },{
          $group: {
            _id: { $month: "$date" },
            count: { $sum: 1 }
          }
        }
      ]).toArray();
      resolve(result);
    })
  },

  ordersGraph : () =>{
    return new Promise(async(resolve, reject) =>{
      let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } } 
      ]).toArray();
      resolve(result);
    })

  }

}