const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { resolve } = require('path');
const objectId=require('mongodb-legacy').ObjectId;


module.exports={

    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{
                $lookup : {
                    from: 'category',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryname'
                  }
            }]).toArray();
            resolve(products);
        })
    },

    getAdminOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $lookup : {
                        from : collection.USER_COLLECTION,
                        localField : 'userId',
                        foreignField : '_id',
                        as : 'userDetails'
                    }

            }
        ]).toArray();
            resolve(orders);
        })
    }

}