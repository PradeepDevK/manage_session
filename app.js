'use strict';

const express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    router = express.Router(),
    app = express(),
    redis = require('redis'),
    redisStore = require('connect-redis')(session),
    client  = redis.createClient();

// For single user sesstion storage
//app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));

// For multi user sesstion storage
app.use(session({
    secret: 'ssshhhhh',
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : 260}),
    saveUninitialized: false,
    resave: false
}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/views'));

// For single user sesstion storage
//var sess; 

router.get('/',(req,res) => {
    let sess = req.session;
    if(sess.email) {
        return res.redirect('/admin');
    }
    res.sendFile('index.html');
});

router.post('/login',(req,res) => {
    let sess = req.session;
    sess.email = req.body.email;
    res.end('done');
});

router.get('/admin',(req,res) => {
    let sess = req.session;
    if(sess.email) {
        res.write(`<h1>Hello ${sess.email} </h1><br>`);
        res.end('<a href='+'/logout'+'>Logout</a>');
    }
    else {
        res.write('<h1>Please login first.</h1>');
        res.end('<a href='+'/'+'>Login</a>');
    }
});

router.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});

app.use('/', router);

app.listen(process.env.PORT || 8099,() => {
    console.log(`App Started on PORT ${process.env.PORT || 8099}`);
});

