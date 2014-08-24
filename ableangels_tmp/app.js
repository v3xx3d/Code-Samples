var host = "";
if( process.env["NODE_ENV"] == "development" ){
	host = "192.168.1.102";
	// host = "vexterity.com";
} else {
	host = "localhost";
}

var express = require('express')
var app = express()

// need to get rid of this because of security issues. 
var bodyParser = require('body-parser')

var port = 3000;


//database bizniss
var mongojs = require('mongojs');
var databaseurl = host + ":27017/AbleAngels";
var collections = ['submissions'];
var db = mongojs(databaseurl, collections);



app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded() ); // to support URL-encoded bodies

app.post("/form-submit", function(req,res){
	console.log("Form submission!")

	if( req.body.name && req.body.email && req.body.phone ){
		console.log('submission accepted')

		console.log("Name: " + req.body.name);
		console.log("Email: " + req.body.email);
		console.log("Phone: " + req.body.phone);

		var submission = {
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone
		}

		db.submissions.save(submission);
	}

	// redirect back to a fresh home page until we get a thank you creative
	res.redirect("/");
})

app.use("/", express.static(__dirname));

app.listen(port)

console.log('App listening on port ' + port);