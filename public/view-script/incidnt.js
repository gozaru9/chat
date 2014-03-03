var check = function(val) {
    switch(Number(val)) {
        case 1:
        case 2:
        case 3:
        case 9:
            return true;
        default:
            return false;
    }
};
var statusChangeError = function() {
    $().toastmessage('showToast', {
        text     : 'ステータスの更新に失敗しました',
        sticky   : true,
        type     : 'error'
    });
}
var getIncidntError = function() {
    $().toastmessage('showToast', {
        text     : '情報の取得に失敗しました',
        sticky   : true,
        type     : 'error'
    });
}
var getIncidnt = function(condition) {
    $.ajax({
        type: 'POST',
        url: '/incidnt/getIncidnt',
        dataType: 'json',
        data: condition,
        cache: false,
        success: function(data) {
            console.log(data);
            var incNum = data.incidnts.length;
            var element = "";
            for (var i=0; i<incNum; i++) {
                element += '<tr><td class="hidden-xs"><p><span class="tag text-center" style="background-color:'+data.incidnts[i].messages[0].tag[0].color+'">'+data.incidnts[i].messages[0].tag[0].name+'</span></p></td>';
                element += '<td><div class="dropdown"><a href="'+data.incidnts[i]._id+'" class="dropdown-toggle" data-toggle="dropdown">'+data.incidnts[i].statusName+'</a>';
                element += '<ul name="statusList" class="dropdown-menu">';
                var add1 = '';
                if (data.incidnts[i].status === 1) add1 = 'class="disabled"';
                element += '<li '+add1+'><a href="#" value="1" onclick="statusChange(this)">open</a></li>';
                var add2 = '';
                if (data.incidnts[i].status === 2) add2 = 'class="disabled"';
                element += '<li '+add2+'><a href="#" value="2" onclick="statusChange(this)">in progress</a></li>';
                var add3 = '';
                if (data.incidnts[i].status === 3) add3 = 'class="disabled"';
                element += '<li '+add3+'><a href="#" value="3" onclick="statusChange(this)">close</a></li>';
                var add9 = '';
                if (data.incidnts[i].status === 9) add9 = 'class="disabled"';
                element += '<li '+add9+'><a href="#" value="9" onclick="statusChange(this)">remove</a></li></ul></div></td>';
                element += '<td class="hidden-xs">'+data.incidnts[i].messages[0].user.name+'</td>';
                element += '<td class="hidden-xs">'+data.incidnts[i].messages[0].to.names.join()+'</td>';
                element += '<td>'+data.incidnts[i].messages[0].message+'</td></tr>';
            }
            $('#pagerTop').children().remove();
            $('#pagerBottom').children().remove();
            if (data.pager.maxPage > 1) {
                var pageElement = '';
                pageElement += '<li><a href="/incidnt/?status='+condition.status+'&pages=1">&laquo;</a></li>';
                for (var pageIndex=data.pager.startPage; pageIndex<=data.pager.endPage; pageIndex++) {
                    var activeClass = '';
                    if (data.pager.activePage == pageIndex) activeClass = 'class="active"';
                    pageElement += '<li '+activeClass+'>';
                    pageElement += '<a href="/incidnt/?status='+condition.status+'&pages='+pageIndex+'">'+pageIndex+'</a></li>';
                }
                pageElement += '<li><a href="/incidnt/?status='+condition.status+'&pages="'+data.pager.maxPage+'">'+'&raquo;</a></li>';
                $('#pagerTop').append(pageElement);
                $('#pagerBottom').append(pageElement);
            }
            $('#incidntsTable').children().remove();
            $('#incidntsTable').append(element);
    　　},
    　　error: function(XMLHttpRequest, textStatus, errorThrown) {
            getIncidntError();
            console.log(XMLHttpRequest);
            console.log(textStatus);
    　　},
    });
};
var statusChange = function (target) {
    
        $(target).parent().parent().parent().parent().parent().attr('name', 'close');
        if ($(target).parent().parent().parent().children('a').attr('href') && check($(target).attr('value'))) {
            
            var updatdata = {
                _id:$(target).parent().parent().parent().children('a').attr('href'),
                defore:$(target).text(),
                status:$(target).attr('value')};
            $.ajax({
                type: 'POST',
                url: '/incidnt/changeStatus',
                dataType: 'json',
                data: updatdata,
                cache: false,
                success: function(data) {
                    if (data.status) {
                        if ( $('#viewStatus').val() == 0 ) {
                            
                            $(target).parent().parent().parent().children('a').text($(target).text());
                        } else {
                            
                            $('tr[name=close]').hide(500);
                        }
                        
                        getIncidnt({status:$("#viewStatus").val(), pages:$("#activePage").val()});
                        var socket = io.connect(location.hostname);
                        socket.emit('incident status change', updatdata);
                    } else {
                        statusChangeError();
                    }
            　　},
            　　error: function(XMLHttpRequest, textStatus, errorThrown) {
                    statusChangeError();
                    console.log(XMLHttpRequest);
                    console.log(textStatus);
            　　},
            });
        }
        $('div').removeClass("open");
        return false;
    
};
$(function() {
    
    $('#dispNum').spinner({
        max: 100,
        min: 5,
        step: 5
    });
    $('input[name=statusRadio]:radio').change(function(){
        
        location.href="/incidnt/?status="+$(this).val();
    });
    $("#statusSelect").change(function(){
        
        location.href="/incidnt/?status="+$(this).val();
    })
    $('ul[name=statusList]').on('click', 'a', function(){
        statusChange($(this));
    });
});