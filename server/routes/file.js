var path = require('path');
var multer = require('multer');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
router.use(bodyParser.json());

router.all("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	//res.header("Content-Type", "application/json; charset=utf-8; encoding=utf-8");
    next();
});

var storage = multer.diskStorage({
    destination: function(req, file, cb, res) {
        cb(null, 'img/postImg/');
    },
    filename: function(req, file, cb, res) {
        var name = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, name);

        return name;
    }
});

var upload = multer({
    storage: storage
});

router.post('/uploadImg', upload.single('file'), function(req, res) {
    res.json({
        "location": 'img/postImg/' + req.file.filename
    });
});

module.exports = router;