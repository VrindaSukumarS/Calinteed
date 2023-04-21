const userHelpers = require("../helpers/user-helpers")

module.exports={
    verifyLogin :async(req,res,next)=>{
        if(req.session.loggedIn){
            await userHelpers.getUserDetails(req.session.user._id).then((user)=>{
                req.session.user=user
                next()
            })
        }
        else{
            res.redirect("/login")
        }
    }
}