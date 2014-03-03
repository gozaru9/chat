exports.index = function(req, res){
  res.render('login/index', {title: 'LOGIN', errMsg:''});
};