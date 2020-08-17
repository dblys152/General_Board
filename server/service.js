var http = require('http');
var express = require('express');
var bodyparser = require('body-parser');
var cors = require('cors');
var routes = require('./routes');
var engine = require('ejs-locals');
var session = require('express-session');

var app = express();

app.use(session({
    secret: '@#@$MYSIGN#@$#$',
    resave: false,
    saveUninitialized: true
}));

app.use(express.json({ limit : "50mb" })); 
app.use(express.urlencoded({ limit:"50mb", extended: false }));

app.use(bodyparser.urlencoded({ extended: true }))
app.use(cors())
app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/script', express.static('script'));
app.use('/tinymce', express.static('tinymce'));

app.use(ignoreFavicon);

app.set('port', process.env.POST || 3000);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.engine('ejs', engine);

app.use(routes);

app.locals.bbsNo="";
app.locals.loginNo="";

//error handler
app.use(function(err, res) {
    res.status(err.status || 500);
    res.json({'errors': {
        message: err.message,
        error: {}
    }});
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

function ignoreFavicon(req, res, next){
    if(req.originalUrl === '/favicon.ico'){
        res.status(204).json({nope: true});
    } else{
        next();
    }
}