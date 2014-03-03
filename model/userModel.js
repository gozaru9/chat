var util = require('util');
var Core = require('../core/coreModel.js');
var mongoose = require('mongoose');
var crypto = require('crypto');
var collection = 'users';
var moment =require('moment');

/**
 * ユーザーを保持するコレクション.
 * 
 * @property chatSchema
 * @type {Object}
 */
var usersSchema = new mongoose.Schema({
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  creatBy: {type: String},
  updateBy: {type: String},
  name: String,
  mailAddress: String,
  role:{type: Number, default: 0},
  password: String,
  loginStatus: {type: Number, default: 1},
  lastLoginTime: {type: Date, default: Date.now},
  unreadjudgmentTime: {type: String},
  socketId:String
});

// middleware
// save処理の前にフックをかけれる。RailsでいうFilterみたいな機能
usersSchema.pre('save', function (next) {
    
    next();
});

// モデル化。model('モデル名', '定義したスキーマクラス')
var myModel = mongoose.model(collection, usersSchema);

/**
 * User Model Class.
 *
 * @author niikawa
 * @namespace model
 * @class userModel
 * @constructor
 * @extends Core
 */
var userModel = function userModel() {
    
    this.nextFunc = '';
    this.parameter = '';
    Core.call(this, collection);
};

//coreModelを継承する
util.inherits(userModel, Core);

/**
 * ログイン
 * 未使用
 * @author niikawa
 * @parameter mailAddress
 * @parameter password
 * @parameter callback
 */
userModel.prototype.login = function(mailAddress, password, callback){

    var User = this.db.model(collection);
    var cryptoPass = 
        crypto.createHash('md5').update(password).digest("hex");
    console.log(mailAddress);
    console.log(cryptoPass);
    
    User.find({'mailAddress':mailAddress, 'password':cryptoPass}, callback);
};
/**
 * ユーザーを取得する.
 * 
 * @method getUser
 * @author niikawa
 * @param {Number} skip
 * @param {Number} limit
 * @param {Funtion} callback
 */
userModel.prototype.getUser = function(skip, limit, callback) {
    var User = this.db.model(collection);
    User.find().sort({'created': 1}).skip(skip).limit(limit).exec(callback);
};
/**
 * ユーザーを登録する
 * 
 * @method save
 * @author niikawa
 * @param {Object} req
 * */
userModel.prototype.save = function(req){
    req.body.role = req.body.role ? 1 : 0;
    var user = new myModel(req.body);
    console.log(req.body);
    user.creatBy = req.session._id;
    user.updateBy = req.session._id;
    user.password = crypto.createHash('md5').update(user.password).digest("hex");

    /*
    if (user.password != user.passwordConfirm) {
        console.log('password not match');
        return;
    }
    */
    user.save(function(err){
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log('DB CONNECTION OK');
        }
    });
};
/**
 * CSVからのユーザー情報を登録する
 * 
 * @method saveByCsv
 * @author niikawa
 * @param {String} id
 * @param {Object} data
 */
userModel.prototype.saveByCsv = function(id, data){
    var user = new myModel(data);
    user.creatBy = id;
    user.updateBy = id;
    user.password = crypto.createHash('md5').update(user.password).digest("hex");
    user.save(function(err){
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log('DB CONNECTION OK');
        }
    });
};
/**
 * ユーザーとソケットIDを紐づける
 * 
 * @method updateSocketId
 * @author niikawa
 * @param {String} userId
 * @aram {String} socketId
 * */
userModel.prototype.updateSocketId = function (userId, socketId) {
    
    console.log('----------------update socketId----------------');
    console.log(userId + ':'+ socketId);

    var User = mongoose.model(collection);
    User.findOne({_id:userId},function(err, target){
        if (err) {
            console.log('update socketId error:'+userId);
        } else {
            console.log(target);
            target.socketId = socketId;
            target.save();
        }
    });
};
/**
 * ステータスを更新する
 * 
 * @method updateStatus
 * @author niikawa
 * @param {String} userId
 * @param {Number} status 1:Available,2:Busy,3:Away,4:Return home
 */
userModel.prototype.updateStatus = function(userId, status) {

    var User = mongoose.model(collection);
    User.findOne({_id:userId},function(err, target){
        if (err) {
            console.log('update status error:'+userId);
        } else {
            console.log(target);
            target.loginStatus = status;
            target.save();
        }
    });
};
/**
 * ログアウトする
 * 
 * @method logout
 * @author niikawa
 * @param {String} id
 */
userModel.prototype.logout = function(id) {
    
    var User = mongoose.model(collection);
    User.findOne({_id:id},function(err, target){
        if (err) {
            console.log('logout error:'+id);
        } else {
            target.loginStatus = 4;
            target.unreadjudgmentTime = moment().format('YYYY-MM-DD HH:mm:ss');
            target.save();
        }
    });
};
/**
 * 同一のメールアドレスを持つユーザーがいないことを確認する
 * idがから文字ではない場合は、「id以外」の条件を追加してカウントする
 * 
 * @method exsitsMailAddress
 * @author niikawa
 * @param {String} id
 * @param {String} mailAddress
 * @param {Function} callback
 */
userModel.prototype.exsitsMailAddress = function(id, mailAddress, callback) {
    var User = mongoose.model(collection);
    if ('' === id) {
        
        User.find({'mailAddress':mailAddress}).count(callback);
    } else {
        
        User.find({ $and: [{'mailAddress':mailAddress} , {'_id': {$ne: id}}] }).count(callback);
    }
};
/**
 * 更新する
 * 
 * @method update
 * @author niikawa
 * @param {Object} req
 * @param {Function} callback
 * */
userModel.prototype.update = function(req, callback) {

    req.body.role = req.body.role ? 1 : 0;
    var User = mongoose.model(collection);
    User.findOne({_id:req.body.accountId},function(err,target){
        if(err || target === null){
            
            callback();
        }
//        target.updateBy = req.session._id;
        target.updated = moment().format('YYYY-MM-DD HH:mm:ss');
        target.name = req.body.name;
        target.mailAddress = req.body.mailAddress;
        target.role = req.body.role;
        target.password = crypto.createHash('md5').update(req.body.password).digest("hex");
        target.save(callback);
    });
};
/**
 * プロフィールを更新する
 * 
 * @method profileUpdate
 * @author niikawa
 * @param {Object} req
 * @param {Function} callback
 */
userModel.prototype.profileUpdate = function(req, callback) {
    
    var User = mongoose.model(collection);
    User.findOne({_id:req.session._id},function(err,target){
        if(err || target === null){
            
            callback();
        }
        target.updated = moment().format('YYYY-MM-DD HH:mm:ss');
        target.password = crypto.createHash('md5').update(req.body.password).digest("hex");
        target.save(callback);
    });
};
/**
 * 削除する
 * 
 * @method removeById
 * @author niikawa
 * @param {Object} req
 * @param {Function} callback
 * */
userModel.prototype.removeById = function(res, id,callback) {
     
    var User = mongoose.model(collection);
    User.findOne({_id:id},function(err,target){
    if(err || target === null){return;}
        target.remove(callback);
    });
 };
module.exports = userModel;