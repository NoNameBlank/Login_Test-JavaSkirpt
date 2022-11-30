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
const mehtodOverride = require('method-override')


const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)

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
app.use(mehtodOverride('_methode'))




app.get('/',  checkAuthenticated, (req, res)=> {
    res.render('index.ejs')
})

//Login
app.get('/login',checkNotAuthenticated, (req, res)=>{
        res.render('login.ejs')
})

app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}))

//Register
app.get('/register',checkNotAuthenticated, (req, res)=>{
    res.render('register.ejs')
})

app.post('/register',checkNotAuthenticated, async (req, res)=>{
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
app.get('/dashboard', checkAuthenticated, (req, res)=>{
    res.render('dashboard.ejs', { name : req.user.name })
})



app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})


//Funktion schaut ob User ist berichtigt wenn ja darf er die Seite sehen wenn nein wird er automatisch auf die Login Seite gebracht
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

//Funktion wenn der User eingeloggt ist soll er z.B. nicht mehr auf die Login seite kommen
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
       return res.redirect('/dashboard')
    }
    next()
}

app.listen(3000)
