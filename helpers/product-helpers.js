const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { log } = require('console');
const { text } = require('stream/consumers');
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

    getAllUserProducts : (currentPage,filter = {status:true}) => {
        const page = parseInt(currentPage);
        const limit = 6
        const skip = (page - 1) * limit;
        return new Promise(async (resolve, reject) => {
            try {
                const products = await db.get().collection(collection.PRODUCT_COLLECTION).find(filter) .limit(limit)
                .skip(skip)
                .toArray();
                resolve(products)
            } catch (error) {
                reject(error)
            }
        })
    },

    productSearch : (text)=>{
        return new Promise(async(resolve,reject)=>{
            let searchProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find({ name: {$regex: new RegExp( text.search , 'i')}}).toArray()
            resolve(searchProducts)
        })
    },

    getProductCount: ()=>{
        return new Promise(async(resolve,reject)=>{
            let productCount = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments()
            resolve(productCount);
        })
    },


    getFilterByCategory : (categoryId)=>{
        return new Promise(async (resolve, reject) => {
           
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
               
                resolve(category[0].filteredProducts);
            } catch (error) {
                reject(error)
            }
        })
    },

    getFilterByPrice : (price)=>{
        return new Promise(async (resolve, reject) => {
          
            try {
                const products = await db.get().collection(collection.PRODUCT_COLLECTION).find({price: {$lte:price}}).toArray()
                resolve(products)
                
            } catch (error) {
                reject(error)
            }
        })
    },

    filterPrice: (minPrice,maxPrice,searchValue)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({
                    $and: [
                        { price: {$gte: parseInt(minPrice)}},
                        { price: {$lte: parseInt(maxPrice)}}
                    ],
                    
                }).toArray();
                resolve(products);
            }catch{
                resolve(null);
            }
        })
    },

    categoryPriceFilter: (minPrice,maxPrice,catId)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                 minPrice = parseInt(minPrice)
                 maxPrice = parseInt(maxPrice)
                const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .aggregate([
                    {
                      $match: {
                        category: new objectId(catId)
                      }
                    },
                    {
                      $match: {
                        price: { $gte: minPrice, $lte: maxPrice }
                      }
                    }
                  ]).toArray();
                resolve(products);
            }catch{
                resolve(null);
            }
        })
    },

    lowHighPrice : ()=>{
        return new Promise(async(resolve,reject)=>{
           let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({price:1}).toArray();
           console.log(products);
           resolve(products)
        })
    },

    highLowPrice : ()=>{
        return new Promise(async(resolve,reject)=>{
           let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({price:-1}).toArray();
           resolve(products)
        })
    },

    categoryHighLowPrice : (categoryId)=>{
        return new Promise(async(resolve,reject)=>{
           let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category : new objectId(categoryId)}).sort({price:-1}).toArray();
           resolve(products)
        })
    },

    categoryLowHighPrice : (categoryId)=>{
        return new Promise(async(resolve,reject)=>{
           let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category : new objectId(categoryId)}).sort({price:1}).toArray();
           resolve(products)
        })
    },

    addProduct:(products,callback)=>{
        products.price=parseInt(products.price)
        products.quantity=parseInt(products.quantity)
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
        return new Promise(async(resolve,reject)=>{
            productDetails.price=parseInt(productDetails.price)
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(productId)},
            {$set:{
                name: productDetails.name,
                code: productDetails.code,
                description: productDetails.description,
                price: productDetails.price,
                category: new objectId(productDetails.category),
                stock : parseInt(productDetails.stock)
            }}).then((response)=>{
                resolve(response);
            })
        })
    },
        
    

    listProduct : (productId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(productId)},{ $set: { status: true } }).then((response) => {
              resolve(response);
              
            });
        })
    },

    unlistProduct : (productId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(productId)},{ $set: { status: false } }).then((response) => {
              resolve(response);
              
            });
        })
    },

}