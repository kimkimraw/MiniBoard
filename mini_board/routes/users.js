
// -----------------------------
// LOGIN画面 処理
// -----------------------------


// モジュール定義
let express = require('express');
let router = express.Router();
let mysql = require('mysql');

// kenx　設定定義
let knex = require('knex')({
	client : ('mysql'),
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

// DBテーブル「users」定義
let User = BookShelf.Model.extend({
	tableName : 'users',
});

// express-validation 定義
let { check,validationResult } = require('express-validator');

let cheValidation = [
	check('name').notEmpty().withMessage('Please Input Name...'),
	check('password').notEmpty().withMessage('Please Input Password...'),
	check('')
	];


/* GET users listing. */

// GET 「add.ejs」処理
router.get('/add',(req, res, next) => {

	console.log('get /add in users.js');

	let data = {
		title : 'Users/Add',
		form : {name:'', password:'', comment:''},
		content : 'Please Your Name, Password, Comment',
	};

	console.log('render DATA' + data);
	res.render('users/add',data);
});

// POST 「add.ejs」　処理
router.post('/add',[
	check('name').notEmpty().withMessage('Please Input Name...'),
	check('password').notEmpty().withMessage('Please Input PassWord...'),
	],(req,res,next) => {

	//  validation エラーチェック結果
	let errors = validationResult(req);

	console.log('/add error msg : ' + errors)

	// エラーがある時 TRUE　htmlで返す
	if (!errors.isEmpty()) {
		let content = '<ul class="error">';
		let errors_arr = errors.array();
		for (let n in errors_arr) {
			content += '<li>' +  errors_arr[n].msg + '</li>';
		};
		content += '</ul>';

		let data = {
			title : 'Users/Add',
			content : content,
			form : req.body,
		};

		console.log('render msg :' + data);
		res.rednder('users/add',data);

	//　セッションをNULL、DBへ登録、’/’へリダイレクト	
	}else{
		req.session.login = null;
		new User(req.body).save().then((model) => {

			console.log('session : ' + req.session.login);
			console.log('redirect to /');
			res.redirect('/');
		});
	};
});

// GET ’/’　処理
router.get('/', (req,res,next) => {

	console.log(' get / in users.js');

	let data = {
		title : 'Users/Login',
		form : {name: '', password: ''},
		content : 'please any Name and PassWord',
	};

	console.log('render msg title : !' + data.title);
	console.log('render msg data form : '  + data.form.name );
	console.log('render msg data form : '  + data.form.form );
	console.log('render msg data form : '  + data.form.password );
	console.log('render msg content : ' + data.content);

	res.render('users/login', data);
});

// POST '/' 処理
router.post('/', [
	check('name').notEmpty().withMessage('Please Input Name...'),
	check('password').notEmpty().withMessage('Please Input Password...'),
	],(req,res,next) => {

		console.log('post / in users.js')

		// validation　チェック結果を取得
		let errors = validationResult(req);

		// エラーがある　TRUE　htmlで返す
		if(!errors.isEmpty()) {
			let content = '<ul class="error">';
			let errors_arr = errors.array();

			for(let n in errors_arr){
				content += '<li>' + errors_arr[n].msg + '</li>';
			};

			content += '</ul>';

			let data = {
				title : 'Users/Login',
				content : content,
				form : req.body,
			};

			console.log('render msg title : ' + data.title);
			console.log('render msg content : ' + data.content);
			res.render('users/login', data);

		// バリデーションチェック抜けた
		}else {
			// name,password 取得
			let nm = req.body.name;
			let pw = req.body.password;

			// 「user」テーブルからID、PASSWORDを取得
			User.query({
				where: {name: nm},
			 	andWhere: {password: pw}}).fetch().then((model) => {

			 	// 
				if(model == null){
					console.error('DB model is null');

					let data = {
						title : 'ReInput',
						content : `<p class="error">The name or the name is different.</p>`,
						form : req.body,
					};

					console.log('render msg :' + data);
					res.render('/users/login',data);
				// 
				}else{
					console.log('model : ' + model );
					req.session.login = model.attributes;

					console.log('sesson : ' + req.session.login);

					let data = {
						title : 'Users/Login',
						content : "<p>Login Sucecceful<br>Back to TOP</p>",
						form : req.body,
					};

					console.log('render msg title : !' + data.title);
					console.log('render msg content : ' + data.content);
					console.log('render msg data form : '  + data.form );
					res.render('users/login',data);
				};
			});
		};

});


module.exports = router;
