const Address = require("../models/address");

const addressManagement = async (req,res) => {
    try {
        // Fetch addresses from the database
        const addresses = await Address.find();

        // Render the addressManagement view and pass the addresses data
        res.render("user/addressManage", { address: addresses });
    } catch (error) {
        console.error("Error rendering address management page:", error);
        res.status(500).json({ message: "Internal server error" });
    }
  }

const addAddressPage = async (req, res) => {
    try {
        const addresses = await Address.find();
        console.log(addresses)
        res.render('user/addAddress', { users: addresses });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).send("Internal Server Error");
    }
};

const postAddAddressPage = async (req, res) => {
    try {
        const address = new Address({
            name: req.body.name,
            phone: req.body.phone,
            address1: req.body.address1,
            address2: req.body.address2,
            state: req.body.state,
            city: req.body.city,
            postalCode: req.body.postalCode,
            country: req.body.country,
        });

        await address.save();

        req.session.message = {
            type: "success",
            message: "Address Added Successfully!"
        };
        res.redirect("/addressManage");
    } catch (error) {
        console.error("Error adding Address:", error);
        res.status(500).json({ message: error.message, type: "danger" });
    }
};
  
const editAddressPage = async (req, res) => {
    try {
      const id = req.params.id;
      const addressDetails = await Address.findById(id)
      console.log(addressDetails)
      if (!addressDetails) {
        return res.status(404).render("error", { message: "Product not found" });
      }
      res.render("user/editAddress", { address: addressDetails});
    } catch (error) {
      console.error("Error editing product:", error);
      res.status(500).render("error", { message: "Error editing product" });
    }
  };

  //
  

  const updateAddress = async (req, res) => {
    try {
        const id = req.params.id;
        const addressName = req.body.address1;
        const address = await Address.findOne({ name: addressName });

        const addressUpdate = {
            name: req.body.name,
            phone: req.body.phone,
            address1: req.body.address1,
            address2: req.body.address2,
            state: req.body.state,
            city: req.body.city,
            postalCode: req.body.postalCode,
            country: req.body.country,
        };

        const updatedProduct = await Address.findByIdAndUpdate(id, addressUpdate, { new: true });

        req.session.message = { type: "success", message: "Address Updated Successfully" };
        res.redirect("/addressManage");
    } catch (error) {
        console.error("Error updating Address:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteAddressPage = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedAddress = await Address.findByIdAndDelete(id);
        
        if (!deletedAddress) {
            return res.render("user/addressManage", { message: "Address not found" });
        }

        return res.render("user/addressManage", { message: "Address deleted successfully", address: deletedAddress });
    } catch (error) {
        console.error("Error deleting address:", error);
        return res.status(500).render("error", { message: "Internal server error" });
    }
}




module.exports = {
    addressManagement,
    addAddressPage,
    postAddAddressPage,
    editAddressPage,
    updateAddress,
    deleteAddressPage
};
