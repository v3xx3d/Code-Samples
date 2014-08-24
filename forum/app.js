var host = "";
if( process.env["NODE_ENV"] == "development" ){
	host = "192.168.1.102";
	// host = "vexterity.com";
} else {
	host = "localhost";
}

var fs = require('fs');
var path = require('path');
var express = require('express');
var cookie = require('cookie');
var connect = require('connect');
var formidable = require('formidable');
var app = express();

var MongoStore = require('connect-mongo')(express);

var mongojs = require('mongojs');
var databaseurl = host + ":27017/forum";
var collections = ['users', 'categories', 'posts'];
var db = mongojs(databaseurl, collections);
var ObjectId = mongojs.ObjectId;


/* --------------------------------
		Logging with Winston
-------------------------------- */

var winston = require('winston');
winston.add(winston.transports.File, { filename: 'action.log' });
winston.remove(winston.transports.Console);



/* -------------------------------- 
 		Colors! 						
-------------------------------- */
var colors = require('colors');

colors.addSequencer("america", function(letter, i, exploded) {
  if(letter === " ") return letter;
  switch(i%3) {
    case 0: return letter.red;
    case 1: return letter.white;
    case 2: return letter.blue;
  }
});

colors.addSequencer("rasta", function(letter, i, exploded) {
  if(letter === " ") return letter;
  switch(i%3) {
    case 0: return letter.red;
    case 1: return letter.yellow;
    case 2: return letter.green;
  }
});

//colors demo
console.log(
	'yellow'.yellow +  // user names
	' cyan'.cyan +  // networking stuff
	' white'.white + 
	' magenta'.magenta + 
	' green'.green + 
	' red'.red + 
	' grey'.grey + 
	' blue'.blue + 
	' rainbow'.rainbow +
	' america'.america + 
	' rasta'.rasta
);

console.log('DB HOST: '.magenta + host.magenta);

var permissions = {
	owner: [ 'add_categories', 'add_posts', 'remove_posts', 'change_permissions', 'admin', 'tester', 'user', 'actionlog' ],
	admin: [ 'add_categories', 'add_posts', 'remove_posts', 'change_permissions', 'tester', 'user', 'actionlog' ],
	tester: [ 'add_posts', 'user' ],
	user: [  'add_posts' ],
	guest: []
}

function actionLog(u,c){
	if( u && c ){
		console.log(u.yellow + ' ' + c.cyan);
		winston.log('info', u + ' ' + c);
	}
}


function checkPermissions( level, perm ){
	// console.log('category has permission level: ' + perm);

	if( level == perm ) return true;

	var temp_permissions = permissions[level];
	for( var i = 0; i < temp_permissions.length; i++ ){
		if( temp_permissions[i] == perm ){
			return true;
		}
	}
	return false;
}

// check for session timeout
function checkSession(req, res, next) {
	console.log(req.url)
	if (req.session.username) {
		next();
	} else {
	    res.send({ session_timeout: true });
	}
}


// Default session handling.
app.use( express.cookieParser() );
// app.use( express.urlencoded({limit: '50mb'}) );
// app.use( express.json({limit: '50mb'}) );
app.use( express.bodyParser({ uploadDir: "img/uploads" }) );
app.use( express.session({
    secret: "secret about D things",
    key: express.sid,
    // cookie: {
    // 	maxAge: 3600000
    // },
    store: new MongoStore({
    	db: 'forum',
    	collection: 'sessions',
    	host: host,
    	port: 27017
    })
}));

// app.use(function(err, req, res, next) {
//     if(!err) return next(); // you also need this line
//     console.log("error!!!");
//     res.send("error!!!");
// });




app.get('/', function (req, res) {
	console.log('index requested');
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
	res.sendfile(__dirname + '/index.html');
});

app.get('/session-status', function(req,res){
	if( req.session.username ){
		res.send({ 
			session: true,
			user: {
				permissions: req.session.permissions,
				username: req.session.username
			}
		});
	} else {
		res.send({ session: false });
	}
});


