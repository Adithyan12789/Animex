const Brand = require("../models/brand");
const Product = require("../models/products");
const Category = require("../models/category");
const Order = require("../models/order");


const bestProduct = async function(req, res) {
    try {
      const bestSellingProducts = await Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalQuantity: { $sum: '$items.quantity' },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }, 
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $project: {
            _id: '$product._id',
            productTitle: '$product.name',
            productStock: '$product.stock',
            totalQuantity: 1,
          },
        },
      ]);


        res.render('admin/bestProduct', { product: bestSellingProducts });
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).send("Internal Server Error");
    }
  };


  
  const bestCategory = async function(req, res) {
    try {

        const bestSellingCategories = await Order.aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            totalQuantity: { $sum: '$items.quantity' },
          },
        },
        {
          $sort: { totalQuantity: -1 },
        },
        {
          $limit: 10, 
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $project: {
            _id: '$category._id',
            category: '$category.name',
            totalQuantity: 1,
          },
        },
      ]);


        res.render('admin/bestCategory', { category: bestSellingCategories });
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).send("Internal Server Error");
    }
  };
  
  const bestBrand = async function(req, res) {
    try {

      const bestSellingBrands = await Order.aggregate([
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'product',
            },
        },
        { $unwind: '$product' },
        {
            $group: {
                _id: '$product.brand',
                totalQuantity: { $sum: '$items.quantity' },
            },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'brands',
                localField: '_id',
                foreignField: '_id',
                as: 'brand',
            },
        },
        { $unwind: '$brand' },
        {
            $project: {
                _id: '$brand._id',
                brandName: '$brand.name',
                totalQuantity: 1,
            },
        },
    ]);

        res.render('admin/bestBrand', { brand: bestSellingBrands});
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).send("Internal Server Error");
    }
  };


  module.exports = {
    bestProduct,   
    bestCategory,
    bestBrand
  }