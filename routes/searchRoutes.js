const express = require("express");
const User = require("../models/Users");
const router = express.Router();
const {searchUser} = require("../controllers/searchUser");

router.post("/searchUser", searchUser);

module.exports = router;