app.get('/logout', checkSession, function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request

  actionLog( req.session.username, 'logged out' );
  req.session.destroy(function(){
    res.redirect('/');
  });
});


app.post('/login', function(req, res){
	
	var data = req.body;
	actionLog( data.username, 'is trying to login' );

	db.users.find({ username: data.username }, function( error, response ) {

		if( error != null ){
			console.log('DB ERROR: ' + error );
			res.send( { error: 'Database Error: contact administrator!' } );
		} else if( response == ''){
			//username did not exist
			res.send( { error: 'that user does not exist!' } );
			console.log('username does not exist');
		} else {
			
			if( response[0].password == data.password ){
				actionLog( data.username, 'logged in' );

				req.session.regenerate(function(){
					
					req.session.username = response[0].username;
					req.session.permissions = response[0].permissions;

					console.log(req.session);

					var res_object = {
						username: response[0].username,
						permissions: response[0].permissions
					}
					res.send( res_object );
				})
				
			} else {
				console.log('invalid password');
				res.send( { error: 'invalid password' } );
			}
			
		}
	});
	
});


app.post('/signup', function(req, res){
	
	console.log(req.body)
	var data = req.body;

	actionLog( data.username, 'is trying to sign up' );
	
	db.users.find({username: data.username}, function(err, users) {
		if( err != null ){
			console.log('DB ERROR: ' + err );
			res.send( { error: 'Database Error: contact administrator!' } );
		} else if( users == ''){
			var curdate = new Date();

			var user_object = {
				username: data.username, 
				password: data.password, 
				email: data.email,
				datejoined: curdate, 
				lastlogin: curdate,
				permissions: 'user',
				forumStats: {}
			}

			db.users.save(user_object);

			actionLog( data.username, 'signed up' );

			req.session.regenerate( function(){
				req.session.username = data.username;
				req.session.permissions = 'user';
				
				var res_object = {
					username: data.username,
					permissions: 'user'
				}
				res.send( res_object );
			})
			
		} else {
			console.log('username already taken');
			res.send( { error: 'username already taken' } );
		}
	});
});


app.get('/post/:id', checkSession, function(req,res){
	actionLog( req.session.username, 'is looking for a post' );
	
	var id = req.params.id;
	console.log('post id: ' + id);

	db.posts.find({ _id: ObjectId(id) }, function(err, post){
		if( err != null ){
			console.log('DB ERROR: ' + err );
			res.send( { error: 'Database Error: contact administrator!' } );
		} else if( post == '' ){
			console.log('post not found')
			res.send( { error: 'Post not found' } );
		} else {
			var p = post[0];

			db.posts.update( { _id: ObjectId(id) }, { $inc: { views: 1 } } );

			console.log('post found!');

			res.send( p );
		}
	});

});


/* ADD A REPLY TO A POST */

app.post('/post/:id/reply', checkSession, function(req,res){
	actionLog( req.session.username, 'is trying to reply to a post' );

	var id = req.params.id;
	var data = req.body;

	console.log(data);

	// res.send( { error: 'not setup yet' } );
	
	console.log('post id: ' + id);

	var curdate = new Date();


	db.posts.update({ _id: ObjectId(id) },{ $push: { replies: { content: data.content, username: req.session.username, date: curdate } } }, function(err, post){
		if( err != null ){
			console.log('DB ERROR: ' + err );
			res.send( { error: 'Database Error: contact administrator!' } );
		} else if( post == '' ){
			console.log('post not found')
			res.send( { error: 'Post not found' } );
		} else {
			console.log('reply posted successfully');
			res.send( {} );
		}
	});

});


