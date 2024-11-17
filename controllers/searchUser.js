const User = require("../models/Users");

exports.searchUser = async(req,res)=>{
 const {username}= req.body;
 try{
    const searchUser = await User.findOne({username});
    if(searchUser){
        res.render("searchProfile",{searchUser});
    }
    else{
        res.send("no user found");
    }
 } catch(err){
    console.error(err);
    res.status(500).send("error aa gya bhai");
 }
}