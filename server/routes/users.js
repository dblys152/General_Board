const express = require('express');
const bodyParser = require('body-parser');
const mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper(['server/mapper/userMapper.xml']); //매퍼로드
const router = express.Router();
router.use(bodyParser.json());

//DB connection
mysql = require('mysql');
var con = mysql.createConnection(require('../dbconfig'));
con.connect();

router.all("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    next();
});

function trim(str) {
	return str.trim();
}

//로그인 페이지
router.get('', function(req, res){

    if(!req.session.email){ //로그인 페이지 진입
        return res.render('../view/userLogin.ejs');
    } else{     //이미 로그인 했을 때
        //return res.render('../view/userLogin.ejs');
        res.redirect('/');
    }
})

//로그인
router.post('/login', function(req, res, next){
    var sess = req.session;

    var format = {language: 'sql', indent: '  '}; //질의문 형식
    var param = {
        "email":req.body.email
      , "pw":req.body.pw
    };

    var sql = mybatisMapper.getStatement('user', 'selectLogin', param, format);	//이메일 중복 개수 조회 쿼리
	console.log(sql);
	con.query(sql, function(err, result) {
        if(err){
			res.send({"ret":-1});
		} else{
            console.log(result);
            if(result.length > 0) {
                req.session.email = result[0].EMAIL;
                req.session.loginNo = result[0].LOGIN_NO;
                req.session.nickname = result[0].NICKNAME;
                req.session.authLv = result[0].AUTH_LV;
                //세션 스토어가 이루어진 후 redirect를 해야함.
                req.session.save(function(){
                    res.send({"ret":1});
                });
                
            } else {
                res.send({"ret":-1});
            }
		}
    });
})

//로그아웃
router.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/users');
});

//회원가입 페이지
router.get('/userSignin', function(req, res){
    return res.render('../view/userSignin.ejs');
})

//이메일 중복 체크
router.post('/emailCnt', function(req, res){
    var format = {language: 'sql', indent: '  '}; //질의문 형식
    var param = {"email":req.body.email};

    var sql = mybatisMapper.getStatement('user', 'selectEmailCnt', param, format);	//이메일 중복 개수 조회 쿼리
	console.log(sql);
	con.query(sql, function(err, result) {
        if(err){
			res.send(err);
		} else{
            console.log(result);
			res.send({"emailCnt":result[0].CNT});
		}
    });
})

//회원정보 저장
router.post('/signIn', function(req, res){
    var format = {language: 'sql', indent: '  '}; //질의문 형식
    var param = {
        "email":req.body.email
      , "pw":req.body.pw
      , "nickname":req.body.nickname
    };

    var sql = mybatisMapper.getStatement('user', 'insertLogin', param, format);	//이메일 중복 개수 조회 쿼리
	console.log(sql);
	con.query(sql, function(err, result) {
        if(err){
			res.send({"ret":-1});
		} else{
			res.send({"ret":1});
		}
    });
})


module.exports = router;