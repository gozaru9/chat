var socket = io.connect(location.hostname);
var tabMove = function() {
    $('#isActive').val(0);
};
var tabReturn = function() {
    $('#isActive').val(1);
    updateActiveRoomUnRead();
};
var updateActiveRoomUnRead = function() {
    var target = $('div[name*=roomList]').find(".active").attr("name");
    updateUnReadNum(target, 0);
    $('li[name='+target+']').children().children().remove();
    window.document.title = $('#roomName').text();
};
var memberEditCompleteButtonCheck = function (){
    if ( $('#selectedEditMember option' ).length !== 0 ) {
        $('#memberEditCompleteButton').removeAttr("disabled");
    } else {
        $('#memberEditCompleteButton').attr("disabled", "disabled");
    }
};
var createMemberList = function(users) {
    $('#roomUserList').children().remove();
    var length = users.length;
    var toElement = '';
    for (var i = 0; i < length; i++) {
        $('#roomUserList').append($("<li>",{name: users[i]._id}).append(
            $("<i>",{class: users[i].status})).append(users[i].name));
        toElement += '<li><a name="toTarget" href="#">'+users[i].name+'</a></li>';
    }
    document.getElementById("toUl").innerHTML = toElement;
};
var createMessageElement = function(roomId, data) {
    var names = (data.toNameList) ? data.toNameList.join() : data.to.names.join();
    var namesElement = '';
    if (names !==  '') namesElement = '<p><span class="label label-success text-center">TO</span>'+' &nbsp;'+names+'</p>';
    var tagsElement = '';
    if (data.tag) {
        if (data.tag.length !== 0) {
            tagsElement = '<p><span class="tag text-center" style="background-color:'+data.tag[0].color+'">'+data.tag[0].name+'</span><span class="pull-right glyphicon glyphicon-ok"></span></p>';
        }
    }
    var sender = (data.userName) ? data.userName : data.user.name;
    $('#'+roomId).append(
//        $('<ul  class="chat">'+tagsElement3+'<li class="left clearfix"><!--<span class="chat-img pull-left"><img src="img/ff.gif" alt="User Avatar" class="img-circle" /></span>--><div class="chat-body clearfix"><div name="reseveMessage" class="header"><strong class="primary-font">'
        $('<ul name="message" class="chat"><li class="clearfix"><!--<span class="chat-img pull-left"><img src="img/ff.gif" alt="User Avatar" class="img-circle" /></span>--><div class="chat-body clearfix"><div name="reseveMessage" class="header"><strong class="primary-font">'
        +sender+'</strong><small class="pull-right text-muted"><i class="fa fa-clock-o fa-fw"></i>'+data.time+'</small>'
        +tagsElement+namesElement+'<p>'+nl2br(escapeHTML(data.message))+'</p></div></li></ul></div>'));
};
var updateUnReadNumAndScrolBottom = function(data) {
    var target = $('div[name*=roomList]').find(".active").attr("name");
    var unReadNum = 1;
    if (target != data.roomId) {
        var num = $('span[name='+data.roomId+']').html();
        if (num === undefined) {
            $('li[name='+data.roomId+']').children().append($('<span>',{class:"badge pull-right",name: data.roomId}).text(unReadNum));
        } else {
            unReadNum = Number(num)+1;
            $('span[name='+data.roomId+']').text(unReadNum);
        }
        updateUnReadNum(data.roomId, unReadNum);
	} else {
        if (Number($('#isActive').val()) === 0) {
            var dispRoomUnReadNum = $('span[name='+target+']').html();
            if (dispRoomUnReadNum === undefined) {
                $('li[name='+target+']').children().append($('<span>',{class:"badge pull-right",name: target}).text(1));
            } else {
                unReadNum = Number(dispRoomUnReadNum)+1;
                $('span[name='+target+']').text(unReadNum);
            }
            window.document.title = $('#roomName').text()+'['+unReadNum+']';
            updateUnReadNum(data.roomId, unReadNum);
        }
        $('#'+data.roomId).animate({ scrollTop: getScrolBottom($('#'+data.roomId))}, 'slow');
    }
};
var resizeArea = function() {
    if (jQuery(window).width() < 550) {
        var h = jQuery(window).height()-$('#messageFooter').height()-230;
        $('div[name=messageArea]').css('height', h);
        $('#main').addClass('footer');
        $('body').css('font-size', '1em');
    } else if (jQuery(window).width() > 550 ) {
        $('div[name=messageArea]').css('height', '');
        $('#main').removeClass('footer');
        $('body').css('font-size', '');
    }
};
var getMyRoom = function (isMyCreate, roomName) {
        
    $.ajax({
        type: 'POST',
        url: '/chat/getMyRoom',
        dataType: 'json',
        cache: false,
        success: function(data) {
            if (!isMyCreate) {
                roomNotification(roomName);
            }
            var roomLength = data.rooms.length;
            var rooms = data.rooms;
            var element = '';
            for (var i=0; i < roomLength; i++) {
                if (!$('li[name='+rooms[i]._id+']')[0]) {
                    element += '<li name=' + rooms[i]._id + '><a name="roomSelectRadio" href="#">'+ rooms[i].name + '</a></li>';
                }
            }
            document.getElementById("roomListUl").innerHTML += element;
            document.getElementById("roomListUlSide").innerHTML += element;
            var activeRoom = $('#roomContents').find(".active").attr("id");
            $('li[name='+activeRoom+']').addClass('active');
            //サイドパネルが開いていた場合、要素が更新されないため強制的に開閉する
            if ($('#pageslide').is(':visible')) {
                $('#pageslide').css("right", "auto","left", "-250px");
                $('body').css("margin-left", "0px");
                $('#pageslide').hide(500);
            }
    　　},
    　　error: function(XMLHttpRequest, textStatus, errorThrown) {
            errorMessage();
    　　},
    });
};
$(function() {
    $('#hederMenu').children().removeClass('active');
    $('#lobbyView').addClass('active');
    
    /* chat **/
    $(window).resize(function() {
        resizeArea();
    });
	(function clock() {
        var now = new Date();
        var hour = now.getHours(); // 時
        var min = now.getMinutes(); // 分
        var sec = now.getSeconds(); // 秒
        hour = ('0' + hour).slice(-2);
        min = ('0' + min).slice(-2);
        sec = ('0' + sec).slice(-2);
        var month = now.getMonth()+1;
        var ymd = now.getFullYear() + '/' + month +'/'+now.getDate();
        $('#today').html(ymd + ' ' + hour + ':' + min + ':' + sec);
        resizeArea();
        setTimeout(clock, 1000);
    })();
    //メッセージマウスオーバー
    $('div[name=reseveMessage]').mouseover(function(){
    });
    $('div[name=reseveMessage]').mouseout(function(){
    });
    //サーバーが受け取ったメッセージを返して実行する
    socket.on('msg push', function (data) {
        createMessageElement(data.roomId, data);
        updateUnReadNumAndScrolBottom(data);
        var toNum = data.toTarget.length;
        var my = $('#cryptoId').val();
        for (var toTargetIndex=0; toTargetIndex < toNum; toTargetIndex++) {
            if (my == data.toTarget[toTargetIndex]) {
                createMessageElement('myRoom', data);
                infoMessage('['+data.roomName+']<br>'+'にTOで指定されたメッセージがあります');
                var dispRoomUnReadNum = $('span[name=myRoom]').html();
                if (dispRoomUnReadNum === undefined) {
                    $('li[name=myRoom]').children().append($('<span>',{class:"badge pull-right",name: 'myRoom'}).text(1));
                } else {
                    var unReadNum = Number(dispRoomUnReadNum)+1;
                    $('span[name=myRoom]').text(unReadNum);
                }
            }
        }
    });
    socket.on('incident push', function() {
        $('#incAll').html(Number($('#incAll').html())+1);
        $('#incOpen').html(Number($('#incOpen').html())+1);
    });
    socket.on('incident status changed', function (data){
        if ('' !== data.defore && '' !== data.after) {
            $('#'+data.before).html(Number($('#'+data.before).html())-1);
            $('#'+data.after).html(Number($('#'+data.after).html())+1);
        }
    });
    //ユーザーの追加/変更
    $('#memberEditButton').click(function(){
        var id = $(this).val();
        $('#selectEditMember').children().remove();
        $('#selectedEditMember').children().remove();
        $.ajax({
            type: 'POST',
            url: '/chat/getUserByRoomId',
            dataType: 'json',
            data: ({roomId:id}),
            cache: false,
            success: function(data) {
                var length = data.users.length;
                for (var i = 0; i < length; i++) {
                    $('#selectedEditMember').append($('<option>',{value:data.users[i]._id}).append(data.users[i].name));
                }
                var allLength = data.allUsers.length;
                for (var j = 0; j < allLength; j++) {
                    $('#selectEditMember').append($('<option>',{value:data.allUsers[j]._id}).append(data.allUsers[j].name));
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                errorMessage();
            },
        });
	});
    //部屋の選択
	$('div[name*=roomList]').delegate('a[name=roomSelectRadio]', 'click', function() {

        var id = $(this).parent().attr('name');
        $('li').removeClass("active");
        $('li[name='+id+']').addClass('active');
        $('li[name='+id+']').children().children().remove();
        $('#roomName').html($(this).text());
        $('#memberEditButton').val(id);
        $('#sendButton').val(id);
        $('#sendButton').removeAttr("disabled");
        var target = $('#roomContents').find(".active").attr("id");
        $('#'+target).hide(500);
        $('#'+target).removeClass("active");
        var msgAdd = false;
        moveTop();
        if ($('#'+id).length === 0) {
            msgAdd = true;
            socket.emit('join room', id);
            var element = $("<div>", {name: "messageArea", class: "panel-body active", id: id});
            $('#roomContents').append(element).show(500);
        } else {
            $('#'+id).show(500);
            $('#'+id).addClass('active');
        }
        window.document.title = $('#roomName').text();
        updateUnReadNum(id, 0);
        $.ajax({
            type: 'POST',
            url: '/chat/getUserByRoomId',
            dataType: 'json',
            data: ({roomId:id}),
            cache: false,
            success: function(data) {
                $('#roomUserList').children().remove();
                var length = data.users.length;
                var toElement = '';
                for (var i = 0; i < length; i++) {
                    $('#roomUserList').append($("<li>",{name: data.users[i]._id}).append(
                        $("<i>",{class: data.users[i].status})).append(data.users[i].name));
                    toElement += '<li><a name="toTarget" href='+data.users[i]._id+'>'+data.users[i].name+'</a></li>';
                }
                document.getElementById("toUl").innerHTML = toElement;

                $('#roomInfomation').html(data.description);
                if (!msgAdd)return;
                data.messages.forEach(function(message){
                    message.roomId = id;
                    createMessageElement(id, message);
                });
                $('#'+id).animate({ scrollTop: getScrolBottom($('#'+id))}, 'slow');
        　　},
        　　error: function(XMLHttpRequest, textStatus, errorThrown) {
                errorMessage();
        　　},
        });
        return false;
    });
    //招待された部屋の通知
    socket.on('create chat msg', function(roomName) {
        getMyRoom(false, roomName);
    });
    //ルーム作成完了
    socket.on('create chat complete', function(msg) {
        getMyRoom(true, msg);
    });
    //メッセージ送信
    $('#sendButton').click(function() {
        
        if($('#message').val().trim().length===0)return;
        var target = $('#roomContents').find(".active").attr("id");
        var toTarget = $('input[name=toList]:hidden').get();
        var toNum = toTarget.length; 
        var toList = [];
        for (var toIndex=0; toIndex < toNum; toIndex++) {
            toList.push(toTarget[toIndex].value);
        }
        var tag = [];
        if ($('#targetTag').val()) {
            tag.push({_id:$('#targetTag').val(), name:$('#selectTag').text().trim().substring(1).split('×'), color: $('#targetTagColor').val()})
        }
        var data = {
            message: $('#message').val(),
            roomId: target,
            toTarget:toList,
            toNameList: $('#toUser').text().trim().substring(1).split('×'),
            roomName:$('#roomName').html(),
            tag:tag
        };
        socket.emit('msg send', data);
        $('#message').val('');
        $('#message').focus();
    });
    //過去のメッセージを取得
    $('a[name=beforeday]').click(function(){
        var data = {roomId: $('#sendButton').val(), status:$(this).attr('id')};
        socket.emit('get beforeday', data);
        return false;
    });
    socket.on('beforeday push', function(data) {
        var msgLength = data.messages.length;
        $('#'+data.roomId).children().remove();
        data.messages.forEach(function(message){
            createMessageElement(data.roomId, message);
        });
    });
    /* multiple message**/
    socket.on('multiple push', function(data){
        createMessageElement(data.roomId, data);
        updateUnReadNumAndScrolBottom(data);
    });
    /* room member edit **/
    $('#selectEditMember').change(function(event){
        selectMove('selectEditMember', 'selectedEditMember', false);
        memberEditCompleteButtonCheck();
    });
    $('#selectedEditMember').change(function(event){
        selectDelete('selectedEditMember');
        memberEditCompleteButtonCheck();
    });
    $('#memberEditCompleteButton').click(function(){
        var users = [];
        $("select[name=selectedEditMember]").children().each(function() {
            users.push({_id:$(this).val(), name:$(this).text()});
        });
        if (users.length === 0) return false;
        var roomId = $('#memberEditButton').val();
        var editMember = {roomId:roomId, users:users};
        socket.emit('member edit', editMember);
    });
    socket.on('member add', function (data) {
        socket.emit('join room', data.roomId);
        getMyRoom(false, data.roomName);
    });
    socket.on('member delete', function (data) {
        socket.emit('leave room', data.roomId);
        if (data.roomId == $('#roomContents').find(".active").attr("id")) {
            $('#sendButton').attr("disabled", "disabled");
            $('#sendButton').val('');
        }
        warningMessage('['+data.roomName+']<br>のメンバーから外れました');
        $('li[name='+data.roomId+']').remove();
    });
    socket.on('member edit complete', function (data) {
        if (data.roomId == $('#roomContents').find(".active").attr("id")) {
            
            createMemberList(data.users);
        }
        if($('li[name='+data.roomId+']').text() !== '') {
            successMessage('['+data.roomName+']<br>'+'のメンバーが変更されました');
        }
    });
    /* fixed sentence**/
	$('a[name="fixedSectences"]').click(function(){
        var val = $(this).attr('href');
        $('#message').val($(val).val());
        $('#fixedSectencesDiv').removeClass("open");
        $('#message').focus();
        return false;
	});
    /* to**/
    $('#toDiv').delegate('a', 'click', function() {
        $('#toDiv').removeClass("open");
        if ($('#cryptoId').val() === $(this).attr('href') ) return false;
        var isSelect = false;
        var toTarget = $('input[name=toList]:hidden').get();
        var toNum = toTarget.length;
        for (var toIndex=0; toIndex < toNum; toIndex++) {
            
            if (toTarget[toIndex].value === $(this).attr('href')) {
                isSelect = true; 
                return false;
            }
        }
        if (isSelect) return false;
        var element = '<div class="to-user to-user-dismissable">'
                    + '<button type="button" class="close" data-dismiss="to-user" aria-hidden="true">&times;</button>'
                    + '<input type="hidden" name="toList" value='+$(this).attr('href')+'>'
                    + $(this).text() + '</div>';
        $('#toUser').append(element);
        resizeArea();
        return false;
    });
    /* tags**/
    $('#tagDiv').delegate('a', 'click', function() {
        $('#tagDiv').removeClass("open");
        $('#selectTag').children().remove();
        var element = '<div class="to-user to-user-dismissable" style="width:100%">'
                    + '<button type="button" class="close" data-dismiss="to-user" aria-hidden="true">&times;</button>'
                    + '<input type="hidden" id="targetTag" value='+$(this).attr('href')+'>'
                    + '<input type="hidden" id="targetTagColor" value='+$('#'+$(this).attr('href')).val()+'>'
                    + $(this).text() + '</div>';
        $('#selectTag').append(element);
        resizeArea();
        return false;
    });
    /* ダウンロード**/
    $('a[name=messageDownload]').click(function(){
        var search = {roomId:$('#sendButton').val(), status:$(this).attr('value')};
        $.ajax({
            type: 'POST',
            url: '/chat/messageDownLoad',
            dataType: 'json',
            data: search,
            cache: false,
            success: function(data) {
                console.log(data);
                if (data.execute.status) {
                    
                    window.location.href = data.execute.path;
                } else {
                    errorMessage(data.execute.message,'top-center');
                }
        　　},
        　　error: function(XMLHttpRequest, textStatus, errorThrown) {
                errorMessage('情報の取得に失敗しました','top-center');
        　　},
        });
    });
});