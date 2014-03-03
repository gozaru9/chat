var async = require('async');
var define = require('../config/define.js');
var utilsClass = require('../util/utils');
var utils = new utilsClass(); 
var userModel = require('../model/userModel');
var myModel = new userModel();
var fs = require('fs');
var logger = require('../util/logger');

/**
 * account server side
 * @namespace routes
 * @modeule account.js
 */
 
/**
 * ユーザーの一覧を取得し画面描画する
 * 
 * @author niikawa
 * @method index
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.index = function(req, res){
    logger.appDebug('account.index start');
    if (req.session.isLogin && req.session.role === 1) {
        
        var activePage = (req.query.pages) ? Number(req.query.pages) : 1;
        var skip = (activePage-1) * define.USER_PAGER_LIMIT_NUM;
        async.series(
            [function(callback) {
                myModel.getUser(skip, define.USER_PAGER_LIMIT_NUM, callback);
            },function(callback) {
                myModel.count(callback);
            }]
            ,function(err, result) {
                if (err) {
                    logger.appError('account.index : データ取得に失敗');
                    logger.appError(err);
                }
                //ページング処理
                var maxPage = Math.ceil(result[1] / define.USER_PAGER_LIMIT_NUM);
                var pager = utils.pager(activePage, maxPage, define.USER_PAGER_NUM);
                
                var data = {users: result[0], message: ''};
                res.render('account/index', 
                    { title: 'ユーザー管理', items: data, pager:pager, total:result[1],
                        _id: req.session._id, userName:req.session.name, role:req.session.role});
            }
        );
    } else {
        res.render('login/index', {title: 'LOGIN', errMsg:''});
    }
};
/**
 * IDに合致するユーザー情報を取得する
 * 
 * @author niikawa
 * @method index
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.getById = function(req, res) {
    logger.appDebug('account.getById start');
    myModel.getById(req.body._id, function(err, item){
        if (err) {
            logger.appError('account.getById : データ取得に失敗');
            logger.appError(err);
        }
        var errinfo = {status:false, message:''};
        //mongooseからのメッセージは英文なのでデータが取得できていなかった場合に詰める
        if (null === item) {
            errinfo.status = true;
            errinfo.message = '対象のユーザーが存在しません';
        }
        res.send({target: item, errinfo:errinfo});
    });
};
/**
 * 未使用のはず
 * 
 * @author niikawa
 * @method parts
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
 exports.parts = function(req, res){
    
    myModel.getAll(res,
        function(res,docs){
            res.send({items : docs});
        }
    );
};
/**
 * ユーザーの登録を行う
 * 
 * @author niikawa
 * @method regist
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.regist = function(req, res){

    if (req.method == 'GET') {
        
        res.render('account/regist',{title: 'ユーザー管理'}); 

    } else {
        
        myModel.save(req);
        res.redirect('/account');
    }
};
/**
 * CSVからのユーザーの一括登録を行う
 * 
 * @author niikawa
 * @method registcsv
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
 exports.registcsv = function(req, res) {
    logger.appDebug('aoount.registcsv start');
    fs.readFile(req.files.file.path, 'utf8', function(err, text) {
        //TODO ほんとはライブラリを入れたかった
        var data = text.split(/\r\n|\r|\n/);
        var num = data.length;
        var validationInfo = {status: false, target:[], message: ''};
        var userList = [];
        var mailList = {};
        //ロールバックできないため、まず全ユーザーのバリデーションチェックを行う
        for (var i = 0; i < num; i++) {
            var splitData = data[i].split(',');
            if (splitData[0] === '') continue;
            var userinfo = {name: splitData[0], mailAddress:splitData[1], 
                password:splitData[2], passwordConfirm: splitData[2], role:Number(splitData[3])};
            userList.push(userinfo);
            validationInfo = validation(userinfo);
            if (validationInfo.status) {
                validationInfo.message = i+1+'行目に不備があります。<br>'+validationInfo.message;
                break;
            }
            //読み込んだCSVで同一のメールアドレスが存在しているかをチェック
            if (userinfo.mailAddress in mailList) {
                validationInfo.status　= true;
                validationInfo.message = i+1+'行目に同じメールアドレスが存在します。';
                break;
            }
            mailList[userinfo.mailAddress] = userinfo;
        }
        if (validationInfo.status) {
            fs.unlink(req.files.file.path, function(err){
                res.send({validationInfo:validationInfo});
            });
        } else {
            
            var counter = 0;
            async.forEachSeries(userList, function(user, callback){
                counter++;
                myModel.exsitsMailAddress('', user.mailAddress, function(err, count) {
                    if (count === 0) {
                        myModel.saveByCsv(req.session._id, user);
                    } else {
                        
                        validationInfo.status = true;
                        validationInfo.target = [];
                        validationInfo.message = counter+'行目から取り込めませんでした:<br>'+user.mailAddress+'はすでに使用されているメールアドレスです';
                        res.send({validationInfo:validationInfo});
                        return false;
                    }
                    callback();
                });
            
            }, function(err){
                if (err) {
                    logger.appError('account.registcsv : 登録に失敗');
                    logger.appError(err);
                }
                fs.unlink(req.files.file.path, function(err){
                    res.send({validationInfo:validationInfo});
                });
            });
        }
    });
};
/**
 * プロフィールの更新を行う
 * 
 * @author niikawa
 * @method profileUpdate
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.profileUpdate = function(req, res) {
    
    //今のバージョンではパスワードのみ更新
    
    logger.appDebug('account.profileUpdate start');
    var validationInfo = {status: false, target:[], message: ''};
    validationInfo.message = checkPassword(req.body);
    if ('' !== validationInfo.message) {
        validationInfo.status = true;
        res.send({validationInfo: validationInfo});
    } else {
        
        myModel.getById(req.session._id, function(err, item) {
            //データ改ざんの可能性あり
            if (item.mailAddress !== req.body.mailAddress) {
                validationInfo.status = true;
                validationInfo.message = checkPassword(req.body);
                res.send({validationInfo: validationInfo});

            } else {
                myModel.profileUpdate(req, function(err) {
                    
                    if (err) {
                        logger.appError('account.profileUpdate : 更新に失敗');
                        logger.appError(err);
                    }
                    res.send({validationInfo: validationInfo});
                });
            }
        });
    }
};
/**
 * バリデーション(ajax版)
 * 
 * @author niikawa
 * @method validation
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.validation = function(req, res) {
    logger.appDebug('account.validation start');
    var validationInfo = validation(req.body);
    if (validationInfo.status) {
        if ('' === req.body.accountId) {
            
            validationInfo.message = '[ユーザー登録失敗]<br>'+validationInfo.message;
        } else {
            
            validationInfo.message = '[ユーザー更新失敗]<br>'+validationInfo.message;
        }
        res.send({validationInfo: validationInfo});
    } else {
        
        myModel.exsitsMailAddress(req.body.accountId, req.body.mailAddress, function(err, count) {
            if (err) {
                logger.appError('accont.validation exsitsMailAddress : データ取得に失敗');
                logger.appError(err);
            }
            if (count !== 0) {
                validationInfo.status = true;
                validationInfo.target = [];
                validationInfo.message = 'すでに使用されているメールアドレスです';
            }
            res.send({validationInfo: validationInfo});
        });
    }
};
/**
 * ユーザー情報を更新する
 * 
 * @author niikawa
 * @method update
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.update = function(req, res) {
    logger.appDebug('account.update start');
    myModel.exsitsMailAddress(req.body.accountId, req.body.mailAddress, function(err, count) {
        if (err) {
            logger.appError('account.update exsitsMailAddress : データ取得に失敗');
            logger.appError(err);
        }
        if (count !== 0) {

            myModel.getAll(res, function(res, docs){
                var data = {users: docs, message: 'すでに使用されているメールアドレスです'};
                res.render('account/index', 
                { title: 'ユーザー管理', items: data, _id: req.session._id, 
                    userName:req.session.name, role:req.session.role});
            });
        } else {
            
            myModel.update(req, function(err) {
                if (err) {
                    logger.appError('account.update : データの更新に失敗');
                    logger.appError(err);
                }
                res.redirect('/account');
            });
        }
    });
};
/**
 * ユーザー情報を削除する
 * 
 * @author niikawa
 * @method delete
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.delete = function(req, res) {
    logger.appDebug('chat.delete start');
    myModel.removeById(res,req.body._id,
        function(){
            res.redirect('/account');
        }
    );
};
/**
 * バリデーションを実行する
 * 
 * @author niikawa
 * @method validation
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 * @return {Object} 
 */
 function validation(data) {
    var validationInfo = {status: false, target:[], message: ''};
    //プロパティチェック
    if (!data.name || !data.mailAddress || !data.password || !data.passwordConfirm) {
        validationInfo.message = 'パラメータが改竄されています';
    }
    //必須チェック
    if (data.name.trim().length === 0) {
        validationInfo.message = 'ユーザー名は必須です';
    }
    if (data.mailAddress.trim().length === 0) {
        validationInfo.message = 'メールアドレスは必須です';
    }
    if (data.password.trim().length === 0) {
        validationInfo.message = 'パスワードは必須です';
    }
    if (data.mailAddress.trim().match(/.+@.+\..+/)==null) {
        validationInfo.message = 'メールアドレスの形式が不正です';
    }
    var checkMessage = checkPassword(data);
    if ('' !== checkMessage) {
        
        validationInfo.message = checkMessage;
    }
    if (validationInfo.message !== '') validationInfo.status = true;
    return validationInfo;
}
/**
 * パスワードのチェックを実行する
 * 
 * @author niikawa
 * @method checkPassword
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 * @return {String} message OKの場合は空文字
 */
function checkPassword(data) {
    //固有チェック
    if (data.password.trim() !== data.passwordConfirm.trim()) {
        return '入力されたパスワードが一致しません。';
    }
    if (data.password.trim().length < 8 || data.password.trim().length > 20) {
        return 'パスワードの文字数は<br>8から20文字です。';
    }
    return '';
}