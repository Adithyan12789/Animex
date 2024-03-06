const Category = require("../models/category");


//Category Page

// const addCategoriesLoad = async (req, res) => {
//   try {
//       const categories = await Category.find();
//       res.render('adminAddCategories', { categories });
//   } catch (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//   }
// };

// // Add new category
const CategoriesRoute = async function(req, res) {
    try {
        const categories = await Category.find();
        res.render('admin/adminCategories', { categories: categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Internal Server Error");
    }
  };
  

  const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.render("admin/adminAddCategory",{categories});
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

  const addCategories = async (req, res) => {
    try {
        if (req.session.admin) {
            const newCategoryName = req.body.name;
            const newCategoryDescription = req.body.description;

            const existingCategory = await Category.findOne({ name: newCategoryName });
            if (existingCategory) {
                res.render('admin/adminAddCategory', {
                    categories: await Category.find(),
                    errorMessage: 'Category already exists.'
                });
            } else {
                const newUser = await Category.create({ name: newCategoryName, description: newCategoryDescription });
                res.redirect('/adminPageCategories');
            }
        } else {
            res.redirect('/adminlogin');
        }
    } catch (error) {
        console.log(error.message);
    }
};




  
  const getEditCategory = async (req,res)=>{
    if(req.session.admin){
      const id = req.query.categoryid
     const getCategorydetails = await Category.findById(id)
      res.render("admin/adminEditCategories",{editCategory:getCategorydetails})
  
    }
    else{
      res.redirect("/adminlogin")
    }
  }
  
  const postEditCategory = async (req, res) => {
    try {
        if (req.session.admin) {
            const id = req.body.id;
            const name = req.body.name;
            const description = req.body.description;


            const existingCategory = await Category.findOne({ name: name, _id: { $ne: id } });
            if (existingCategory) {
                res.render('admin/adminEditCategories', {
                    editCategory: await Category.findById(id),
                    message: 'Category name already exists.'
                });
            } else {
                const updatedCategory = await Category.findByIdAndUpdate(id, { $set: { name: name, description: description } });
                res.redirect('/adminPageCategories');
            }
        } else {
            res.redirect('/adminlogin');
        }
    } catch (error) {
        console.log(error.message);
    }
};

  
  
  
const unlistCategories = async (req,res) => {
  const list = req.params.list;
  try {
    await Category.findByIdAndUpdate(list, { isListed: false });
    res.redirect('/adminPageCategories');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

const listCategories = async (req,res) => {
  const list = req.params.list;
  try {
    await Category.findByIdAndUpdate(list, { isListed: true }); 
    res.redirect('/adminPageCategories');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}


  module.exports = {
    CategoriesRoute,                                                                                                                                                                                                                                                                                                                                                                                                         
  getCategories,
  addCategories,
  getEditCategory,
  postEditCategory,
  unlistCategories,
  listCategories
  }