var express = require('express');
var app = express();
var server = require('http').Server(app);

var mongodb = require('mongodb');
var mongoose = require('mongoose');
var assert = require('assert');
var url = 'mongodb://localhost:27017/appdb';

mongoose.connect(url, function (error) {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Connected!');
    }
});

// Mongoose Schema definition
var Schema = mongoose.Schema;

var MerchantSchema = new Schema({
    merchant_id: Number,
    merchant_code: String,
    merchant_domain: String,
    merchant_offer: [{ wallet_id: Number, offer_type: String, offer_percentage: String }]
});

var Merchant = mongoose.model('merchant_details', MerchantSchema);

var WalletSchema = new Schema({
    wallet_id: Number,
    name: String,
    service_url: String,
    service_key: String,
    service_password: String
});

var Wallet = mongoose.model('wallet_details', WalletSchema);

var MerchCustDetailSchema = new Schema({
    user_id: Number,
    merchant_id: Number,
    username: String
});

var MerchCustDetail = mongoose.model('merch_cust_details', MerchCustDetailSchema);

var SavedWalletSchema = new Schema({
    user_id: Number,
    wallet_id: Number,
    wallet_username: String,
    wallet_password: String
});

var SavedWallet = mongoose.model('saved_wallets', SavedWalletSchema);

/*var db = mongoose.createConnection(url);
db.once('open', function(err){
    if(err){
        console.log(err);
    } else{
        console.log('Connected to mongodb!');
    }
});
*/
/*var Db = mongodb.Db;
var Server = mongodb.Server;

var db = new Db('appdb', new Server("127.0.0.1", 27017, {auto_reconnect: false, poolSize: 4}));
db.open(function(err, db) {
    if(err!=null) {
        console.log("Connection opened!");
    }
    console.log("Ok: ", db);
});
*/
server.listen(3001);

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


//how to add a new merchant ?
// merchant name, wallets that merchant support;

/*
mongoose.connect('mongodb://localhost/chat', function(err){
    if(err){
        console.log(err);
    } else{
        console.log('Connected to mongodb!');
    }
});
var chatSchema = new mongoose.Schema({
    nick: String,
    msg: String,
    created: {type: Date, default: Date.now}
});
var Chat = mongoose.model('Message', chatSchema);
app.get('/', function(req, res){


    var value="";
   var newMsg= new Chat({msg:"msg",nick:"name"});
    
  
    Chat.remove({}, function(err) {
    if (!err) {
           console.log("done");
    }
    else {
           console.log("error");
    }
});

  

    newMsg.save(function(err){
    if (err) 
        throw err;
    else{
        console.log("saved");
    }
     });    

    Chat.find({},function(err,docs){



        value="jhnbjhbjhhjb";
        if (err) {
            console.log("err");
            value=" fjfvjrfkvjfkjvkrekhrejbrvrenv";
        }

   
        else{
             for(var k=0;k<docs.length;k++){
                value+=docs[k];
                value+="</b>";
             }
             value+="koooooo";
             res.json(docs);
             //JSON.stringify(docs)+"hi"+
             //res.send("hi"+ value);
        }
    }  );*/


var bodyParser = require('body-parser'); 
app.use(bodyParser.json());
var jsonParser = bodyParser.json();

//console.log(getSavedWallets(db, "amazon", "taste"));

app.get('/getSavedWallets', jsonParser, function (req, res) {
    
    //Saved Wallets:
    var merch_id;
    if (req.body.merchant_code) {
        Merchant.find({ merchant_code: "amazon" }, function (err, doc) {
           merch_id = doc.merchant_id;
        });
        var user_id;
        if(merch_id) {
            MerchCustDetail.find({ merchant_id: merch_id }, function (err, doc) {
                user_id = doc.user_id;
            });
            var wallet_ids = [];
            if(user_id) {
                SavedWallet.find({ user_id: user_id }, function (err, docs) {
                    docs.forEach(function(doc) {
                        wallet_ids.push(doc.wallet_id);
                    });
                });
            }

            if(wallet_ids != null && wallet_ids.length > 0) {
                wallet_ids.forEach(function(wallet_id) {
                    Wallet.find({ wallet_id : wallet_id }, function (err, docs) {
                        res.json(docs);
                    });    
                });
            }
        }
    }
    else {
        console.log('No merchant exists!');
    }
});



/*
app.get('/getWallets', jsonParser, function (req, res) {

    var merchant=req.body.merchant_code;
    var username=req.body.customer_username;
    //var amount=req.body.amount;
    var savedWallets = getSavedWallets(db, merchant,username);
    var notSavedWallets = getNotSavedWallets(db, merchant,username);

    res.send({"savedWallets":savedWallets,"notSavedWallets":notSavedWallets});
});
*/
function getSavedWallets(db, merchant_code, username){
    var obj = [];

    db.open(function(err, db) {
        assert.equal(null, err)
        console.log(db.collection);
        var cursor = db.collection('merchant_details').find({ "merchant_code": merchant_code });
        if(cursor.size() > 0) {
            var merchant_id = cursor.merchant_id;
            cursor = db.collection('merch_cust_details').find({"merchant_id": merchant_id});
            
            if(cursor.size() > 0) {
                cursor.each(function(err, doc) {
                    var user_id;
                    if(doc!=null) {
                        if (doc.username == username && doc.merchant_code == merchant_code) {
                            user_id = doc.user_id;
                        };
                    }
                });
            }
        }

        cursor = db.collection('saved_wallets').find();
        if(cursor.size() > 0){
            cursor.each(function(err,doc){
                if(doc != null){
                    if(doc.user_id == user_id){
                        //var wallet_id = offers.wallet_id;             
                        db = db.getSiblingDB('wallet_details');
                        obj.push(this.fetchWalletDetails(db,doc.wallet_id));
                    }
                }
            });
        }
    } );

    /*
    json.sort(function(a, b){
        return -(a.discount - b.discount);
    });*/

    return obj;
}

function  getNotSavedWallets( a,  b){
 var json= [{"kgkjg":"jfgfkj","discount":"10"},{"kgkjg":"jfgfkj","discount":"12"},{"kgkjg":"jfgfkj","discount":"14"}];
    json.sort(function(a, b){
    return -(a.discount - b.discount);
});
    return json;
}


function getWalletsWhichMerchantSupports(merchant){
    return "jfhvkjfh";
}




app.post('/makePaymentFromSavedWallet', jsonParser, function (req, res) {

var merchant=req.body.merchant_code;
var username=req.body.customer_username;
var amount  =req.body.amount;
var savedWallet =req.body.walletId;

var walletDetails= getSavedWalletDetails(merchant,username,savedWallet.id);

var payMentSucessful;

if(amount<=0)
    payMentSucessful=false;
else
payMentSucessful = makePayment(merchant,username,walletDetails);
//wallet.hitapi

});

app.post('/makePaymentFromNotSavedWallet', jsonParser, function (req, res) {

var merchant=req.body.merchant_code;
var username=req.body.customer_username;
var amount  =req.body.amount;
var savedWallet =req.body.walletId;
var walletDetails = req.body.walletDetails;
var isChecked = req.body.isChecked;


var walletDetails= getSavedWalletDetails(merchant,username,savedWallet.id);
var payMentSucessful;

if(amount<=0)
    payMentSucessful=false;
else
payMentSucessful = makePayment(merchant,username,walletDetails);


if(payMentSucessful){
    saveWalletDetails(merchant,user,walletId,walletDetails);
}
//wallet.hitapi

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