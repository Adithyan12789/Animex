
const admin = (req,res,next) => {
    if(req.session.admin){
        next()
    }else{
        res.redirect("/adminlogin")
    }
}

module.exports = admin