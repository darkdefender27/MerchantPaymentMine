var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/my_database_name';

var express = require('express');
var app = express();
var server = require('http').Server(app);


MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {
        console.log('Connection established to', url);
        db.close();
    }
});


var mongoose = require('mongoose');
var assert = require('assert');
var url = 'mongodb://localhost:27017/test';


var wallets=[];
wallets[0]="A";
wallets[1]="B";
wallets[2]="C";
wallets[3]="D";


var merchantWallets=[];
var merchantUser=[];

//merchantDetails:
//wallets supported;
//users supported;
//user Details when user will make a separate call;
//when ever a new user comes we will add it into merchant array;

//UserDetails;
//saved wallets;


//walletDetails;
//discount offered;

//userWalletDetails;
//encrptedUsername;
//encrptedPassword;


//information while making call on pressing continute checkout : "merchant", "user"
// now we need to populate the UI : UI only needs how many saved wallets does the person has if at all 
// and how many wallets does the merchant support;

/*var merchants=[];
merchants[0]="amazon";
merchants[1]="foodpanda";
merchants[2]="realiancemart";
merchants[3]="myntra";*/


/*var merchantDetails=[];
merchantDetails["amazon"]=[];
merchantDetails[]="";*/


//how to add a new merchant ?
// merchant name, wallets that merchant support;



server.listen(3000);

mongoose.connect('mongodb://localhost/chat', function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Connected to mongodb!');
	}
});

app.get('/hello', function(req, res){

    var merchant="hfkfj";
    var username="jkdjcj";
    var savedWallets = getSavedWallets(merchant,username);
    var notSavedWallets = getNotSavedWallets(merchant,username);

    res.send({"savedWallets":savedWallets,"notSavedWallets":notSavedWallets});
});


var bodyParser = require('body-parser'); 
app.use(bodyParser.json());
var jsonParser = bodyParser.json();


app.post('/', jsonParser, function (req, res) {

var user=req.body.user;
var pass=req.body.pass;
res.send({"user":user,"pass":pass});
});


function  getSavedWallets( a,  b){

    var json= [{"kgkjg":"jfgfkj","discount":"10"},{"kgkjg":"jfgfkj","discount":"12"},{"kgkjg":"jfgfkj","discount":"0"}];
    json.sort(function(a, b){
    return -(a.discount - b.discount);
});
    return json;
}

function  getNotSavedWallets( a,  b){
 var json= [{"kgkjg":"jfgfkj","discount":"10"},{"kgkjg":"jfgfkj","discount":"12"},{"kgkjg":"jfgfkj","discount":"14"}];
    json.sort(function(a, b){
    return -(a.discount - b.discount);
});
    return json;
}


app.post('/getWallets', jsonParser, function (req, res) {

var merchant=req.body.merchant_code;
var username=req.body.customer_username;
//var amount=req.body.amount;

var savedWallets = getSavedWallets(merchant,username);
var notSavedWallets = getNotSavedWallets(merchant,username);

res.send({"savedWallets":savedWallets,"notSavedWallets":notSavedWallets});
});


app.post('/makePaymentFromSavedWallet', jsonParser, function (req, res) {

var merchant=req.body.merchant_code;
var username=req.body.customer_username;
var amount  =req.body.amount;
var savedWallet =req.body.wallet;

//wallet.hitapi
var savedWallets = getSavedWallets(merchant,username);
var notSavedWallets = getNotSavedWallets(merchant,username);

res.send({"savedWallets":savedWallets,"notSavedWallets":notSavedWallets});
});



//wallets and call the apis of wallets internally; 
//app.post('/')


//var MongoClient = require('mongodb').MongoClient;
//var io = require('socket.io').listen(server);

/*usernames["ank"]="pass";


server.listen(3000);
*/
/*
io.sockets.on('connection', function(socket){
	console.log("connected");
});

*/


 


//*/