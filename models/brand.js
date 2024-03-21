// models/user.js
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
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

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
