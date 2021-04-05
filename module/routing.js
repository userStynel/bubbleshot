var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var database;
var router = express.Router();

function connectDB(){
    var databaseUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/';
    MongoClient.connect(databaseUrl, {useUnifiedTopology: true},function(err, db){
        if(err) throw err;
        database = db.db('userlist');
        console.log('Success to connecting Database!');
    });
}

connectDB();

router.route('/process/login').get(function(req, res){
    var users = database.collection('users');
    users.find({"nickname": req.query.id, "password": req.query.password}).toArray(function(err, docs){
        if(err) throw err;
        if(docs.length > 0){
            req.session.user = {
                nickname: req.query.id,
                authorized: true
            };
            console.log("Login Success");
            res.redirect('/');
        }
        else{
            console.log("Login Failed");
        }
    });
});

router.route('/process/register').get(function(req, res){
    var users = database.collection('users');
    users.insertMany([{"nickname": req.query.id, "password": req.query.password}], function(err, result){
        if(err) throw err;
        else console.log("Success to adding new user!");
    });
});

router.route('/process/logout').get(function(req, res){
    req.session.destroy(function(err){
        if(err) throw err;
        res.redirect('/');
    });
});
router.route('/game').get(function(req, res){
    res.render('game', {session: req.session});
});

router.route('/login').get(function(req, res){
    res.render('login');
});

router.route('/register').get(function(req, res){
    res.render('register');
});

router.route('/').get(function(req, res){
    res.render('main', {session: req.session});
});

exports.routing = router;