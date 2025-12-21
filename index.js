const express = require('express')
const app = express()
const path = require('path')

const posts = require('./models/posts.js')
const userModel = require('./models/users.js')

const rooms = require('./models/rooms.js');



const sessions = require('express-session')
const cookieParser = require('cookie-parser')

const threeMinutes = 3 * 60 * 1000

// Ejs setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(
    sessions({
        secret: "my own secret phrase",
        cookie: { maxAge: threeMinutes },
        resave: false,
        saveUninitialized: false
    })
)

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())




//  SERVE UPLOADS


app.use('/models', express.static(path.join(__dirname, 'models')));



//  Mutler setup
// 
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "upload/"),
    filename: (req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });



// MongoDB setup

const dotenv = require('dotenv').config()
const mongoose = require('mongoose')

const mongoDBPassword = process.env.MONGODB_PASSWORD
const mongoDBUser = process.env.MONGODB_USERNAME
const mongoDBAppName = process.env.MONGODB_MYAPPNAME

const connectionString = `mongodb+srv://${mongoDBUser}:${mongoDBPassword}@cluster0.lpfnqqx.mongodb.net/${mongoDBAppName}?retryWrites=true&w=majority`

mongoose.connect(connectionString)
    .then(() => console.log(" Connected to MongoDB:", mongoose.connection.name))
    .catch(err => console.log(" MongoDB connection error:", err))


function checkLoggedIn(req, res, next) {
    if (req.session?.username) {
        next()
    } else {
        res.render('notloggedin')
    }
}

function checkAdmin(req, res, next) {
    if (!req.session?.username) {
        return res.redirect('/login')
    }
    if (req.session.isAdmin !== true) {
        return res.status(403).render('notallowed')
    }
    next()
}



// ROUTES


app.get('/', (req, res) => {
    res.render('welcome')   //  new landing page
})


app.get('/app', checkLoggedIn, (req, res) => {
    res.render('app', { username: req.session.username })
})

// POSTS API
app.get('/getposts', async (req, res) => {
    res.json({ posts: await posts.getLastNPosts() })
})

app.post('/newpost', checkLoggedIn, async (req, res) => {
    await posts.addPost(req.body.message, req.session.username)
    res.redirect('/app')
})

// PROFILE
app.get('/profile', checkLoggedIn, async (req, res) => {
    const user = await userModel.getUser(req.session.username)
    res.render('profile', { user })
})

app.post('/profile', checkLoggedIn, async (req, res) => {
    await userModel.updateName(
        req.session.username,
        req.body.firstname,
        req.body.lastname
    )
    res.redirect('/profile')
})


// LOGIN
app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const valid = await userModel.checkUser(req.body.username, req.body.password)

    if (valid) {
        const user = await userModel.getUser(req.body.username)
        req.session.username = user.username
        req.session.isAdmin = user.isAdmin

        res.redirect('/upload')
    } else {
        res.render('login_failed')
    }
})


// REGISTER
app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { username, password, firstname, lastname, adminCode } = req.body
    const isAdmin = adminCode === process.env.ADMIN_SECRET

    if (await userModel.addUser(username, password, firstname, lastname, isAdmin)) {

        req.session.username = username
        req.session.isAdmin = isAdmin

        return res.redirect('/upload')
    } else {
        res.render('registration_failed')
    }
})


// ADMIN LOGIN
app.get('/admin-login', (req, res) => {
    res.render('admin_login')
})

app.post('/admin-login', async (req, res) => {
    const user = await userModel.getUser(req.body.username)

    if (!user) return res.render('notallowed')

    const isValid = await userModel.checkUser(req.body.username, req.body.password)

    if (isValid && user.isAdmin) {
        req.session.username = user.username
        req.session.isAdmin = true
        return res.redirect('/admin')
    }

    res.render('notallowed')
})


// ADMIN DASHBOARD
app.get('/admin', checkAdmin, async (req, res) => {
    const users = await userModel.getAllUsers()
    const allPosts = await posts.getAllPosts()

    res.render('admin', {
        users: users.map(u => ({
            _id: u._id,
            username: u.username,
            firstname: u.firstname,
            lastname: u.lastname
        })),
        posts: allPosts
    })
})

app.post('/admin/deleteuser/:id', checkAdmin, async (req, res) => {
    await userModel.deleteUser(req.params.id)
    res.redirect('/admin')
})

app.post('/admin/deletepost/:id', checkAdmin, async (req, res) => {
    await posts.deletePost(req.params.id)
    res.redirect('/admin')
})


// LOGOUT
app.get('/logout', checkLoggedIn, (req, res) => {
    res.render('logout')
})

app.post('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})



//  audio upload and visualiser


app.get('/upload', checkLoggedIn, (req, res) => {
    res.render('upload');
});



app.get('/visualizer/:file', checkLoggedIn, (req, res) => {
    res.render('visualizer', { filename: req.params.file });
});



// CREATE ROOM PAGE
app.get('/create_room', checkLoggedIn, (req, res) => {
    res.render('create_room');
});

// CREATE ROOM (SAVE TO DB ONCE)
app.post('/create_room', checkLoggedIn, async (req, res) => {

    const visuals = {
        camRadius: Number(req.body.camRadius),
        camSpeed: Number(req.body.camSpeed),
        waveIntensity: Number(req.body.waveIntensity),
        tubeSpin: Number(req.body.tubeSpin),
        colorTheme: req.body.colorTheme
    };

    const brandText = req.body.brandText || "WELCOME TO SONIQ SPACE";

    const newRoom = await rooms.createRoom(
        req.body.roomName,
        req.session.username,
        visuals,
        brandText
    );

    res.redirect(`/created_room/${newRoom._id}`);
});

// CREATED ROOM (PREVIEW ONLY)
app.get('/created_room/:id', checkLoggedIn, async (req, res) => {
    const room = await rooms.getRoom(req.params.id);
    if (!room) return res.send("Room not found");

    res.render("created_room", {
        visuals: room.visuals,
        brandText: room.brandText,
        roomName: room.roomName
    });
});

app.post('/create_room', checkLoggedIn, async (req, res) => {

    const visuals = {
        camRadius: Number(req.body.camRadius),
        camSpeed: Number(req.body.camSpeed),
        waveIntensity: Number(req.body.waveIntensity),
        tubeSpin: Number(req.body.tubeSpin),
        colorTheme: req.body.colorTheme
    };

    const brandText = req.body.brandText || "WELCOME TO SONIQ SPACE";

    const newRoom = await rooms.createRoom(
        req.body.roomName,
        req.session.username,
        visuals,
        brandText
    );

    res.redirect(`/created_room/${newRoom._id}`);
});

app.get('/created_room/:id', checkLoggedIn, async (req, res) => {
    const room = await rooms.getRoom(req.params.id)
    if (!room) return res.send("Room not found")

    res.render("created_room", {
        visuals: room.visuals || {},
        brandText: room.brandText || "WELCOME TO SONIQ SPACE"
    })
})




//
app.listen(3000, () => {
    console.log('✅ listening on port 3000')
})
