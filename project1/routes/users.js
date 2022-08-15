const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");

const User = require("../models/User");

// show all Users
router.get("/", ensureAuth, async (req, res, next) => {
    try {
      const users = await User.find()
        .populate("stories")
        .lean();
  
      res.render("users/index", {
        users,
      });
    } catch (err) {
      console.error(err);
      res.render("error/500");
    }
  });

module.exports = router