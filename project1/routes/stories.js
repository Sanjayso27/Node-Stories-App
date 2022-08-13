const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");

const Story = require("../models/Story");

router.get("/add", ensureAuth, (req, res, next) => {
  res.render("stories/add");
});

// add stories
router.post("/", ensureAuth, async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
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
    await Story.remove({ _id: req.params.id });
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
