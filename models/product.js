const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['shoes', 'dresses', 'shirt', 'jacket', 'pants'],
    },
    imageUrl: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Product', productSchema);