var util = require('util');
var Core = require('../core/coreModel.js');
var monitorModel = require('./monitorModel.js');
var mongoose = require('mongoose');
var moment =require('moment');
/**
 * chat modelで使用するコレクション名.
 * 
 * @property collection
 * @type {String}
 * @default "chat"
 */
var collection = 'chats';
/**
 * 部屋とメッセージを保持するコレクション.
 * 
 * @property collection2
 * @type {String}
 * @default "messages"
 */
var collection2 = 'messages';
/**
 * 部屋とメッセージを保持するコレクション.
 * 
 * @property collection2
 * @type {String}
 * @default "messages"
 */
var collection3 = 'mymessages';
/**
 * 部屋とメッセージを保持するコレクション.
 * 
 * @property chatSchema
 * @type {Object}
 */
var chatSchema = new mongoose.Schema({
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  name: String,
  description: String,
  users: {type:Array},
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'messages' }]
});
/**
 * 部屋のメッセージを保持するコレクション.
 * 
 * @property messagesSchema
 * @type {Object}
 */
var messagesSchema = new mongoose.Schema({
  created: {type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss')},
  updated: {type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss')},
  creatBy: {type: String},
  updateBy: {type: String},
  user: {_id: Object, name: String},
  tag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tags' }],
  to: {ids: Array, names: Array},
  time: {type: String, default: moment().format('YYYY-MM-DD HH:mm:ss')},
  message: {type:String},
});
/**
 * 自分自身へ送信されたメッセージを保持するコレクション.
 * 
 * @property myMessageSchema
 * @type {Object}
 */
var myMessageSchema = new mongoose.Schema({
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  roomId:{type: String, default: ''},
  recipient:{type: String},//受信者
  readFlag:{type: Boolean},//既読や未読を設定する予定
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'messages' }],
});

// middleware
// save処理の前にフックをかけれる。RailsでいうFilterみたいな機能
chatSchema.pre('save', function (next) {
    
    next();
});

// モデル化。model('モデル名', '定義したスキーマクラス')
var myModel = mongoose.model(collection, chatSchema);
var messgeModel = mongoose.model(collection2, messagesSchema);
var myMsg = mongoose.model(collection3, myMessageSchema);
/**
 * Chat Model Class.
 *
 * @author niikawa
 * @namespace model
 * @class chatModel
 * @constructor
 * @extends Core
 */
var chatModel = function chatModel() {
    
    this.nextFunc = '';
    this.parameter = '';
    this.modelName = collection;
    
    Core.call(this, collection);
};

//coreModelを継承する
util.inherits(chatModel, Core);

/**
 * 部屋を作成する.
 * 
 * @author niikawa
 * @method save
 * @param {Object} req 画面からのリクエスト
 */
chatModel.prototype.save = function(req) {
    
    var chat = new myModel(req.body);

    //コールバック内で使用するため参照を保持
    var nextFunc  = this.nextFunc;
    var parameter = this.parameter;

    chat.save(function(err){
        if (err) {
            console.log(err);
            throw err;
        } else {

            if (typeof(nextFunc) == 'function') {
                console.log('chat save ok ');
                nextFunc(parameter);
            }
        }
    });
};
/**
 * メッセージを登録する.
 * 
 * @author niikawa
 * @method addMessage
 * @param {Object} data data.roomId data.userId
 */
