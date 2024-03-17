const express = require('express');
const { Liquid } = require('liquidjs');
const fs = require('node:fs');

const readline = require('node:readline');
const session = require('express-session');


const app = express();
const engine = new Liquid();

app.engine('liquid', engine.express()); 
app.set('views', './views');
app.set('view engine', 'liquid');

app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'asda21e2e',
    resave: false,
    saveUninitialized: true,
  }))

function auth(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/error?error=You are not logged in");
    }
}

function isAdmin(req, res, next) {
    if (req.user.role == "admin") {
        next();
    } else {
        res.redirect("/error?error=You are not an admin");
    }
}

app.use((req, res, next) => {
    if (req.session.user) {
        req.user = req.session.user
    }
    next();
});

app.get('/login', (req, res) => res.render('login'));

app.post('/login', (req, res) => {
    const inputStream = fs.createReadStream("users.txt");
    const rl = readline.createInterface(inputStream);
    var userIsFound = false;
    rl.on('line', (line)=>{
        const [login, password, role] = line.split(' ');
        if (login == req.body.login && password == req.body.password){
            userIsFound = true;
            req.session.user = {
                login: login,
                role: role
            };
            res.redirect("/");
            rl.close();
            return;
        }
    })
    rl.on('close', ()=>{
        if (!userIsFound) res.redirect("/error?error=Wrong login or password");
    })

});

app.get('/', auth, (req, res) => {
    console.log(req.user);
    res.render('home', {
        login: req.user.login,
        role: req.user.role
    })
})


app.get('/logout', (req, res) => {
    req.session.user = undefined;
    res.redirect('/login');
 });

 app.get('/users', [auth, isAdmin], (req, res) => {
    const inputStream = fs.createReadStream("users.txt");
    const rl = readline.createInterface(inputStream);
    const users = [];
    rl.on('line', (line)=>{
        users.push(line);
    })
    rl.on('close', ()=>{
        res.render('users', {
            users: users
        });  
    })
 });

 app.get('/error', (req, res) => {
    res.render('error', { error: req.query.error })
 });

app.listen(3000);