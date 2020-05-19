
// -----------------------------
// メイン画面 処理
// -----------------------------

// モジュール定義
let express = require('express');
let router = express.Router();
let mysql = require('mysql');

// knex　設定定義
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

// Boookshelf 設定定義
let BookShelf = require('bookshelf')(knex);
// bookshelf.plugin('pagination'); without having to call

// DBテーブル「user」定義
let User = BookShelf.Model.extend({
	tableName : 'users'
});

// DBテーブル「messages」登録
let Message = BookShelf.Model.extend({
	tablaName : 'messages',
	hasTimestamps : true,
	user : function(){
		return this.belongsTo(User);
	}
});


// GET　’/’　処理 
router.get('/',(req,res,next) => {

	console.log('get / in home.js');
	res.redirect('/');
});

// GET'/:id’　処理
router.get('/:id', (req,res,next) => {
	console.log('get /:id in home.js');
	console.log('redirect /home/id/page/1');

	res.redirect('/home/' + req.params.id + '/page/1');
});


// GET’/:id/:page’ 処理
router.get('/:id/page/:page', (req,res,next) => {

	console.log('get /id/page/page in home.js')
	// id,pagination 定義
	let id = req.params.id;
	id *= 1;
	let pg = req.params.page;
	pg *= 1;
	if (pg < 1){ pg = 1;}

	// DBアクセス　表示データを取得
	new Message().orderBy('created_at', 'DESC')
	.where('user_id', '=', id).fetchPage({page:pg, pageSize:10
	,withRelated:['user']}).then((collection) => {

		let data = {
			title : 'miniBoard',
			login : req.session.login,
			user_id : id,
			collection : collection.toArray(),
			pagination : collection.pagination,
		};

		console.log('render data title : ' + data.title);
		console.log('render data session : ' + req.session.login);
		console.log('render data user_id : ' + data.user_id);
		console.log('render data collection : ' + data.collection);
		console.log('render data pagination : ' + data.pagination);
		res.render('home',data);

	}).catch((err) => {
		res.status(500).json({error:true, data: {message: err.message}});
	});
});

module.exports = router;