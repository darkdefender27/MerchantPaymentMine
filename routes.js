function findSavedWallets(db, merchant_code, username) {

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

	var obj = [];
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
	return obj;
}

var	findAvailableWallets = function(db) {
		var cursor = db.collection('merchant').find();

		cursor.each(function(err, doc) {

			if(doc!=null) {
				console.dir(doc);
				var offer = doc.merchant_offer;

				if(offer!=null) { 
					var wallet_id = offers.wallet_id;				
					db = db.getSiblingDB('wallet_details');
					/*var db = new Db('wallet_details', server_instance);
					 Establish connection to db
					db.open(function(err, db) {*/
					return this.fetchWalletDetails(db, wallet_id);
				}
				else {
					console.log("Empty Offers Collection");
				}
			} 
			else {
				callback();
			}
		});
}

var fetchWalletDetails = function(db, wallet_id) {
	var cursor = db.collection('wallet').find();
	cursor.each(function(err, doc){
		if(doc!=null && doc.wallet_id == wallet_id) {
			return doc;
		}
	});
}
