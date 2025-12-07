const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    isAdmin: { type: Boolean, default: false }
})

const User = mongoose.model('User', userSchema)

async function addUser(username, password, firstname, lastname, isAdmin = false) {
    const user = new User({
        username,
        password,
        firstname,
        lastname,
        isAdmin
    })
    return await user.save()
}


async function checkUser(username, password) {
    const user = await User.findOne({ username })
    return user && user.password === password
}

async function getUser(username) {
    return await User.findOne({ username })
}

async function updateName(username, firstname, lastname) {
    return await User.updateOne({ username }, { firstname, lastname })
}

async function getAllUsers() {
    return await User.find({})
}

async function deleteUser(id) {
    return await User.findByIdAndDelete(id)
}
async function setAdmin(username) {
    return await User.updateOne({ username }, { isAdmin: true })
}


module.exports = {
    addUser,
    checkUser,
    getUser,
    updateName,
    getAllUsers,
    deleteUser,
   
}
