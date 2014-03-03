/**
 * incidnt server side
 * @namespace routes
 * @modeule incidnt.js
 */
var async = require('async');
var define = require('../config/define.js');
var utilsClass = require('../util/utils');
var utils = new utilsClass(); 
var monitorModel = require('../model/monitorModel');
var monitor = new monitorModel();
var logger = require('../util/logger');

/**
 * リクエストを受け取り、incidnt画面を描画する
 * 
 * @author niikawa
 * @method index
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.index = function(req, res){
    logger.appDebug('incidnt.index start');
    if (req.session.isLogin) {
        var activePage = (req.query.pages) ? Number(req.query.pages) : 1;
        var skip = (activePage-1) * define.INCIDNT_PAGER_LIMIT_NUM;
        var status = (req.query.status) ? Number(req.query.status) : 0;
        async.series(
            [function(callback) {
                
                monitor.getMonitor(status, skip, define.INCIDNT_PAGER_LIMIT_NUM, callback);
            },function(callback) {
                
                monitor.countByStatus(status, callback);
            }]
            ,function(err, result) {
                
                if (err) {
                    logger.appError('incidnt.index : データ取得に失敗');
                    logger.appError(err);
                }
                setStatusDispName(result[0]);
                //ページング処理
                var maxPage = Math.ceil(result[1] / define.INCIDNT_PAGER_LIMIT_NUM);
                var pager = utils.pager(activePage, maxPage, define.INCIDNT_PAGER_NUM);
                res.render('chat/incidnt', 
                { title: 'incidnt管理', incidnts: result[0], status: status, total:result[1],
                    pager:pager, _id: req.session._id,userName: req.session.name, role:req.session.role});
            }
        );
        
    } else {
        res.render('login', {title: 'LOGIN', errMsg:''});
    }
};
/**
 * リクエストを受け取り、監視メッセージを取得する（ajax）
 * 
 * @author niikawa
 * @method getIncidnt
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.getIncidnt = function(req, res) {
    logger.appDebug('incidnt.getIncidnt start');
    var activePage = (req.body.pages) ? Number(req.body.pages) : 1;
    var skip = (activePage-1) * define.INCIDNT_PAGER_LIMIT_NUM;
    var status = (req.body.status) ? Number(req.body.status) : 0;
    async.series(
        [function(callback) {
            
            monitor.getMonitor(status, skip, define.INCIDNT_PAGER_LIMIT_NUM, callback);
        },function(callback) {
            
            monitor.countByStatus(status, callback);
        }]
        ,function(err, result) {
            
            if (err) {
                logger.appError('incidnt.getIncidnt : データ取得に失敗');
                logger.appError(err);
            }
            
            //TODO 以下の処理は美しくないからリファクタリングしたい
            
            if (result[0].length === 0 && activePage > 1) {
                
                //表示しているページのインシデントがなくなっているため
                //前ページのものを取得する必要がある
                activePage = activePage-1;
                skip = (activePage-1) * define.INCIDNT_PAGER_LIMIT_NUM;
                monitor.getMonitor(status, skip, define.INCIDNT_PAGER_LIMIT_NUM, function(err, items) {
                    
                    if (err) {
                        logger.appError('incidnt.getIncidnt getMonitor : データ取得に失敗');
                        logger.appError(err);
                    }
                    
                    //ページング処理
                    var maxPage = Math.ceil(result[1] / define.INCIDNT_PAGER_LIMIT_NUM);
                    var pager = utils.pager(activePage, maxPage, define.INCIDNT_PAGER_NUM);
                    setStatusDispName(items);
                    res.send({incidnts: items, total:result[1], pager:pager});
                });

            } else {
                
                //ページング処理
                var maxPage = Math.ceil(result[1] / define.INCIDNT_PAGER_LIMIT_NUM);
                var pager = utils.pager(activePage, maxPage, define.INCIDNT_PAGER_NUM);
                setStatusDispName(result[0]);
                res.send({incidnts: result[0], total:result[1], pager:pager});
            }
        }
    );
    
};
/**
 * リクエストを受け取り、ステータスを更新する(ajax)
 * 
 * @author niikawa
 * @method changeStatus
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.changeStatus = function(req, res) {
    logger.appDebug('incidnt.changeStatus start');
    if (req.body._id) {
        var data = {_id:req.body._id, status:req.body.status, userId:req.session._id};
        monitor.changeStatus(data, function(err){
            if (err) {
                logger.appError('incidnt.changeStatus : 更新に失敗');
                logger.appError(err);
                res.send({status:false});
            } else {
                res.send({status:true});
            }
        });
    } else {
        res.send({status:false});
    }
};
/**
 * リクエストを受け取り、タグを作成する
 * 
 * @author niikawa
 * @method setStatusDispName
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
function setStatusDispName(data) {
    logger.appDebug('setStatusDispName');
    var num = data.length;
    for (var index=0; index < num ; index++) {
        
        switch (data[index].status) {
            
            case 1:
                data[index].statusName = 'open';
                break;
            case 2: 
                data[index].statusName = 'in progress';
                break;
            case 3: 
                data[index].statusName = 'close';
                break;
            case 9: 
                data[index].statusName = 'remove';
                break;
            default: 
                data[index].statusName = 'Unknown';
                break;
        }
    }
}