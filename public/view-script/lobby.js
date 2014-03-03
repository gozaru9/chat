var getMyRoomLobby = function (isMyCreate, roomName) {
        
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
                if (document.getElementById(rooms[i]._id) === null) {
                    element += '<div class="col-md-4"><div class="panel panel-info">'
                    +'<div class="panel-heading"><a href="#" id='+rooms[i]._id+'>'+rooms[i].name+'</a>'
                    +'<span name='+rooms[i]._id+' class="badge pull-right">'+0+'</span></div>'
                    +'<div class="panel-body"><em>'+rooms[i].description+'</em></br><hr>';
                    var userLength = rooms[i].users.length;
                    for (var j=0;j<userLength;j++) {
                        element+= '<div class="user-area"><span class="user-name">'+rooms[i].users[j].name+'</span></div>&nbsp';
                    }
                    element +='</div></div></div>';
                }
            }
            document.getElementById("myLoomLst").innerHTML += element;
    　　},
    　　error: function(XMLHttpRequest, textStatus, errorThrown) {
            $().toastmessage('showToast', {
                text     : '通信に失敗しました',
                sticky   : true,
                type     : 'error'
            });
    　　      console.log(XMLHttpRequest);
            console.log(textStatus);
    　　},
    });
};

$(function() {
    
    $('#myLoomLst').delegate('a', 'click', function(){
        
        var data = {room :$(this).attr('id')};
        createFormSubmitByParam('/chat', data);
        return false;
    })

    socket.emit('login notice');

	socket.on('msg push lobby', function (data) {
        var num = $('span[name='+data.roomId+']').html();
        if (num  !== undefined) {
            var unReadNum = Number(num)+1;
            $('span[name='+data.roomId+']').text(unReadNum);
            updateUnReadNum(data.roomId, unReadNum);
        }
	});
	socket.on('create chat msg lobby', function (roomName) {
	    getMyRoomLobby(false, roomName);

	});
	socket.on('create chat complate lobby', function (data) {
	    getMyRoomLobby(true, '');
	});
    socket.on('member add lobby', function (data) {
        getMyRoomLobby(false, data.roomName);
    });
    socket.on('member delete lobby', function (data) {
        $().toastmessage('showToast', {
            text     : '['+data.roomName+']<br>のメンバーから外れました',
            sticky   : true,
            type     : 'warning'
        });
        $('#'+data.roomId).parent().parent().parent().remove();
    });
	
});
