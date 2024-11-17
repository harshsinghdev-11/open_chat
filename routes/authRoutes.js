const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/Users"); // Adjust path as needed
const { register, login, profile } = require("../controllers/authController");

router.get("/register",(req,res)=>{
    res.render("register");
})

router.post("/register",register);

router.get("/login", (req, res) => res.render("login"));

router.post("/login",login);

router.get("/profile",isLoggedIn,profile);

function isLoggedIn(req, res, next) {
    if (req.cookies.token === "") {
        return res.redirect("/login");
    }
    try {
        let data = jwt.verify(req.cookies.token, "codehelp@striver82743");
        req.user = data; // This should have email and userid
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        res.redirect("/login");
    }
}

router.get("/logout",(req,res)=>{
    const token="";
    res.cookie("token", token, { httpOnly: true });
    res.render("login");
})


module.exports = router;