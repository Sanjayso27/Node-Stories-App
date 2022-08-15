const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const mongoose = require("mongoose");
const Story = require("../models/Story");
const User = require("../models/User")

router.get("/add", ensureAuth, (req, res, next) => {
  res.render("stories/add");
});

// add stories
router.post("/", ensureAuth, async (req, res, next) => {
  req.body.user = req.user.id;
  try {
    user = await User.findById(req.user.id);
  }
  catch(err) {
    console.error(err);
    res.render("error/500");
  }
  const createdStory = new Story(req.body)
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdStory.save({ session: sess });
    await user.stories.push(createdStory);
    await user.save({ session: sess });
    await sess.commitTransaction();
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// show all stories
router.get("/", ensureAuth, async (req, res, next) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();

    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("err/500");
  }
});

// get based on query string
router.get("/query/",ensureAuth,async (req,res,next)=>{
  try {
    const genre = req.query.genre
    const stories = await Story.find({genre: genre,status: "public"})
    .populate("user")
    .sort({createdAt: "desc"})
    .lean();
    res.render("stories/index",{
      stories,
    });
  }
  catch (err) {
    console.error('err/500')
  }
})

// show all public stories of a genre
router.get("/all/:genre",ensureAuth,async (req,res,next)=>{
  try {
    const stories = await Story.find({genre : req.params.genre,status: "public"})
        .populate("user")
        .sort({createdAt: "desc"})
        .lean();
    res.render("stories/index",{
      stories,
    });
  } catch(err){
    console.error(err)
    res.render("err/500")
  }
})

// show single story
router.get("/:id", ensureAuth, async (req, res, next) => {
  try {
    let story = await Story.findById(req.params.id).populate("user").lean();
    if (!story) {
      return res.render("error/404");
    }
    res.render("stories/show", {
      story,
    });
  } catch (err) {
    console.error(err);
    res.render("error/404");
  }
});

// editing a story
router.get("/edit/:id", ensureAuth, async (req, res, next) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
    }).lean();

    if (!story) {
      return res.render("error/404");
    }
    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", {
        story,
      });
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// update stories
router.put("/:id", ensureAuth, async (req, res, next) => {
  try {
    let story = await Story.findById(req.params.id).lean();
    if (!story) {
      return res.render("error/404");
    }
    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      // new to create if there is not one
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

//delete story
router.delete("/:id", ensureAuth, async (req, res, next) => {
  try {
    story = await Story.findById(req.params.id).populate("user");
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await story.remove({session: sess});
    story.user.stories.pull(story);
    await story.user.save({ session: sess });
    await sess.commitTransaction();
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// get all user stories
router.get("/user/:userId", ensureAuth, async (req, res, next) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: "public",
    })
      .populate("user")
      .lean();
      res.render('stories/index',{
        stories
      })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
});

module.exports = router;
