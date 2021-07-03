const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
    title: {
        required: true,
        type: String
    },
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)