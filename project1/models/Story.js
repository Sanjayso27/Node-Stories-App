const mongoose = require("mongoose")

const StorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'public',
        enum: ['public','private']
    },
    genre: {
        type: String,
        required: true,
    },
    // linking each story with an author
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // how default value can be Date.now()
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Story',StorySchema)