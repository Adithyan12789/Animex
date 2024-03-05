
const user = (req,res,next) => {
    if(req.session.user){
        next()
    }else{
        res.redirect("/userlogin")
    }
}

module.exports = user