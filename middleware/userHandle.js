const user = (req,res,next) => {
    if(req.session.user){
        res.render("user/index")
        next()
    }else{
        res.redirect("/login")
    }
}