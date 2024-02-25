// models/user.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
     type: String,
     required: true 
    },
  description: {
     type: String,
     required: true 
    },
    isListed: {
      type: Boolean,
      default: true,
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