chatModel.prototype.addMessage = function(data) {
    var Chat = this.db.model(collection);
    var My = this.db.model(collection3);
    var Tag = this.db.model('tags');
    
    Chat.findOne({ "_id" : data.roomId}, function(err, room){
        var message = new messgeModel();
        message.user = {_id:data.userId, name:data.userName};
        if (data.toTarget && data.toNameList) {
            
            message.to = {ids: data.toTarget, names:data.toNameList};
        } else {
            message.to = {ids: [], names:[]};
        }
        message.time = data.time;
        message.message = data.message;
        
        //タグは任意のため設定されているかを判定
        var tagId = 'X';
        if (data.tag) {
            
            tagId = (data.tag.length !== 0) ? data.tag[0]._id : 'X';
        }
        Tag.findOne({'_id': tagId}, function(err, item){
            if (item) message.tag.push(item);
            message.save();

            //監視対象のタグの場合は専用のコレクションに格納
            if (item && item.isMonitor ) {
                var monitor = new monitorModel();
                monitor.save(data.userId, message, data.toTarget);
            }
            
            room.messages.push(message);
            room.save();
            //TOに指定されているメンバーの固有メッセージ保持コレクションに登録
            data.toTarget.forEach(function(id){
                My.findOne({'recipient': id}, function(err, item) {
    
                    if (item === null || item.length === 0) {
                        console.log('target is not found');
                        var MySave = new myMsg();
                        MySave.recipient = id;
                        MySave.readFlag = false;
                        MySave.messages.push(message);
                        MySave.save();
                        
                    } else {
                        
                        item.readFlag = false;
                        item.messages.push(message);
                        item.save();
                    }
                });
            });
        });
    });
};
/**
 * 個別メッセージを登録する.
 * 
 * @author niikawa
 * @method addMyMessage
 * @param {Object} data
 */
chatModel.prototype.addMyMessage = function(data) {
    
    var MyMsg = new myMsg(data);

    MyMsg.save(function(err){
        if (err) {
            console.log(err);
            throw err;
        }
    });
};
/**
 * 部屋名、入れるユーザーの変更を行う.
 * 
 * @author niikawa
 * @method roomUpdate
 * @param {Object} data
 * @param {Function} callback
 */
chatModel.prototype.roomUpdate = function(data, callback) {

    var Chat = this.db.model(collection);
    Chat.findOne({ "_id" : data.roomId}, function(err, room){
        room.name = data.name;
        room.users = data.users;
        room.save();
        callback(err, '');
    });
};
/**
 * 指定期間内の部屋のメッセージを取得する.
 * 
 * @method getMessageById
 * @author niikwa
 * @param {Object} data data.roomId data.statsu
 * @param {Boolean} isMyRoom
 * @param {Object} callback
 */
chatModel.prototype.getMessageById = function(data, isMyRoom, callback) {
    var format = 'YYYY-MM-DD 00:00:00';
    var before = moment().format(format);
    //1日前
    if (data.status === 'beforedayStatus1') {
        before = moment().subtract('days', 1).format(format);
    //7日前
    } else if (data.status === 'beforedayStatus2') {
        before = moment().subtract('days', 7).format(format);
        
    //60日前
    } else if (data.status === 'beforedayStatus3') {
        before = moment().subtract('days', 60).format(format);
        
    //3ヶ月日前
    } else if (data.status === 'beforedayStatus4') {
        before = moment().subtract('months', 3).format(format);
    }
    var Tags = this.db.model('tags');
    
    if (isMyRoom) {
        
        var My = this.db.model(collection3);
        My.findOne({'recipient': data._id}).lean().populate(
            'messages', null , { 'created': { $gte: before } }, { sort: { 'created': 1 } })
            .exec(function(err, chatItem) {
                
                var opts = {path:'messages.tag', model:'tags'};
                Tags.populate(chatItem, opts, callback);
            });
    } else {
        
        var Chat = this.db.model(collection);
        Chat.findOne({'_id': data.roomId}).lean().populate(
            'messages', null , { 'created': { $gte: before } }, { sort: { 'created': 1 } })
            .exec(function(err, chatItem) {
                
                var opts = {path:'messages.tag', model:'tags'};
                Tags.populate(chatItem, opts, callback);
            });
    }

    
//    getMessage(data.roomId, before, callback);
};
/**
 * IDに合致する情報を取得する.
 * 
 * @method getById
 * @author niikawa
 * @param {Object} id Chat._id
 * @param {Function} callback
 */
chatModel.prototype.getById = function(id, callback) {
    var Chat = this.db.model(collection);
    var Tags = this.db.model('tags');
    Chat.findOne({'_id': id}).lean().populate(
        'messages', null , { 'created': { $gte: moment().format('YYYY-MM-DD 00:00:00') } }, { sort: { 'created': 1 } })
        .exec(function(err, chatItem) {
            
            var opts = {path:'messages.tag', model:'tags'};
            Tags.populate(chatItem, opts, callback);
        });
};
/**
 * IDに合致する情報を取得する.
 * 
 * @method getById
 * @author niikawa
 * @param {Object} id Chat._id
 * @param {Function} callback
 */
