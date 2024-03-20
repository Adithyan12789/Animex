const isLoggedUser = async (req,res,next) => {
    if(req.session.isLogged){
        res.redirect("/")
    }else{
        next();
    }
}

module.exports = isLoggedUser