const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    createdAt: {
        type: Date,
        // either a value of the specified type or a function that returns the value of the desired type
        default: Date.now
    },
    stories: [{ type: mongoose.Types.ObjectId ,required:true,ref:'Story'}],
})

module.exports = mongoose.model('User',UserSchema)