app.get('/category/:id', checkSession, function(req,res){
	actionLog( req.session.username, 'is getting a list of posts'  );
	var id = req.params.id;
	var query;

	if( id.length != 24 || id.indexOf(' ') >= 0 ){
		console.log('using name');
		var query = { name: id };
	} else {
		console.log('searching by id');
		var query = { _id: ObjectId(id) };
	}

	console.log('category id: ' + id);

	db.categories.find(query, function(err, cat) {
		if( err != null ){
			console.log('DB ERROR: ' + err );
			res.send( { error: 'Database Error: contact administrator!' } );
		} else if( cat== ''){
			console.log('category not found')
			res.send( { error: 'Category not found' } );
		} else {
			console.log('category found! getting posts...');
			var category = cat[0];

			console.log('category: ');
			console.log(category);

			var response_posts = [];

			if( !category.posts.length ){
				res.send( [] );
			}

			category.posts.forEach( function(p){
				// 	console.log('post ' + i + ':');
				// 	console.log('finding post: ' + category.posts[i] );
				var postid = p.toString();
				db.posts.find({ _id: ObjectId(postid) }, function(err, post){
					if( err != null ){
						console.log('DB ERROR: ' + err );
					} else if( post == '' ){
						console.log('post not found')
					} else {
						response_posts.push(post[0]);

						if( response_posts.length >= category.posts.length ){
							console.log('responding with posts')
							res.send( response_posts );
						}
					}
				})
			})

			// for( var i = 0; i < category.posts.length; i++ ){
			// 	console.log('post ' + i + ':');
			// 	console.log('finding post: ' + category.posts[i] );
			// 	var postid = category.posts[i];
			// 	var post = db.posts.find({ _id: ObjectId(postid.toString()) });
			// 	console.log(post);
			// }

			// res.send( response_posts );
		}
	});
});


app.post('/category/:id/post', checkSession, function(req,res){
	actionLog( req.session.username, 'submitted a post' );

	console.log(req.body);
	var data = req.body;

	db.categories.find({ _id: ObjectId(req.params.id) }, function(err, category) {
		if( err != null ){
			console.log('DB ERROR: ' + err );
			res.send( { error: 'Database Error: contact administrator!' } );
		} else if( category == ''){
			console.log('category not found!');
			res.send( { error: 'category not found' } );
		} else {
			console.log('category found, adding post...');
			var curdate = new Date();

			var post_object = {
				type: data.type, 
				subject: data.subject, 
				content: data.content,
				datecreated: curdate,
				lastactivity: curdate,
				creator: req.session.username,
				category: category[0].name,
				category_id: category[0]._id,
				views: 0,
				replies: []
			}

			db.posts.save(post_object, function(err, ipost){
				console.log(ipost);

				db.categories.update({ _id: ObjectId(req.params.id) },{ $push: { posts: ipost._id } }, function(err, cat){
					console.log('post created successfully!')
					console.log( post_object );
					
					res.send( post_object );
				});

				
			});
		}
	});
})


app.post('/category', checkSession, function(req,res){
	actionLog( req.session.username, 'is trying to create a category'  );

	console.log(req.body)
	var data = req.body;

	db.categories.find({name: data.name}, function(err, categories) {
		if( err != null ){
			console.log('DB ERROR: ' + err );
			res.send( { error: 'Database Error: contact administrator!' } );
		} else if( categories == ''){
			var curdate = new Date();

			var category_object = {
				name: data.name, 
				description: data.description, 
				permissions: data.permissions,
				datecreated: curdate,
				creator: req.session.username,
				last_activity: curdate,
				posts: []
			}

			db.categories.save(category_object);

			console.log('category created successfully!')
			console.log(category_object);
			
			res.send( category_object );
			
		} else {
			console.log('category with same name already exists!');
			res.send( { error: 'category name already taken' } );
		}
	});
});


app.get('/categories', checkSession, function(req,res){
	actionLog( req.session.username, 'retrieving category list'  );
	db.categories.find(function(err, cats) {

		if( err != null ){
			console.log('DB ERROR: ' + err );
			res.send( { error: 'Database Error: contact administrator!' } );
		} else {
			console.log('categories: ' + cats.length);
			console.log('filtering for permission: ' + req.session.permissions );
			var category_list = []

			for( var i = 0; i < cats.length; i++ ){
				if( checkPermissions( req.session.permissions, cats[i].permissions ) ){
					category_list.push(cats[i]);
				}
			}

			res.send(category_list);
		}
	});
});


