const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const objectId=require('mongodb-legacy').ObjectId;

module.exports={

    addCategory :(categorydata)=>{
        categorydata.status=true;
        return new Promise(async(resolve,reject)=>{     
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categorydata).then((data)=>{
                resolve(data);
            })
        })
    },

    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
            resolve(categories);
        })
    },

    listCategory : (categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:new objectId(categoryId)},{ $set: { status: true } }).then((response) => {
              resolve(response);
              console.log(response);
            });
        })
    },


    unlistCategory : (categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:new objectId(categoryId)},{ $set: { status: false } }).then((response) => {
              resolve(response);
              console.log(response);
            });
        })
    },

}