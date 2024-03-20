const isLoggedAdmin = async (req,res,next) => {
    if(req.session.isLoggedAdmin){
        res.redirect("/adminhome")
    }else{
        next();
    }
}

module.exports = isLoggedAdmin