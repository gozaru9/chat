var completeButtonCheck = function() {
    if ($('#inputName').val().trim().length === 0 || $('#inputEmail').val().trim().length === 0
        || $('#inputPassword').val().trim().length === 0 || $('#inputPasswordConfirm').val().trim().length === 0) {
        $('#completeButton').attr("disabled", "disabled"); 
        return false;
    } else {
        $('#completeButton').removeAttr("disabled");
        return true;
    }
};
var clear = function() {
    
    $('#inputName').val('');
    $('#inputEmail').val('');
    $('#completeButton').val('');
    $('#accountRole').prop('checked', false);
    $('#accountId').val('');
    $('#inputPassword').val('');
    $('#inputPasswordConfirm').val('');
    $('#inputPassword').removeClass('error');
    $('#inputPasswordConfirm').removeClass('error');
};
var loadMessage = function(msg) {
    if ('' !== msg) errorMessage(msg, 'top-center');
};
var reader = null;
var targetFile = null;
function onDrop(event) {
    var files = event.dataTransfer.files;
    var disp = document.getElementById("disp");
    disp.innerHTML = "";
    targetFile = files[0];
    var f = files[0];
    var fileNameArr = f.name.split('.');
    if (fileNameArr[fileNameArr.length-1] !== 'csv') {
        errorMessage('csvをドロップしてください', 'top-center');
    } else {
        reader = new FileReader();
        reader.readAsText(f);
    }
    disp.innerHTML += "ファイル名 :" + f.name + "<br>ファイルサイズ:" + f.size / 1000 + " KB " + "<br />";
    event.preventDefault();
}

function onDragOver(event) {
    event.preventDefault();
} 

$(function() {

    if (window.File) {
        document.getElementById("drop").addEventListener("drop", onDrop, false);
        
    } else {
        window.alert("本ブラウザではFile APIが使えません");
    }
    
    $('#hederMenu').children().removeClass('active');
    $('#accountView').addClass('active');

    $('#createAccountDiv').focusout(function() {
        completeButtonCheck();
    });
    $("#accountCreateButton").click(function(){
        clear();
        $('#createFormLabel').text('ユーザーを作成します');
        $('#completeButton').text('作成する');
    });
    $("button[name=accountUpdateButton]").click(function(){
        
        clear();
        if (!$(this).val()) return false;
        $('#createFormLabel').text('ユーザーを更新します');
        $('#completeButton').text('更新する');
        $.ajax({
            type: 'POST',
            url: '/account/getById',
            dataType: 'json',
            data: ({_id:$(this).val()}),
            cache: false,
            success: function(data) {
                if (data.errinfo.status) {
                    errorMessage(data.errinfo.message);
                } else {
                    
                    $('#inputName').val(data.target.name);
                    $('#inputEmail').val(data.target.mailAddress);
                    $('#completeButton').val(data.target._id);
                    if(Number(data.target.role) === 1) 
                        $('#accountRole').prop("checked", true);
                }
        　　},
        　　error: function(XMLHttpRequest, textStatus, errorThrown) {
        　　    errorMessage();
        　　},
        });
    });
    $('#completeButton').click(function(){
        if (!completeButtonCheck()) {
            return false;
        }
        if ($('#inputPassword').val().trim() !== $('#inputPasswordConfirm').val().trim()) {
            
            $('#inputPassword').addClass('error');
            $('#inputPasswordConfirm').addClass('error');
            errorMessage('入力されたパスワードが一致しません', 'top-center');
            return false;
        }
        var id = $(this).val();
        var checkInfo = {accountId:id, name:$('#inputName').val(), mailAddress:$('#inputEmail').val(), password:$('#inputPassword').val(), passwordConfirm: $('#inputPasswordConfirm').val()};
        $.ajax({
            type: 'POST',
            url: '/account/validation',
            dataType: 'json',
            data: checkInfo,
            cache: false,
            success: function(data) {
                if (data.validationInfo.status) {
                    errorMessage(data.validationInfo.message, 'top-center');
                    return false;
                }
                if (id) {
                    document.getElementById("accountId").value=id;
                    document.accountForm.action = '/account/update';
                } else {
                    document.accountForm.action = '/account/regist';
                }
                document.accountForm.submit();
        　　},
        　　error: function(XMLHttpRequest, textStatus, errorThrown) {
                errorMessage();
        　　},
        });
        return false;
    });
    $("button[name=accountDeleteButton]").click(function(){
        if ($(this).val()) {
            var data = {_id:$(this).val()};
            createFormSubmitByParam('/account/delete',data);
            return false;
        }
    });
    $('#fileUpload').click(function() {
        var disp = document.getElementById("disp");
        
        reader.onerror = function (evt) {
            disp.innerHTML = "読み取り時にエラーが発生しました。";
        }
        reader.onload = function (evt) {
          // FileReaderが取得したテキストをそのままdivタグに出力
          disp.innerHTML = reader.result;
        }
        var fd = new FormData();
        fd.append('file', targetFile);
        $("#loading").html("<img src='/images/image.gif'/>");
        
        $.ajax({
            url: "/account/registcsv",
            type: "POST",
            data: fd,
            contentType: false,
            processData: false,
            success:function(data){
                if (data.validationInfo.status) {
                    errorMessage(data.validationInfo.message, 'top-center');
                } else {
                    successMessage('登録が完了しました。<br>画面をリフレッシュしますか？<a href="/account">はい</a>', 'top-center');
                }
            },error: function(data) {
                
                
            },complete : function(data) {
                $("#loading").empty();
            }
        });
    });
});