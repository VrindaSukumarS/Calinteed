const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const objectId=require('mongodb-legacy').ObjectId;


module.exports={

    getAllProducts:()=>{
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

    getAllUserProducts : (filter = {status:true}) => {
        return new Promise(async (resolve, reject) => {
            try {
                const products = await db.get().collection(collection.PRODUCT_COLLECTION).find(filter).toArray()
                resolve(products)
            } catch (error) {
                reject(error)
            }
        })
    },


    getFilterByCategory : (categoryId)=>{
        return new Promise(async (resolve, reject) => {
            console.log(categoryId);
            try {
                const category = await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([
                    {
                      '$match': {
                        '_id': new objectId(categoryId)
                      }
                    }, {
                      '$lookup': {
                        'from': 'product', 
                        'localField': '_id', 
                        'foreignField': 'category', 
                        'as': 'filteredProducts'
                      }
                    }, {
                      '$project': {
                        'filteredProducts': 1, 
                        '_id': 0
                      }
                    }
                  ]).toArray()
                console.log(category[0].filteredProducts);
                resolve(category[0].filteredProducts);
            } catch (error) {
                reject(error)
            }
        })
    },

    getFilterByPrice : (price)=>{
        return new Promise(async (resolve, reject) => {
            console.log(price);
            try {
                const products = await db.get().collection(collection.PRODUCT_COLLECTION).find({price: {$lte:price}}).toArray()
                resolve(products)
                console.log(products);
            } catch (error) {
                reject(error)
            }
        })
    },

    addProduct:(products,callback)=>{
        products.price=parseInt(products.price)
        products.category=new objectId(products.category)
        products.status=true;
        return new Promise(async(resolve,reject)=>{
            
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(products).then((data)=>{
                callback(data.insertedId)
                resolve(data);
            })
        })
    },

    addImage:( productId,imageUrls)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(productId)},{$set : {imagefield:imageUrls}}).then((data)=>{
                resolve(data);
            })
        })
    },

    getProductDetails:(productId)=>{
        // let productId=req.params.id;
        return new Promise((resolve,reject)=>{
            // console.log(proId);
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: new objectId(productId)}).then((product)=>{
                resolve(product);
            })
        })
    },

    updateProduct:(productId,productDetails)=>{
        // let productId=req.params.id;
        return new Promise((resolve,reject)=>{
            productDetails.price=parseInt(productDetails.price)
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(productId)},
            {$set:{
                name: productDetails.name,
                code: productDetails.code,
                description: productDetails.description,
                price: productDetails.price
            }}).then((response)=>{
                resolve(response);
            })
        })
    },
        
    

    listProduct : (productId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(productId)},{ $set: { status: true } }).then((response) => {
              resolve(response);
              console.log(response);
            });
        })
    },

    unlistProduct : (productId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(productId)},{ $set: { status: false } }).then((response) => {
              resolve(response);
              console.log(response);
            });
        })
    },

}