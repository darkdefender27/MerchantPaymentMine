var express = require('express');
var app = express();
var server = require('http').Server(app);

var mongodb = require('mongodb');
var mongoose = require('mongoose');
var assert = require('assert');
var url = 'mongodb://localhost:27017/appdb';
var serialNum = 1;

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

var bodyParser = require('body-parser'); 
app.use(bodyParser.json());
var jsonParser = bodyParser.json();

server.listen(3001);

//URL-MAPPINGS
app.get('/getSavedWallets', jsonParser, function (req, res) {
    
    //Saved Wallets:
    var merch_id;
    var username = req.body.username;
    var merchant_code = req.body.merchant_code;
    //merchant_code = "amazon";
    //username = "eshwar.more";
    if (!!merchant_code) {


        Merchant.find({ merchant_code: merchant_code }, function (err, doc) {
           console.log("am here");
           console.log(doc);
           merch_id = doc[0].merchant_id;
           console.log('Merchant Id: ' + merch_id);
           var user_id;
        if(!!merch_id) {


            MerchCustDetail.find({ merchant_id: merch_id, username: username }, function (err, doc) {
                user_id = doc[0].user_id;
                console.log("user id:" + user_id);
                var wallet_ids = [];
            if(!!user_id) {


                SavedWallet.find({ user_id: user_id }, function (err, docs) {
                    docs.forEach(function(doc) {
                        wallet_ids.push(doc.wallet_id);
                        console.log('wid'+ doc.wallet_id);
                    });

                if(wallet_ids != null && wallet_ids.length > 0) {
                wallet_ids.forEach(function(wallet_id) {

                    Merchant.find({ 'merchant_offer.wallet_id' : wallet_id }, function (err, docs) {
                        //res.json(docs);
                        //res.add(docs);
                        console.log('hello' + docs);
                        res.json(wallet_ids);
                        return;
                    });    
                });
            }
                });
            
            }else{
                console.log("first time user");
            }
            });
        }
        else{
            console.log('Invalid merchant!');
        }
        });
}
    else {
        console.log('No merchant exists!');
        
    }
   
});

app.post('/getUnsavedWallets', function (req, res) {

    req_merchant_code = req.body.merchant_code;
    //req_merchant_code = "amazon";
    //ON HOLD

    if(req_merchant_code!=null) {
        Merchant.find({merchant_code: req_merchant_code}, function (err, docs) {
            console.log(docs);
            res.json(docs);
        });
    }
});

app.get('/makePayment', jsonParser, function (req, res) {

    var req_merchant_code = req.body.merchant_code;
    var req_username = req.body.username;
    var wallet_id = req.body.wallet_id;
    var wallet_username = req.body.wallet_username;
    var wallet_password = req.body.wallet_password;

    req_merchant_code = "amazon";
    req_username = "eshwar.more";
    wallet_id = 1;
    wallet_username = "shyam";
    wallet_password = "shyam";

    var merchant_id;
    if(req_merchant_code != null && req_username != null)
    {
        console.log('merchnt id' + req_merchant_code + 'username' + req_username);
        Merchant.find({ merchant_code: req_merchant_code }, function (err, doc) {
        merchant_id = doc[0].merchant_id;
        var user_id;
        if(merchant_id != null)        
        {
            console.log('mer id' + merchant_id);
            
                user_id = serialNum;
                serialNum++;
                console.log(user_id);
      
                if(user_id != null && wallet_id!=null && wallet_username != null && wallet_password != null) 
                {
                    var saveWallet = new SavedWallet({
                        user_id: user_id,
                        wallet_id: wallet_id,
                        wallet_username: wallet_username,
                        wallet_password: wallet_password
                    });

                    var merchCust = new MerchCustDetail({
                        user_id : user_id,
                        merchant_id : merchant_id,
                        username : req_username

                    });

                    saveWallet.save(function(err, saveWallet) {
                        if (err) {
                            return console.error(err);
                        }                         
                        console.dir(saveWallet);
                    });

                    merchCust.save(function(err, merchCust) {
                        if (err) {
                            return console.error(err);
                        }                         
                        console.dir(merchCust);
                    });
                }
        }
    });
}

});
app.post('/makePaymentFromSavedWallet', jsonParser, function (req, res) {

    var req_merchant_code = req.body.merchant_code;
    var req_username = req.body.username;
    var wallet_id = req.body.wallet_id;

    //Retrieve MOCK

    res.send();

});

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

});