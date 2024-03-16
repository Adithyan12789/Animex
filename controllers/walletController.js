
const Wallet = require("../models/wallet");  
    
    

    const addFunds = async (req, res) => {
        const userId = req.session.userID;
        const amount = req.body.amount;
        
        try {
            const wallet = await Wallet.findOneAndUpdate({ userId }, {
                $inc: { balance: amount },
                $push: { transactionHistory: { amount, type: 'deposit' } }
            }, { new: true });

            console.log("yhtjtyjtyj",wallet)
    
            res.json({ success: true, balance: wallet.balance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    const withdrawFunds = async (req, res) => {
        const userId = req.session.userID;
        const amount = req.body.amount;
        
        try {
            const wallet = await Wallet.findOneAndUpdate({ userId }, {
                $inc: { balance: -amount },
                $push: { transactionHistory: { amount, type: 'withdraw' } }
            }, { new: true });

            console.log("erfgerewfw", wallet)
    
            res.json({ success: true, balance: wallet.balance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    const checkWalletBalance = async (req, res) => {
        const userId = req.session.userID;

        try {
            let wallet = await Wallet.findOne({ userId });

            // If wallet is not found, create a new one with balance 0
            if (!wallet) {
                wallet = new Wallet({ userId, balance: 0 });
                await wallet.save();
            }

            res.json({ success: true, balance: wallet.balance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    const clearHistory = async (req, res) => {
        const userId = req.session.userID;
    
        try {
            await Wallet.findOneAndUpdate({ userId }, { transactionHistory: [] });
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }


    module.exports = { addFunds,withdrawFunds, clearHistory, checkWalletBalance}