app.get('/actionlog', checkSession, function(req, res){
	if( !checkPermissions( req.session.permissions, 'actionlog') ){
		return res.send('you don\'t have permission to do that');
	}

	actionLog( req.session.username, 'checked out the action log'  );

	var options = {
		limit: 100,
		start: 0,
		order: 'desc',
		fields: ['message']
	}

	winston.query(options, function( err, results ){
		if( err ){
			res.send('error querying logs')
		}

		res.send(results);
	});

});

app.post('/save-image', function(req, res){
	actionLog( req.session.username, 'is trying to upload a file' );

	var file = req.files.image;

	var ext = path.extname( file.name );
  	var newPath = __dirname + '/img/uploads/' + req.session.username + '_' + fileDate() + ext;
	var refPath = 'img/uploads/' + req.session.username + '_' + fileDate() + ext;
  	fs.rename(file.path, newPath, function (err) {
    	if( !err ){
    		console.log( 'file written successfully!'.green );
    		res.send({ filepath: refPath });
    	} else {
    		res.send({ error: err });
    	}
 	});

	// fs.readFile(file.path, function (err, data) {
	// 	if( !err ){
	// 		var ext = path.extname( file.name );
	// 	  	var newPath = __dirname + '/img/uploads/' + req.session.username + '_' + fileDate() + ext;
	//     	var refPath = 'img/uploads/' + req.session.username + '_' + fileDate() + ext;
	// 	  	fs.rename(file.path, newPath, data, function (err) {
	// 	    	if( !err ){
	// 	    		console.log( 'file written successfully!'.green );
	// 	    		res.send({ filepath: refPath });
	// 	    	} else {
	// 	    		res.send({ error: err });
	// 	    	}
	// 	 	});
	// 	} else {
	// 		res.send({ error: err })
	// 	}
	// });

	// var form = new formidable.IncomingForm();
	// console.log('form type: ' + form.type );

 //    form.parse(req, function(err, fields, files) {
 //    	if( !err ){
 //    		var file = files.image;
 //    		var ext = path.extname( file.name );
 //    		var newPath = __dirname + '/img/uploads/' + req.session.username + '_' + fileDate() + ext;
 //    		var refPath = 'img/uploads/' + req.session.username + '_' + fileDate() + ext;
 //    		console.log( 'file received: ' + file.name );
 //    		console.log( 'moving: ' + file.path + ' to: ' + newPath );
 //    		fs.rename(file.path, newPath, function(err){
 //    			if( !err ){
 //    				console.log('file moved successfully!'.green);
 //    				res.send({ filepath: refPath });
 //    			} else {
 //    				console.log(err);
 //    				res.send({ error: err });
 //    			}
 //    		})
 //    	} else {
 //    		res.send({ error: err })
 //    	}
    	
 //    });

 //    form.on('error', function(err) {
 //    	console.log('error:' + err);
 //    	res.send({ error: err })
	// });

	// form.on('field', function(name, value) {
	// 	console.log(name);
	// });
	
});

function fileDate(){
	var now = new Date();
	var monthnum = now.getMonth();
	var daynum = now.getDate();
	var yearnum = now.getFullYear();
	var hournum = now.getHours();

	var ts = '';

	if( hournum > 12 ){
		hournum = hournum - 12;
		ts = 'pm';
	} else {
		ts = 'am';

		if( hournum == 0 ){
			hournum = 12;
		}
	}

	var minnum = now.getMinutes();
	if( minnum < 10 ){
		minnum = '0' + minnum;
	}

	var secnum = now.getSeconds();
	if( secnum < 10 ){
		secnum = '0' + secnum
	}

	return monthnum + '-' + daynum + '-' + yearnum + '_' + hournum + '-' + minnum + '-' + secnum + ts;
}


app.use(express.compress());
app.use(express.static(__dirname, { maxAge: 345600000 } ));

app.listen(4055);
console.log('Forum server listening on port 4055')