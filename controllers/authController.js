const User= require("../models/Users");
const Image= require("../models/image");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//user registration
exports.register = async(req,res)=>{
    const {username,email,password}= req.body;
     
    try{
        const hashedPassword = await bcrypt.hash(password,10);
        const user= new User({
            username,
            email,
            password:hashedPassword
        });
        await user.save();
        res.redirect("/login");
    } catch(err){
        console.error(err);
        res.status(500).send("Error registering user");
    }

};

// User login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send("Invalid credentials");
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/profile");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error logging in");
    }
};





// Profile route to display user information

exports.profile = async (req, res) => {
    try {
        // Query the user using the ID from `req.user`
        const user = await User.findById(req.user.id);
        const currentUser = req.user;
        const otherUsers = await User.find({ username: { $ne: currentUser.username } });

        if (!user) {
            return res.status(404).send("User not found");
        }
        // Render the profile page with the retrieved user data
        res.render("profile", {user:user,currentUser, otherUsers});
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).send("Internal server error");
    }
};
