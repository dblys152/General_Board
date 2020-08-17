const express = require('express');
const bodyParser = require('body-parser');
const mybatisMapper = require('mybatis-mapper');
mybatisMapper.createMapper(['server/mapper/postMapper.xml']); //매퍼로드
const router = express.Router();
router.use(bodyParser.json());

//DB connection
mysql = require('mysql');
var con = mysql.createConnection(require('../dbconfig'));
con.connect();

router.all("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	res.locals.loginNo = req.session.loginNo;
	res.locals.nickname = req.session.nickname;
    next();
});

function trim(str) {
	return str.trim();
}

router.get('/', function(req, res){
	res.redirect('/postList');
});
 
//게시글 목록
// /?bbs_no=""&cp=""
router.get('/postList', function(req, res){
	var format = {language: 'sql', indent: '  '}; //질의문 형식

	var bbsNo = req.query.bbsNo;
	var cp = req.query.cp;
	var start = (cp - 1) * 10;
	var qs = req.query.qs;

	if(!bbsNo){
		bbsNo = '4000';
	}
	if(!cp){
		cp = 1;
		start = 0;
	}
	if(!qs) {
		qs = '';
	} else {
		qs = trim(qs);
	}
	var param = {
					"bbsNo":bbsNo
				  , "qs":qs
				  , "start":start
				};

	var sql = mybatisMapper.getStatement('board', 'selectPostList', param, format);	//게시글 목록 쿼리
	sql += ' LIMIT '+start+', 10';	//페이징 쿼리 추가
	console.log(sql);
	con.query(sql, function(err, result){ //게시글 목록 쿼리 실행
		if(err){
			return res.send(err);
		} else{
			console.log(result);
			//return res.json(result);
			if(result.length > 0) {
				var totCnt = result[0].TOT_CNT
			} else {
				var totCnt = 0
			}
			var pageForm = {
				"totCnt": totCnt
			  , "listCnt": 10
			  , "pageCnt": parseInt(result.length / 10) + 1
			};
			return res.render('../view/boardList.ejs', {"postList": result, "cp": cp, "bbsNo": bbsNo, "qs": qs, "pageForm":pageForm});	
		}
	});
});

router.get('/postListCore', function(req, res){
	var format = {language: 'sql', indent: '  '}; //질의문 형식

	var bbsNo = req.query.bbsNo;
	var cp = req.query.cp;
	var start = (cp - 1) * 10;
	var qs = req.query.qs;

	var param = {
		"bbsNo":bbsNo
	  , "qs":qs
	  , "start":start
	};

	var sql = mybatisMapper.getStatement('board', 'selectPostList', param, format);	//게시글 목록 쿼리
	sql += ' LIMIT '+start+', 10';	//페이징 쿼리 추가
	console.log(sql);
	con.query(sql, function(err, result){ //게시글 목록 쿼리 실행
		if(err){
			res.send(err);
		} else{
			console.log(result);
			res.send(result);
		}
	});
});

//게시글 뷰페이지
router.get('/postView', function(req, res){		
	if(!req.session.email) {		//로그인 안돼있을 시 로그인 페이지로
		return res.redirect('/users');
	} 
	var format = {language: 'sql', indent: '  '}; //질의문 형식

	var bbsNo = req.query.bbsNo;
	var postNo = req.query.postNo;

	var param = {
		"bbsNo":bbsNo
	  , "postNo":postNo
	  , "loginNo":req.session.loginNo
	};

	var sql = mybatisMapper.getStatement('board', 'selectPost', param, format);	//게시글 조회 쿼리
	console.log(sql);
	con.query(sql, function(err, result){ 
		if(err){
			res.send(err);
		} else{
			console.log(result);
			var form = result;					//게시글 조회 쿼리 결과 저장
			if(form.length == 0) {
				return res.render('../view/error.ejs');
			}
			var sql = mybatisMapper.getStatement('board', 'updateViewCnt', param, format);	//조회수 증가 쿼리	
			con.query(sql); 		
			//return res.json(form);
			var sql = mybatisMapper.getStatement('board', 'selectPostLikeYn', param, format);	//게시글 좋아요 여부 쿼리
			console.log(sql);
			con.query(sql, function(err, result){
				if(err){
					res.send(err);
				} else{
					var likeYn = result[0].LIKE_YN;
					var sql = mybatisMapper.getStatement('board', 'selectReplyList', param, format);	//댓글 목록 쿼리
					console.log(sql);
					con.query(sql, function(err, result){
						if(err){
							res.send(err);
						} else{
							var replyList = result;
							return res.render('../view/boardView.ejs', {"form": form, "bbsNo":bbsNo, "likeYn":likeYn, "replyList":replyList});
						}
					});
				}
			});
		}
	});
});

