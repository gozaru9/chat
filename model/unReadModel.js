var util = require('util');
var Core = require('../core/coreModel.js');
var mongoose = require('mongoose');
var moment =require('moment');
/**
 * unRead modelで使用するコレクション名.
 * 
 * @property collection
 * @type {String}
 * @default "unRead"
 */
var collection = 'unRead';
/**
 * 未読メッセージ件数を保持するコレクション.
 * 
 * @property unReadSchema
 * @type {Object}
 */
var unReadSchema = new mongoose.Schema({
  created: {type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss')},
  updated: {type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss')},
  roomId: {type: Object},
  userId: {type: Object},
  number: {type:Number},
});

// モデル化。model('モデル名', '定義したスキーマクラス')
var myModel = mongoose.model(collection, unReadSchema);

/**
 * unRead Model Class.
 *
 * @author niikawa
 * @namespace model
 * @class unReadModel
 * @constructor
 * @extends Core
 */
var unReadModel = function unReadModel() {
    
    this.nextFunc = '';
    this.parameter = '';
    this.modelName = collection;
    
    Core.call(this, collection);
};

//coreModelを継承する
util.inherits(unReadModel, Core);

/**
 * ユーザーの未読数を取得する.
 * 
 * @method getUnReadByUserId
 * @author niikawa
 * @param {String} id ユーザーID
 * @param {Funtion} callback
 */
unReadModel.prototype.getUnReadByUserId = function(id, callback) {
    
    console.log('-----------getUnReadByUserId-----------');
    console.log(id);
    var UnRead = this.db.model(collection);
    UnRead.find({'userId': id}, callback);
};

/**
 * 未読数を更新する.
 * 
 * @method updateUnRead
 * @author niikawa
 * @param {Object} data data.roomId data.userId data.unReadNum
 * @param {Funtion} callback
 */
unReadModel.prototype.updateUnRead = function(data, callback) {
    
    var UnRead = this.db.model(collection);
    UnRead.findOne({ "userId" : data.userId.toString(), 'roomId': data.roomId.toString()}, function(err, target){
        console.log('----------unRead model updateUnRead------');
        console.log(target);
        if (target === null) {
            
            var saveUnRead = new myModel();
            saveUnRead.roomId = data.roomId.toString();
            saveUnRead.userId = data.userId.toString();
            saveUnRead.number = data.unReadNum;
            saveUnRead.save();
            
        } else {
            
            target.updated = moment().format('YYYY-MM-DD HH:mm:ss');
            target.number = data.unReadNum;
            target.save();
        }
        if (callback !== null) {
            
            callback(err, '');
        }
    });
    
};
module.exports = unReadModel;