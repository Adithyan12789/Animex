const Product = require("../models/products");
const Category = require("../models/category");
const fs = require("fs")


const addProducts = async (req, res) => {
    try {

        const images = req.files.map(file => file.filename);
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            stock: req.body.stock,
            image: images
        });

        await product.save();

        req.session.message = {
            type: "success",
            message: "Product Added Successfully!"
        };
        res.redirect("/adminProductPage");
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: error.message, type: "danger" });
    }
};


const unpublishProducts = async (req,res) => {
    const id = req.params.id;
    try {
      await Product.findByIdAndUpdate(id, { isPublished: false });
      res.redirect('/adminProductPage');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
}

const publishProducts = async (req,res) => {
    const id = req.params.id;
    try {
      await Product.findByIdAndUpdate(id, { isPublished: true });
      res.redirect('/adminProductPage');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
}




// Controller function to render products pag

// const getProducts = async (req, res) => {
//     try {
//         const products = await Product.find();
//         res.render("admin/page-products-grid", { title: "Product Page", products: products });
//     } catch (error) {
//         console.error("Error fetching products:", error);
//         res.status(500).send("Error fetching products");
//     }
// };


const getProducts = async (req, res) => {
    const perPage = 4; 
    const page = req.query.page || 1;
    try {
        const totalProducts = await Product.countDocuments();

        const products = await Product.find().populate("category")
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const totalPages = Math.ceil(totalProducts / perPage);

        res.render("admin/page-products-grid", {
            title: "Product Page",
            products: products,
            totalPages: totalPages,
            currentPage: page,
            perPages: perPage
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).render("error", { message: "Error fetching products" });
    }
};

const getPagination = async (req, res) => {
    const perPage = 4; 
    const page = req.query.page || 1;
    try {
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / perPage);

        const products = await Product.find().populate("category")
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            console.error("No products found");
            return res.status(404).render("error", { message: "No products found" });
        }

        

        res.render("admin/page-products-grid", {
            title: "Product Page",
            products: products,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).render("error", { message: "Error fetching products" });
    }
};





const createProduct =async (req, res) => {
    const catergories = await Category.find()

    res.render("admin/adminAddProduct", { title: "Add-Products",category: catergories });
};

const editProduct = async (req, res) => {
    try {
      const id = req.params.id;
      const productDetails = await Product.findById(id)
      const catergories = await Category.find()
      if (!productDetails) {
        return res.status(404).render("error", { message: "Product not found" });
      }
      res.render("admin/adminEditProducts", { product: productDetails, category: catergories });
    } catch (error) {
      console.error("Error editing product:", error);
      res.status(500).render("error", { message: "Error editing product" });
    }
  };

  //
  

  const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const newImages = req.files.map(file => file.filename);

        // Assuming req.body.category contains the name of the category
        const categoryName = req.body.category;
        
        // Find the category document based on its name
        const category = await Category.findOne({ name: categoryName });

        // Prepare the product update object
        const productUpdate = {
            name: req.body.name,
            description: req.body.description,
            category: category ? category._id : null, // Assign category ID or null if not found
            price: req.body.price,
            stock: req.body.stock
        };

        if (newImages.length > 0) {
            productUpdate.image = newImages;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, productUpdate, { new: true });

        req.session.message = { type: "success", message: "Product Updated Successfully" };
        res.redirect("/adminProductPage");
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server Error" });
    }
};






module.exports = {
    getPagination,
    createProduct,
  addProducts,
  getProducts,
  editProduct,
  updateProduct,
  unpublishProducts,
  publishProducts 
}
