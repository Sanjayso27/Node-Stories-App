const express = require("express");
const router = express.Router();
const {ensureAuth,ensureGuest} = require('../middleware/auth')

const Story = require('../models/Story')

// looks for login and dashboard views in the views dir
router.get("/",ensureGuest,(req,res,next)=>{
    res.render("login",{
        layout: 'login'
    });
})

router.get("/dashboard",ensureAuth,async (req,res,next)=>{
    try {
        // .lean so that result of the queries are not mongoose documeent but javascript objects
        const stories = await Story.find({user: req.user.id}).lean()
        res.render("dashboard",{
            name: req.user.firstName,
            stories
        });
    }
    catch (err){
        console.error(err)
        res.render('error/500')
    }
})



module.exports = router