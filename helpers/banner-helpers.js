const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const objectId=require('mongodb-legacy').ObjectId;


module.exports={

    getAllBanners:()=>{
        return new Promise(async(resolve,reject)=>{
        try{
            let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray();
            resolve(banners);
        }
        catch(error){
            reject(error)
        }
        })
    },

    addBanner:(banner,callback)=>{
        banner.active=false;
        return new Promise(async(resolve,reject)=>{
            
            db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((data)=>{
                callback(data.insertedId)
                resolve(data);
            })
        })
    },

    addImage:( bannerId,result)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:new objectId(bannerId)},{$set : {image:result}}).then((data)=>{
                resolve(data);
            })
        })
    },

    getBannerDetails:(bannerId)=>{
        // let productId=req.params.id;
        return new Promise((resolve,reject)=>{
            // console.log(proId);
            db.get().collection(collection.BANNER_COLLECTION).findOne({_id: new objectId(bannerId)}).then((banner)=>{
                resolve(banner);
            })
        })
    },

    updateBanner : (bannerId,bannerDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:new objectId(bannerId)},
            {$set:{
                name: bannerDetails.name
               
            }}).then((response)=>{
                resolve(response);
            })
        })
    },

    activateBanner : (bannerId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).updateMany({},{ $set: { active: false } }).then((response) => {
                db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:new objectId(bannerId)},{ $set: { active: true } }).then((response) => {
                resolve(response);
                console.log(response);
                });
            })
        })
    },

    deleteBanner :(bannerId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id : new objectId(bannerId)}).then((response)=>{
            resolve(response)
          })
        })
      },

}