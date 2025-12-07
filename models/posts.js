const mongoose=require('mongoose')
const {Schema,model}=mongoose

const postSchema= new Schema({
    user:String,
    message:String,
    likes:Number,
    time: Date,
})

const postData=model('posts',postSchema)

async function getLastNPosts(n=3){
    return await postData.find({}).sort({'time':-1}).limit(n).exec()
}

function addPost(message, user){
    console.log("➡️ addPost called with:", message, user)

    postData.create({
        message,
        user,
        likes: 0,
        time: new Date()
    })
    .then(() => {
        console.log(" Post saved to MongoDB")
    })
    .catch(err => console.log("DB ERROR:", err))
}

module.exports = {
    addPost,
    getLastNPosts
}
