var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(3000, function() {
    console.log('connection server on port 3000');
});

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded('extended:true'));
app.use(session( {
    secret : '@#@MYSIGN#@$#$',
    saveUnitialized : true
}));
MongoClient.connect('mongodb://192.168.0.76:27017', function(err, db) {
    if(err) {
        console.log(err);
        throw err;
    } else {
       var dbo = db.db('board');
    }
    var router = require('./routers')(app,dbo);
})
