
// -----------------------------
// 初期アクセス時画面 処理
// -----------------------------

// モジュール定義
let express = require('express');
let router = express.Router();
let mysql = require('mysql');

// kenx 設定定義　（DB接続設定）
let knex = require('knex')({
	client : 'mysql',
	connection : {
		host : 'localhost',
		user : 'root',
		password : '',
		database : 'my-nodeApp-db',
		charset : 'utf8',	
	}
});

// Bookshelf 定義
let BookShelf = require('bookshelf')(knex);
// bookshelf.plugin('pagination'); without having to call

// DBテーブル[users] 定義
let User = BookShelf.Model.extend({
	tableName : 'users',
});

// DBテーブル[messages]定義
let Message = BookShelf.Model.extend({
	tableName : 'messages',
	hasTimestamps : true,
	user : function() {
		return this.belongsTo(User);
	}
});


// '/'　GET 処理 
router.get('/', (req, res, next) => {
	console.log('get / in index.js');
	if (req.session.login == null) {

		console.log('session : ' + req.session.login);
		console.log(' redirect to /users');

		res.redirect('/users');

	}else{
		console.log('/1 to redirect');
		console.log('redirect to /1');
		res.redirect('/page/1');

		// next();
	}
});



// '/'　GET pagination　処理
	router.get('/page/:page',(req,res,next) => {

		console.log('get /page/:page in index.js' );
		// sesssion NULL 時の処理
		if (req.session.login == null) {
			console.log('session : ' + req.session.login);
			console.log('redirect to /users');

			res.redirect('/users');
			return;
		}

		console.log('session : ' + req.session.login);

		// pagination 初期処理
		let pg = req.params.page;
		pg *= 1;
		// if条件　
		// 数字
		// マジックナンバー：ステータスフラグ的な（0：未登録、1：登録済み、2：認証待ち）
	
		if (pg < 1){ pg = 1;}

		// Messageを作成後、　index.ejs へ返す
		new Message().orderBy('created_at', 'DESC').fetchPage({page:pg,
			pageSize:10,
			withRelated: ['user']}).then((collection) =>{

			let data = {
				title : 'miniBoard',
				login : req.session.login,
				collection : collection.toArray(),
				pagination : collection.pagination
			};

			console.log('renderDATA : ' + data);

			res.render('index',data);

		}).catch((err) => {
			res.status(500).json({error: true, data: {message: err.message}});
		});

	});

// POST home page
router.post('/',(req,res,next) => {
	console.log('post / in index.js');
	let rec = {
		message: req.body.msg,
		user_id : req.session.login.id,
	};

	new Message(rec).save().then((model) => {

		console.log( 'post Message : ' + rec);
		console.log('redirect to /');

		res.redirect('/');
	});
});


module.exports = router;
