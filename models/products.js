// models/user.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
     type: String,
     required: true 
    },
  description: {
     type: String,
     required: true 
    },
  category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true ,
    },
  price: {
      type: String,
      required: true 
    },
  stock: {
      type: Number,
      required: true 
    },

  image: [String],

    created: {
      type: Date,
      required: true,
      default: Date.now,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
