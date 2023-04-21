const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { resolve } = require('path');
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

    getCategoryName:(categoryId)=>{
        return new Promise(async(resolve,reject)=>{
        try{
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id : new objectId(categoryId)})
            resolve(category.name);
        }
        catch(error){
            reject(error)
        }
        })
    },

    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
        try{
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
            resolve(categories);
        }
        catch(error){
            reject(error)
        }
        })
    },

    getAllUserCategory:(filter = {status:true})=>{
        return new Promise(async(resolve,reject)=>{
        try{
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find(filter).toArray();
            resolve(categories);
        }
        catch(error){
            reject(error)
        }
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


    getCategoryDetails:(categoryId)=>{
        // let productId=req.params.id;
        return new Promise((resolve,reject)=>{
            // console.log(proId);
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id: new objectId(categoryId)}).then((category)=>{
                resolve(category);
            })
        })
    },

    updateCategory : (categoryId,categoryDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:new objectId(categoryId)},
            {$set:{
                name: categoryDetails.name
               
            }}).then((response)=>{
                resolve(response);
            })
        })
    }

}