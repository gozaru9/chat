var accountCompleteButtonCheck = function() {
    
    if ($('#accountPassword').val().trim().length === 0 || $('#accountPasswordConfirm').val().trim().length === 0) {
        $('#accountCompleteButton').attr("disabled", "disabled"); 
        return false;
    } else {
        $('#accountCompleteButton').removeAttr("disabled");
        return true;
    }
};
var accountClear = function() {
    
    $('#accountPassword').val('');
    $('#accountPasswordConfirm').val('');
    $('#accountPassword').removeClass('error');
    $('#accountPasswordConfirm').removeClass('error');
    $('#accountCompleteButton').attr("disabled", "disabled"); 
};
var errorMessage = function(message, position) {
    $().toastmessage('showToast', {
        text     : message,
        sticky   : true,
        position : position,
        type     : 'error'
    });
};
var successMessage = function(message, position) {
    $().toastmessage('showToast', {
        text     : message,
        sticky   : true,
        position : position,
        type     : 'success'
    });
};
var moveTop = function() {
    $('html,body').animate({ scrollTop: 0 }, 'slow','swing');
    return false;
};
$(function() {

    $('#profiletDiv').focusout(function() {
        accountCompleteButtonCheck();
    });
    $("#profile").click(function(){
        
        accountClear();
        $.ajax({
            type: 'POST',
            url: '/account/getById',
            dataType: 'json',
            data: ({_id:$('#cryptoId').val()}),
            cache: false,
            success: function(data) {
                if (data.errinfo.status) {
                    errorMessage(data.errinfo.message);
                } else {
                    
                    $('#name').text(data.target.name);
                    $('#mailAddress').text(data.target.mailAddress);
                    if (data.target.role === 1) {
                        
                        $('#role').text('管理ユーザー');
                    } else {
                        
                        $('#role').text('一般ユーザー');
                    }
                }
        　　},
        　　error: function(XMLHttpRequest, textStatus, errorThrown) {
        　　  errorMessage('ユーザー情報の取得に失敗しました。');
        　　    console.log(XMLHttpRequest);
        　　    console.log(textStatus);
        　　},
        });
    });
    $('#accountCompleteButton').click(function(){
        if (!accountCompleteButtonCheck()) {
            return false;
        }
        if ($('#accountPassword').val().trim() !== $('#accountPasswordConfirm').val().trim()) {
            
            $('#accountPassword').addClass('error');
            $('#accountPasswordConfirm').addClass('error');
            errorMessage('入力されたパスワードが一致しません', 'top-center');
            return false;
        }
        var id = $('#cryptoId').val();
        var checkInfo = {mailAddress:$('#mailAddress').text(), password:$('#accountPassword').val(), passwordConfirm: $('#accountPasswordConfirm').val()};
        $.ajax({
            type: 'POST',
            url: '/account/profileUpdate',
            dataType: 'json',
            data: checkInfo,
            cache: false,
            success: function(data) {
                if (data.validationInfo.status) {
                    errorMessage(data.validationInfo.message, 'top-center');
                } else {
                    successMessage('プロフィールを更新しました', 'top-center');
                }
        　　},
        　　error: function(XMLHttpRequest, textStatus, errorThrown) {
                errorMessage('プロフィールを更新に失敗しました', 'top-center');
        　　    console.log(XMLHttpRequest);
        　　    console.log(textStatus);
        　　},
        });
        return false;
    });
});