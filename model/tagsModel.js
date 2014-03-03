var util = require('util');
var Core = require('../core/coreModel.js');
var mongoose = require('mongoose');
var moment =require('moment');
/**
 * tags modelで使用するコレクション名.
 * 
 * @property collection
 * @type {String}
 * @default "tags"
 */
var collection = 'tags';
/**
 * tagを保持するコレクション.
 * 
 * @property chatSchema
 * @type {Object}
 */
var tagsSectenceSchema = new mongoose.Schema({
  created: {type: Date, default: moment().format('YYYY-MM-DD hh:mm:ss')},
  updated: {type: Date, default: moment().format('YYYY-MM-DD hh:mm:ss')},
  creatBy: {type: String},
  updateBy: {type: String},
  name: {type: String},
  color: {type: String},
  isMonitor: {type: Boolean, default:false},
});

// モデル化。model('モデル名', '定義したスキーマクラス')
var myModel = mongoose.model(collection, tagsSectenceSchema);

/**
 * tags Model Class.
 *
 * @author niikawa
 * @namespace model
 * @class tags
 * @constructor
 * @extends Core
 */
var tagsModel = function tagsModel() {
    
    this.nextFunc = '';
    this.parameter = '';
    this.modelName = collection;
    
    Core.call(this, collection);
};

//coreModelを継承する
util.inherits(tagsModel, Core);

/**
 * タグを取得する.
 * 
 * @method getTags
 * @author niikawa
 * @param {Number} skip
 * @param {Number} limit
 * @param {Funtion} callback
 */
tagsModel.prototype.getTags = function(skip, limit, callback) {
    var Tags = this.db.model(collection);
    Tags.find().sort({'created': 1}).skip(skip).limit(limit).exec(callback);
};
/**
 * タグを登録する.
 * 
 * @method save
 * @author niikawa
 * @param {Object} req 画面からのリクエスト
 * @param {Function} callback
 */
tagsModel.prototype.save = function(req, callback) {
    var Tags = new myModel(req.body);
    Tags.creatBy = req.session._id;
    Tags.updateBy = req.session._id;
    Tags.save(callback);
};
/**
 * タグを更新する.
 * 
 * @method update
 * @author niikawa
 * @param {Object} req 画面からのリクエスト
 * @param {Function} callback
 */
tagsModel.prototype.update = function(data, callback) {
    var Tags = this.db.model(collection);
    Tags.findOne({ "_id" : data.id}, function(err, target){
        
        var error = {};
        error.status = false;
        error.message = '';
        if (null === target) {
            error.status = true;
            error.message = '対象のタグがありませんでした。';
            callback(error, '');
        } else {
            target.updateBy = data.updateBy;
            target.updated = moment().format('YYYY-MM-DD hh:mm:ss');
            target.name = data.name;
            target.color = data.color;
            target.isMonitor = data.isMonitor;
            target.save();
            callback(error, '');
        }
    });
};
/**
 * 同一タグ名の存在有無をチェックする.
 * 
 * @method exists
 * @author niikawa
 * @param {String} val 
 * @param {Function} callback
 */
tagsModel.prototype.exists = function (val, callback) {
    var Tags = this.db.model(collection);
    Tags.find({'name':val}).count(callback);
};
module.exports = tagsModel;