function getMessage(id, before, callback) {
    var Chat = this.db.model(collection);
    var Tags = this.db.model('tags');
    Chat.findOne({'_id': id}).lean().populate(
        'messages', null , { 'created': { $gte: before } }, { sort: { 'created': 1 } })
        .exec(function(err, chatItem) {
            
            var opts = {path:'messages.tag', model:'tags'};
            Tags.populate(chatItem, opts, callback);
        });
}

/**
 * 自分の入れる部屋を取得する.
 * 
 * @method getMyRoom
 * @author niikawa
 * @param {Object} req 画面からのリクエスト
 * @param {Function} callback
 */
chatModel.prototype.getMyRoom = function(req, callback) {

    var Chat = this.db.model(collection);
    var id = req.session._id;
    Chat.find({ "users._id" : { $in:[id] } },null, {sort:{'created': 1}},callback).populate('messages', null, null, { sort: { 'created': 1 } });
};
/**
 * 自分の入れる部屋を取得する.
 * 
 * @author niikawa
 * @method getMyRoomParts
 * @param {Object} req 画面からのリクエスト
 */
chatModel.prototype.getMyRoomParts = function(req) {
    
    //コールバック内で使用するため参照を保持
    var nextFunc  = this.nextFunc;
    var parameter = this.parameter;
    
    var Chat = this.db.model(collection);
    var id = req.session._id;
    Chat.find({ "users._id" : { $in:[id] } }, function(err, room) {

        if (err) {
            console.log(err);
            throw err;
        }

        if (typeof(nextFunc) == 'function') {

            nextFunc(parameter, room);
        } else {
            return room;
        }
    }).populate('messages');
};
/**
 * 本日以降の自分あてのＴＯメッセージを取得する.
 * 
 * @method getMyMessages
 * @author niikawa
 * @param {String} id ユーザーID
 * @param {Function} callback
 */
chatModel.prototype.getMyMessages = function(id,callback) {
    var My = this.db.model(collection3);
    var Tags = this.db.model('tags');
    My.findOne({'recipient': id}).lean().populate(
        'messages', null , { 'created': { $gte: moment().format('YYYY-MM-DD 00:00:00') } }, { sort: { 'created': 1 } })
        .exec(function(err, chatItem) {
            
            var opts = {path:'messages.tag', model:'tags'};
            Tags.populate(chatItem, opts, callback);
        });
};
/**
 * 自分あてのＴＯメッセージをすべて取得する.
 * 
 * @method getMyMessagesAll
 * @author niikawa
 * @param {String} id ユーザーID
 * @param {Function} callback
 */
chatModel.prototype.getMyMessagesAll = function(id,callback) {
    var My = this.db.model(collection3);
    var Tags = this.db.model('tags');
    My.findOne({'recipient': id}).lean().populate('messages', null, null, { sort: { 'created': 1 } })
        .exec(function(err, chatItem) {
            
            var opts = {path:'messages.tag', model:'tags'};
            Tags.populate(chatItem, opts, callback);
        });
};
/**
 * 自分がルームに入れるかを判定する
 * 
 * @method roomInCheck
 * @author niikawa
 * @param {String} id ユーザーID
 * @param {String} roomId ルームID
 * @param {Function} callback
 */
chatModel.prototype.roomInCheck = function(id, roomId, callback) {
    var Chat = this.db.model(collection);
    Chat.find( {$and: [{'_id' : roomId}, {"users._id" : { $in:[id] }} ] }, function(err, room) {
        var exsits = true;
        if (room.length === 0) exsits = false;
        callback(err, exsits);
    });
};
/**
 * 部屋を削除する.
 * 
 * @method removeById
 * @author niikawa
 * @param {String} id 削除対象のID
 * @param {Function} callback
 */
chatModel.prototype.removeById = function(id,callback) {
     
};
module.exports = chatModel;