//게시글 작성페이지
router.get('/postWrite', function(req, res){
	if(!req.session.email) {		//로그인 안돼있을 시 로그인 페이지로
		return res.redirect('/users');
	}
	var format = {language: 'sql', indent: '  '}; //질의문 형식

	var bbsNo = req.query.bbsNo;
	var postNo = req.query.postNo;

	if(!postNo) {
		postNo = '';
	}

	var param = {
		"bbsNo":bbsNo
	  , "postNo":postNo
	};

	var form = [{
				  "BBS_NO":bbsNo
				, "POST_NO":postNo
				, "POST_TITLE":''
				, "CONTENTS":''
				, "WRT_ID":''
				, "WRT_NM":''
				, "VIEW_CNT":''
				, "LIKE_CNT":''
				, "DISP_YN":'Y'
				, "REPLY_YN":'Y'
				}];

	var sql = mybatisMapper.getStatement('board', 'selectPost', param, format);	//게시글 조회 쿼리
	console.log(sql);
	con.query(sql, function(err, result){	//게시글 조회 쿼리 실행
		if(err){
			res.send(err);
		} else{
			console.log(result);
			if(result != null && result.length > 0) {
				form = result;					//게시글 조회 쿼리 결과 저장
				if(form[0].WRT_ID != req.session.loginNo) {
					return res.render('../view/error.ejs');
				}
			}
			return res.render('../view/boardWrite.ejs', {"form": form, "bbsNo": bbsNo});
		}
	});
	
});

//게시글 저장
router.post('/postSave', function(req, res){
	var format = {language: 'sql', indent: '  '}; //질의문 형식
	
	var param = {
		"bbsNo": req.body.bbsNo,
		"postNo": req.body.postNo,
		"postTitle": req.body.postTitle,
		"contents": req.body.contents,
		"wrtId": req.session.loginNo,
		"replyYn": req.body.replyYn,
		"dispYn": req.body.dispYn,
		"regNo": req.session.loginNo,
		"modNo": req.session.loginNo
	};
	console.log(param);
	
	var sql = mybatisMapper.getStatement('board', 'selectPostNo', param, format);	//게시글 번호 조회
	console.log(sql);
	con.query(sql, function(err, result) {
		if(!param.postNo) {
			param.postNo = result[0].POST_NO;
		}
		console.log(param);
		var sql = mybatisMapper.getStatement('board', 'mergePost', param, format);	//게시글 저장 쿼리
		console.log(sql);
		con.query(sql);
		var sql = mybatisMapper.getStatement('board', 'mergePostContents', param, format);	//게시글내용 저장 쿼리
		console.log(sql);
		con.query(sql);

		res.redirect('/postView?bbsNo='+param.bbsNo+'&postNo='+param.postNo);
	});
});

//게시글 삭제
router.get('/postDel', function(req, res){
	var format = {language: 'sql', indent: '  '}; //질의문 형식

	var param = {
		"bbsNo": req.query.bbsNo
	  , "postNo": req.query.postNo
	}
	
	var sql = mybatisMapper.getStatement('board', 'deletePost', param, format);	//게시글 삭제 쿼리
	var sql2 = mybatisMapper.getStatement('board', 'deletePostContents', param, format);	//게시글내용 삭제 쿼리

	con.query(sql, sql2, function(err){
		if(err){
			res.send(err);
		} else{
			res.redirect('/postList?bbsNo='+param.bbsNo);
		}
	});
});

//게시글 좋아요
router.get('/postLike', function(req, res){
	var format = {language: 'sql', indent: '  '}; //질의문 형식

	var param = {
		"bbsNo": req.query.bbsNo
	  , "postNo": req.query.postNo
	  , "loginNo": req.session.loginNo
	}
	
	var sql = mybatisMapper.getStatement('board', 'selectPostLikeYn', param, format);	//게시글 좋아요 여부
	console.log(sql);
	con.query(sql, function(err, result){ 
		if(err){
			res.send(err);
		} else{
			if(result[0].LIKE_YN == 'Y') {
				var sql = mybatisMapper.getStatement('board', 'deleteObjLike', param, format);
				con.query(sql);
				res.send({"cnt":-1});
			} else {
				var sql = mybatisMapper.getStatement('board', 'insertObjLike', param, format);
				con.query(sql);
				res.send({"cnt":1});
			}

		}
	});
});

//댓글 등록
router.get('/replyAdd', function(req, res){
	var format = {language: 'sql', indent: '  '}; //질의문 형식

	var param = {
		"bbsNo": req.query.bbsNo
	  , "postNo": req.query.postNo
	  , "reply": req.query.reply
	  , "wrtId": req.query.wrtId
	  , "regNo": req.session.loginNo
	  , "modNo": req.session.loginNo
	}
	
	var sql = mybatisMapper.getStatement('board', 'selectReplyNo', param, format);	//게시글 번호 조회
	console.log(sql);
	con.query(sql, function(err, result){
		if(err){
			res.send(err);
		} else{
			var replyNo = result[0].REPLY_NO;
			param.replyNo = replyNo;
			var sql = mybatisMapper.getStatement('board', 'insertReply', param, format);	//댓글 등록
			console.log(sql);
			con.query(sql, function(err, result){
				if(err){
					res.send(err);
				} else{
					res.send({"ret":1, "replyNo":replyNo});
				}
			});
		}
	});
});

//댓글 삭제
router.get('/replyDel', function(req, res){
	var format = {language: 'sql', indent: '  '}; //질의문 형식

	var param = {
		"bbsNo": req.query.bbsNo
	  , "postNo": req.query.postNo
	  , "replyNo": req.query.replyNo
	}
	
	var sql = mybatisMapper.getStatement('board', 'deleteReply', param, format);	//게시글 번호 조회
	console.log(sql);
	con.query(sql, function(err){
		if(err){
			res.send(err);
		} else{
			res.send({"ret":1});
		}
	});
});


module.exports = router;
