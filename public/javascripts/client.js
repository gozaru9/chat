//共通的な通知処理を記述する
var socket = io.connect(location.hostname);
socket.send({ cookie: document.cookie });
socket.on('connect', function() {
	console.log('connected');
});
var clearRoomItem = function() {
    $('#createRoomName').val('');
    $('#roomDescription').val('');
    $('#chatCreateButton').attr("disabled", "disabled");
    $("select[name=selectedMember]").children().remove();
    $("select[name=selectMember] option").attr("selected",false);
};
var ceateButtonCheck = function() {
    if ( $('#createRoomName').val().trim().length !== 0 
        && $('#selectedMember option' ).length !== 0 ) {
        $('#chatCreateButton').removeAttr("disabled");
    } else {
        $('#chatCreateButton').attr("disabled", "disabled");
    }
};
var roomNotification = function (roomName) {
    $().toastmessage('showToast', {
        text     : '['+roomName+']<br>に招待されました',
        sticky   : true,
        type     : 'notice'
    });
};
var joinRoom = function (id) {
    socket.emit('join room', id);
};
var changeStatus = function(data) {
    //ユーザーエリアのステータス名称を変更
    $('li[name='+data.target+']').children().removeClass();
    $('li[name='+data.target+']').children().addClass(data.statusValue);
};
var updateUnReadNum = function(roomId, num) {
    
    $.ajax({
        type: 'POST',
        url: '/chat/updateUnRead',
        dataType: 'json',
        data: ({roomId:roomId, unReadNum:num}),
        cache: false,
        success: function(data) {
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            $().toastmessage('showToast', {
                text     : '未読数更新に失敗しました',
                sticky   : true,
                type     : 'error'
            });
            console.log(XMLHttpRequest);
            console.log(textStatus);
        },
    });
};
$(function() {
    /* create room **/
    $('#createChatDiv').focusout(function() {
        ceateButtonCheck();
    });
    $('#selectMember').change(function(event){
        selectMove('selectMember', 'selectedMember', false);
        ceateButtonCheck();
    });
    $('#selectedMember').change(function(event){
        selectDelete('selectedMember');
        ceateButtonCheck();
    });
    $('button[name=createRoomClose]').click(function() {
        clearRoomItem();
    });
    $('#chatCreateButton').click(function(){
        var users = [];
        $("select[name=selectedMember]").children().each(function() {
            users.push({_id:$(this).val(), name:$(this).text()});
        });
        var chat = {
                name: $('#createRoomName').val(),
                description: $('#roomDescription').val(),
                users: users};
        $.ajax({
            type: 'POST',
            url: '/chat/create',
            dataType: 'json',
            data: chat,
            cache: false,
            success: function(data) {
                socket.send({ cookie: document.cookie });
                socket.emit('create chat', chat);
                clearRoomItem();
                $().toastmessage('showToast', {
                    text     : '['+chat.name+']<br>を作成しました',
                    sticky   : true,
                    type     : 'success'
                });
            },
        　　error: function(XMLHttpRequest, textStatus, errorThrown) {
                $().toastmessage('showToast', {
                    text     : '['+chat.name+']<br>を作成できませんでした',
                    sticky   : true,
                    type     : 'error'
                });
        　　},
        });
    });
	//個人への送信エリア制御
	$('#individual').delegate('a', 'click', function() {
	    if ($('#cryptoId').val() === $(this).attr('name')) return false;
        if ($('#individualSend').val() != $(this).attr('name')) {
            $('#individualname').text($(this).text());
            $('#individualMessage').text('');
            $('#individualSend').val($(this).attr('name'));
        } else {
            $('#individualMessageDiv').fadeToggle("slow");
        }
        return false; 
	});
    //個人メッセージエリアを閉じる
    $('button[name=individualClose]').click(function() {
        $('#individualMessageDiv').fadeToggle("slow");
    });
    //個人への返信
    $('#individualMessageInfo').delegate('button', 'click', function() {
        var target = $(this).attr('id').split('_');
        if (target[0] === 'individualReSend') {
            if($('#individualReMessage').val().trim().length===0)return;
            var data = {
                message: $('#individualReMessage').val(),
                target: $(this).val()
            };
    		socket.emit('individual send', data);
            $('#individualReMessage').val('');
            
        } else if (target[0] === 'individualMessageInfo') {
            
            var closeTarget = 'individualMessageInfo_'+target[1];
            $('#'+closeTarget).fadeToggle("slow");

        } else {
            var closeTarget = 'individualMessageInfo_'+target[1];
            $('#'+closeTarget).fadeToggle("slow");
        }
    });
    //個人へのメッセージ送信
    $('#individualSend').click(function() {
        if($('#individualMessage').val().trim().length===0)return;
        var data = {
            message: $('#individualMessage').val(),
            target: $('#individualSend').val()
        };
		socket.emit('individual send', data);
        $('#individualMessage').val('');
    });
	//個人へのメッセージプッシュ
	socket.on('individual push', function (data) {

        var areaId = 'individualMessageInfo_'+data.userId;
        var messageAreaId = 'individualPush_'+data.userId;
        var m = '<ul class="chat"><li class="left clearfix"><div class="clearfix"><div name="reseveMessage" class="header"><strong class="primary-font">'+data.userName+'</strong><small class="pull-right text-muted"><i class="fa fa-clock-o fa-fw"></i>'+data.time+'</small><p>'+nl2br(escapeHTML(data.message))+'</p></div></li></ul></div>';
        //同じ人からのメッセージが来ているのかを判定
        if ($('#'+messageAreaId).html()) {
            $('#'+messageAreaId).append(m);
            //すでに画面に表示されていた場合
            if (!$('#'+areaId).is(':visible')) {
                $('#'+areaId).slideToggle("slow");
            }
        } else {
            var element = '';
            var reId = 'individualReSend_'+data.userId;
            var closeId = 'individualClose_'+data.userId;
            var addId = 'individualAdd_'+data.userId;
            element =
                '<div id='+areaId+' class="toggleMessage" style="display: none;">'
                +'<div class="panel panel-info"><div class="panel-heading">'
                +'<button id='+closeId+' type="button" class="close">&times;</button>'
                +'<span>'+data.userName+'</span></div>'
                +'<div class="panel-body"><div id='+messageAreaId+' class="individual-message-box">'+m+'<hr>'
                +'<textarea id="individualReMessage" class="form-control" name="individualReMessage"></textarea></div>'
                +'<div class="panel-footer">'
                +'<button id='+reId+' value='+data.userId+' class="btn btn-primary">返信する</button>'
                +'</div></div></div>';
            document.getElementById("individualMessageInfo").innerHTML += element;
            $('#'+areaId).slideToggle("slow");
            $('#'+areaId).draggable();
        }
	});
	socket.on('individual my push', function (data) {

        var areaId = 'individualMessageInfo_'+data.targetId;
        var messageAreaId = 'individualPush_'+data.targetId;
        var m = '<ul class="chat"><li class="left clearfix"><div class="clearfix"><div name="reseveMessage" class="header"><strong class="primary-font">'+data.userName+'</strong><small class="pull-right text-muted"><i class="fa fa-clock-o fa-fw"></i>'+data.time+'</small><p>'+nl2br(escapeHTML(data.message))+'</p></div></li></ul></div>';
        //同じ人からのメッセージが来ているのかを判定
        if ($('#'+messageAreaId).html()) {
            $('#'+messageAreaId).append(m);
            //すでに画面に表示されていた場合
            if (!$('#'+areaId).is(':visible')) {
                $('#'+areaId).slideToggle("slow");
            }
        } else {
            var element = '';
            var reId = 'individualReSend_'+data.targetId;
            var closeId = 'individualClose_'+data.targetId;
            var addId = 'individualAdd_'+data.userId;
            element =
                '<div id='+areaId+' class="toggleMessage" style="display: none;">'
                +'<div class="panel panel-info"><div class="panel-heading">'
                +'<button id='+closeId+' type="button" class="close">&times;</button>'
                +'<span>'+data.targetName+'</span></div>'
                +'<div class="panel-body"><div id='+messageAreaId+' class="individual-message-box">'+m+'<hr>'
                +'<textarea id="individualReMessage" class="form-control" name="individualReMessage"></textarea></div>'
                +'<div class="panel-footer">'
                +'<button id='+reId+' value='+data.targetId+' class="btn btn-primary">返信する</button>'
                +'</div></div></div>';
            document.getElementById("individualMessageInfo").innerHTML += element;
            $('#'+areaId).slideToggle("slow");
            $('#'+areaId).draggable();
        }
	});
	//部屋とのコネクションを削除
	$('#leaveButton').click(function() {
        var target = $('#roomHead').find(".active").attr("name");
		//サーバーにメッセージを引数にイベントを実行する
		socket.emit('leave room', target);
	});
	//全体メッセージ
	$('#allSend').click(function() {
        if($('#message').val().trim().length===0)return;
		socket.emit('all send', $('#allMessage').val());
	});
	//複数部屋へのメッセージ
	$('#multipleMessag').click(function() {
        $('#multipleMessage').val('');
        $.ajax({
            type: 'POST',
            url: '/chat/getMyRoomList',
            dataType: 'json',
            data: '',
            cache: false,
            success: function(data) {
                console.log(data);
                var roomNum = data.roomList.length;
                var element = '';
                for (var roomIndex=0; roomIndex<roomNum; roomIndex++) {
                    element += '<option value='+data.roomList[roomIndex]._id+'>'+data.roomList[roomIndex].name+'</option>';
                }
                document.getElementById("selectRooms").innerHTML = element;
            },
        　　error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest);
                console.log(textStatus);
                errorMessage('部屋情報の取得に失敗しました','top-center');
        　　}
        });
	});
	$('#multipleSend').click(function(){
	    if ($('#multipleMessage').val().trim().length === 0) return;
	    if (null === $('#selectRooms').val()) return false;
	    var data ={roomList:$('#selectRooms').val(), message:$('#multipleMessage').val()};
	    socket.emit('multiple send', data);
	});
	//サーバーが受け取ったメッセージを返して実行する
	socket.on('all push', function (msg) {
		$('#all').prepend($('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>'+nl2br(escapeHTML(msg))+'</span></div>'));
		$('#allMessage').val('');
	});
    //ステータスの変更
    $('a[name="statusChange"]').on('click', function(){
        //サーバーにログイン状態の変更を通知する
        var msg = {status:$(this).attr('id')};
        socket.emit('status change', msg);
    });
	socket.on('login push', function(data){
        $().toastmessage('showToast', {
            text     : data.name+'<br>'+'さんがログインしました',
            sticky   : false,
            type     : 'notice'
        });
        changeStatus(data);
    });
    //ステータス変更通知
	socket.on('status changed', function(data){
	    changeStatus(data);
        return false;
	});
	//ログアウト
	$('#logout').click(function(){
        socket.emit('logout unload');
	});
	//ブラウザクローズ
    $(window).on("beforeunload",function(e) {
        socket.emit('logout unload');
    });
});