var log4js = require('log4js');
log4js.configure(require('../config/log4js_setting.json'));
/* アクセスログとか**/
var reqLogger = log4js.getLogger('request');
reqLogger.setLevel('ERROR'); //ログレベルはここで変更
/* アプリケーションログ**/
var appLogger = log4js.getLogger('application');
appLogger.setLevel('ERROR'); //ログレベルはここで変更

exports.requestDebug = function(mesage){
    reqLogger.debug(mesage);
};
exports.requestInfo = function(mesage){
    reqLogger.info(mesage);
};
exports.requestWarn = function(mesage){
    reqLogger.warn(mesage);
};
exports.requestError = function(mesage){
    reqLogger.error(mesage);
};
exports.requestFatal = function(mesage){
    reqLogger.fatal(mesage);
};
exports.appDebug = function(mesage){
    appLogger.debug(mesage);
};
exports.appInfo = function(mesage){
    appLogger.info(mesage);
};
exports.appWarn = function(mesage){
    appLogger.warn(mesage);
};
exports.appError = function(mesage){
    appLogger.error(mesage);
};
exports.appFatal = function(mesage){
    appLogger.fatal(mesage);
};
