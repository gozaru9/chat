var utils = function utils() {

}
utils.prototype.pager = function(activePage, maxPage, delimiterPageNum) {
    var diff = maxPage - activePage;
    //activeなページより1つ前のページ数を表示する
    var startPage = 0;
    var endPage = 0;
    if (maxPage < delimiterPageNum) {
        startPage = 1;
        endPage = maxPage;
    } else if (delimiterPageNum > diff) {
        //開始位置を含むため-1
        var num = (delimiterPageNum - diff - 1);
        startPage = num === 0 ? activePage - 1 : activePage - num;
        endPage = startPage + (delimiterPageNum - 1);
    } else {
        startPage = (activePage === 1) ? activePage : activePage-1;
        endPage = startPage + (delimiterPageNum - 1);
    }
    var pager = {
        startPage: startPage,
        endPage: endPage,
        activePage: activePage, 
        maxPage:maxPage
    };
    return pager;
};

module.exports = utils;