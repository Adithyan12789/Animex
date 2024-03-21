const Brand = require("../models/brand");


const BrandRoute = async function(req, res) {
    try {
        const brands = await Brand.find();
        res.render('admin/adminBrand', { brand: brands });
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).send("Internal Server Error");
    }
  };
  

  const getBrand = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.render("admin/adminAddBrand",{brands});
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

  const addBrand = async (req, res) => {
    try {
        if (req.session.admin) {
            const newBrandName = req.body.name;
            const newBrandDescription = req.body.description;

            const existingBrand = await Brand.findOne({ name: { $regex: new RegExp('^' + newBrandName + '$', 'i') } });
            if (existingBrand) {
                res.render('admin/adminAddBrand', {
                    categories: await Category.find(),
                    errorMessage: 'Brand is already exists.'
                });
            } else {
                const newUser = await Brand.create({ name: newBrandName, description: newBrandDescription });
                res.redirect('/adminPageBrand');
            }
        } else {
            res.redirect('/adminlogin');
        }
    } catch (error) {
        console.log(error.message);
    }
};

  
  const getEditBrand = async (req,res)=>{
    if(req.session.admin){
      const id = req.query.brandid
     const getBranddetails = await Brand.findById(id)
      res.render("admin/adminEditBrand",{editBrand:getBranddetails})
  
    }
    else{
      res.redirect("/adminlogin")
    }
  }
  
  const postEditBrand = async (req, res) => {
    try {
        if (req.session.admin) {
            const id = req.body.id;
            const name = req.body.name;
            const description = req.body.description;

            const existingBrand = await Brand.findOne({ name: name, _id: { $ne: id } });
            if (existingBrand) {
                res.render('admin/adminEditBrand', {
                    editBrand: await Brand.findById(id),
                    message: 'Brand name already exists.'
                });
            } else {
                const updatedBrand = await Brand.findByIdAndUpdate(id, { $set: { name: name, description: description } });
                res.redirect('/adminPageBrand');
            }
        } else {
            res.redirect('/adminlogin');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};


  
  
  
const unlistBrand = async (req,res) => {
  const list = req.params.list;
  try {
    await Brand.findByIdAndUpdate(list, { isListed: false });
    res.redirect('/adminPageBrand');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

const listBrand = async (req,res) => {
  const list = req.params.list;
  try {
    await Brand.findByIdAndUpdate(list, { isListed: true }); 
    res.redirect('/adminPageBrand');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}


  module.exports = {
    BrandRoute,                                                                                                                                                                                                                                                                                                                                                                                                         
    getBrand,
    addBrand,
    getEditBrand,
    postEditBrand,
    unlistBrand,
    listBrand
  }