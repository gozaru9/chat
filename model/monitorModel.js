var util = require('util');
var Core = require('../core/coreModel.js');
var mongoose = require('mongoose');
var moment =require('moment');
/**
 * monitor modelで使用するコレクション名.
 * 
 * @property collection
 * @type {String}
 * @default "fixedSectence"
 */
var collection1 = 'monitors';
var collection2 = 'comments';
/**
 * 監視対象のメッセージを保持するコレクション.
 * 
 * @property monitorSchema
 * @type {Object}
 */
var monitorSchema = new mongoose.Schema({
  created: {type: Date, default: moment().format('YYYY-MM-DD hh:mm:ss')},
  updated: {type: Date, default: moment().format('YYYY-MM-DD hh:mm:ss')},
  creatBy: {type: String},
  updateBy: {type: String},
  status: {type: Number, default:1},//1:未着手 2:進行中 3:完了 9:却下
  responders: {type: Array},//対応者
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'messages' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comments' }]
});
/**
 * 監視対象のメッセージに対するコメントを保持するコレクション.
 * 
 * @property commentsSchema
 * @type {Object}
 */
var commentSchema = new mongoose.Schema({
  created: {type: Date, default: moment().format('YYYY-MM-DD hh:mm:ss')},
  updated: {type: Date, default: moment().format('YYYY-MM-DD hh:mm:ss')},
  creatBy: {type: String},
  updateBy: {type: String},
  user: {type: Array},
  comments: {type: String}
});

// モデル化。model('モデル名', '定義したスキーマクラス')
var myModel = mongoose.model(collection1, monitorSchema);
var commentModel = mongoose.model(collection2, commentSchema);

/**
 * monitor Model Class.
 *
 * @author niikawa
 * @namespace model
 * @class monitorModel
 * @constructor
 * @extends Core
 */
var monitorModel = function monitorModel() {
    
    this.nextFunc = '';
    this.parameter = '';
    this.modelName = collection1;
    
    Core.call(this, collection1);
};

//coreModelを継承する
util.inherits(monitorModel, Core);

/**
 * 監視対象のメッセージを取得する.
 * 
 * @method getMonitor
 * @author niikawa
 * @param {String} status
 * @param {Number} skip
 * @param {Number} limit
 * @param {Funtion} callback
 */
monitorModel.prototype.getMonitor = function(status, skip, limit, callback) {
    
    var Monitor = this.db.model(collection1);
    var Tags = this.db.model('tags');
    if (0 === Number(status)) {
        
        Monitor.find().lean().populate('messages', null , null, { sort: { 'created': -1 } }).skip(skip).limit(limit)
        .exec(function(err, monitorItem) {
                
                var opts = {path:'messages.tag', model:'tags'};
                Tags.populate(monitorItem, opts, callback);
            });
        
    } else {
        
        Monitor.find({'status':status}).lean().populate('messages', null , null, { sort: { 'created': -1 } }).skip(skip).limit(limit)
        .exec(function(err, monitorItem) {
                
                var opts = {path:'messages.tag', model:'tags'};
                Tags.populate(monitorItem, opts, callback);
            });
    }
};
/**
 * 指定されたステータスの監視メッセージ数を取得する
 * statusが0の場合はすべて取得
 * @method countByStatus
 * @author niikawa
 * @param {String} status 
 * @param {Funtion} callback
 */
monitorModel.prototype.countByStatus = function(status, callback) {
    
    var Monitor = this.db.model(collection1);
    if (0 === status) {
        Monitor.find({}).count(callback);
    } else {
        
        Monitor.find({'status':status}).count(callback);
    }
};
/**
 * 監視対象を登録する.
 * 
 * @method save
 * @author niikawa
 * @param {Object} id userId
 * @param {Object} messages messageModel
 * @param {Object} responders
 */
monitorModel.prototype.save = function(id, messages, responders) {
    
    var Monitor = new myModel();
    Monitor.creatBy = id;
    Monitor.updateBy = id;
    Monitor.responders = responders;
    Monitor.messages.push(messages);
    Monitor.save();
};
/**
 * 監視対象のメッセージを更新する
 * 
 * @method changeStatus
 * @author niikawa
 * @param {Object} req 画面からのリクエスト
 * @param {Function} callback
 */
monitorModel.prototype.changeStatus = function(data, callback) {
    var Monitor = this.db.model(collection1);
    Monitor.findOne({ "_id" : data._id}, function(err, target){
        
        target.updateBy = data.updateBy;
        target.updated = moment().format('YYYY-MM-DD hh:mm:ss');
        target.status = data.status;
        target.save(callback);
    });
};
/**
 * 監視対象から除外する
 * 
 * @method monitorOut
 * @author niikawa
 * @param {Object} req 画面からのリクエスト
 * @param {Function} callback
 */
monitorModel.prototype.monitorOut = function(data, callback) {
 
};
module.exports = monitorModel;