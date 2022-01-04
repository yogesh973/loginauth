require('dotenv').config()


const express=require('express')
const app=express()
const bcrypt=require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
let users=[]


const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

app.get('/',checkAuthenticated,(req, res) => {
  res.render('index')
})


app.get('/signUp',checkNotAuthenticated,(req, res) => {
    res.render('signUp')
})

app.post('/signUp',checkNotAuthenticated,async(req, res) => {

    try{
        const salt =await bcrypt.genSalt()
    const hashedPassword= await bcrypt.hash(req.body.password,salt)
    const user={
        id:Date.now().toString(),
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword
    }
    users.push(user)
    res.redirect('/login')
    }
    catch{
        console.log('eror')
    }
    console.log(users)
})


app.get('/login',checkNotAuthenticated,(req, res) => {
    res.render('login')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))


app.delete('/logout',(req,res)=>{
    req.logout()
    res.redirect('/login')
})

function checkAuthenticated(req, res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.listen(3000)