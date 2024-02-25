const express = require('express')
const app = express()
const router = express.Router()
const userController = require('../controllers/userController')


router.get('/',userController.loaduserHome)
router.get('/viewprofile',userController.viewprofile)
router.get('/editprofile',userController.editprofileload)
router.post('/editprofile',userController.editprofile)



module.exports = router
