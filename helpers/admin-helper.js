var db = require('../config/connection')
var collection = require('../config/connections')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
const { ObjectId } = require('mongodb')
const { resolve, reject } = require('promise')


module.exports = {
    adminLoggin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.email })
            console.log('admin here', admin);
            if (admin) {
                bcrypt.compare(adminData.password, admin.Password).then((status) => {
                    if (status) {
                        console.log('admin login success');
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('admin login failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('nooooooooooo');
                resolve({ status: false })
            }
        })
    },
    getUserOrder: () => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION)

                .find().toArray()
            resolve(order)


        })
    },
    getOrderProduct: () => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([


                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        quantity: '$products.quantity',
                        totalAmount: '$totalAmount',
                        status: '$status',
                        paymentMethod: '$paymentMethod',
                        mobile: '$deliveryDetails.mobile',
                        fname: '$deliveryDetails.fname',
                        address: '$deliveryDetails.address',
                        pincode: '$deliveryDetails.pincode'

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
                        item: 1,
                        quantity: 1,
                        totalAmount: 1,
                        paymentMethod: 1,
                        status: 1,
                        mobile: 1,
                        fname: 1,
                        address: 1,
                        pincode: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(orderItems)
            console.log('user ordered', orderItems);
        })
    },
    updateStatus: (orderId, orderDetails) => {
        console.log('update stataus called');
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ status:orderDetails })
            if (order){
                reject('you cant same status')
            }else{
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
                {
                    $set:{'status':orderDetails.status}
                }
                ).then(()=>{
                    resolve()
                })
            }
        })
    }

}