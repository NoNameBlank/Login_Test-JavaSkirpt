if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express ()

//Array mit usern zum Testen
const users = []
//bcrypt einbinden
const bcrypt = require('bcrypt')
//const { name } = require('ejs')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')


const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email)
)

//Dem Server sagen, wir benutzen ejs
app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false})) //nehme eingabe aus e-mail und passwort und es zugang  in der Request variable in der post mehtode
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET, //name vom Schlüssel muss in env rein damit es nicht mit hochgeladen wird
    resave: false,
    saveUninitialized: false

}))

app.use(passport.initialize())
app.use(passport.session())




app.get('/', (req, res)=> {
    res.render('index.ejs', { name : 'Philipp'})
})

//Login
app.get('/login', (req, res)=>{
        res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

//Register
app.get('/register', (req, res)=>{
    res.render('register.ejs')
})

app.post('/register', async (req, res)=>{
try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10) //10 ist ein guter Wert dauert nicht zu lange und trozdem sicher 
    users.push({
    id: Date.now().toString(),
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
}) 

//Wenn das Erfolgreich war, weiterleitung zur Login Page
res.redirect('/login')
} catch  {
    res.redirect('/register')    
}
console.log(users)

})

//Dashbord
app.get('/dashboard', (req, res)=>{
    res.render('dashboard.ejs')
})

app.listen(3000)
