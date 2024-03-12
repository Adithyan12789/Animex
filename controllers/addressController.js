const Address = require("../models/address");



const addAddressPage = async (req, res) => {
  try {
    const userId = req.session.userID;
    const address = await Address.find({ userId });
    res.render("user/addAddress", { address });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).send("Internal Server Error");
  }
};

const postAddAddressPage = async (req, res) => {
  try {
    const userId = req.session.userID;
    const newAddress = { ...req.body };
    let userAddress = await Address.findOne({ userId });

    if (!userAddress) {
      userAddress = new Address({ userId, addressDetails: [] });
    }

    userAddress.addressDetails.push(newAddress);
    await userAddress.save();

    req.session.message = {
      type: "success",
      message: "Address Added Successfully!",
    };
    res.redirect("/addressManage");
  } catch (error) {
    console.error("Error adding Address:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const editAddressPage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userID;
    const userAddress = await Address.findOne({ userId });
    console.log(userAddress)

    if (!userAddress) {
      return res.status(404).render("user/addressManage", { message: "Address not found" });
    }

    const address = userAddress.addressDetails.find((addr) => addr._id.toString() === id);

    console.log(address)  

    if (!address) {
      return res.status(404).render("user/addressManage", { message: "Address not found" });
    }

    const addressExists = userAddress.addressDetails.some(addr => {
      return (
        addr.address1 === req.body.address1 &&
        addr.address2 === req.body.address2 &&
        addr.state === req.body.state &&
        addr.city === req.body.city &&
        addr.postalCode === req.body.postalCode &&
        addr.country === req.body.country &&
        addr._id.toString() !== id
      );
    });

    if (addressExists) {
      return res.status(400).render("user/editAddress", { 
        address, 
        user: req.session.user,
        errorMessage: "Address already exists." 
      });
    }

    res.render("user/editAddress", { address, user: req.session.user });
  } catch (error) {
    console.error("Error editing address:", error);
    res.status(500).render("error", { message: "Internal server error" });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userID;
    const addressUpdate = { ...req.body };

    const updatedAddress = await Address.findOneAndUpdate(
      { userId, "addressDetails._id": id },
      { $set: { "addressDetails.$": addressUpdate } },
      { new: true }
    );

    if (!updatedAddress) {
      console.error("Address not found for update");
      return res.status(404).json({ message: "Address not found for update." });
    }

    req.session.message = {
      type: "success",
      message: "Address Updated Successfully",
    };
    res.redirect("/addressManage");
  } catch (error) {
    console.error("Error updating Address:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteAddressPage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userID;
    let deleteAddress = await Address.findOne({ userId });

    if (!deleteAddress) {
      return res.status(404).send("Address details not found");
    }

    deleteAddress.addressDetails = deleteAddress.addressDetails.filter(address => address._id.toString() !== id);
    await deleteAddress.save();

    res.redirect("/addressManage");
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addAddressPage,
  postAddAddressPage,
  editAddressPage,
  updateAddress,
  deleteAddressPage,
};
