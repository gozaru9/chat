$(function() {
    $('#hederMenu').children().removeClass('active');
    $('#tagsView').addClass('active');
    
    $("#color").spectrum({
        showInput: true,
        allowEmpty:true,
        change:function(color) {
            var select = (null !== color) ? color.toHexString() : '';
            $('#selectColor').val(select);
        }
    });
    $('#tagsCreateButton').click(function() {
        $('#tagName').val('');
        $('#isMonitor').prop('checked', false);
        $('#selectColor').val('');
        $('#tagsCreateFormLabel').text('タグを作成します');
        $('#tagCompleteButton').text('作成する');
        $('#tagCompleteButton').val('');
    });
    $('button[name=tagsUpdateButton]').click(function() {
        
        $('#tagName').val('');
        $('#isMonitor').prop('checked', false);
        $('#selectColor').val('');
        $('#tagCompleteButton').val('');
        if ($(this).val()) {
            $('#tagsCreateFormLabel').text('タグを更新します');
            $('#tagCompleteButton').text('更新する');
            $.ajax({
                type: 'POST',
                url: '/tags/getTagsById',
                dataType: 'json',
                data: ({id:$(this).val()}),
                cache: false,
                success: function(data) {
                    
                    if (data.target) {
                        $("#color").spectrum({
                            showInput: true,
                            allowEmpty:true,
                            color: data.target.color,
                            change:function(color) {
                                var select = (null !== color) ? color.toHexString() : '';
                                $('#selectColor').val(select);
                            }
                        });
                        $('#tagName').val(data.target.name);
                        $('#selectColor').val(data.target.color);
                        $('#tagCompleteButton').val(data.target._id);
                        $('#isMonitor').prop('checked', data.target.isMonitor);
                    }
            　　},
            　　error: function(XMLHttpRequest, textStatus, errorThrown) {
                    errorMessage();
            　　},
            });
        }
    });
    $('#tagCompleteButton').click(function(){
        if ( $('#tagName').val().trim().length === 0 ) return;
        var data = {id:$('#tagCompleteButton').val(),
                    name :$('#tagName').val().trim(),
                    isMonitor:$('#isMonitor').prop("checked"),
                    color:$('#selectColor').val()};
        if ( $('#tagCompleteButton').val()) {
            createFormSubmitByParam('/tags/update',data);
        } else {
            createFormSubmitByParam('/tags/regist',data);
        }
    });
    $('button[name=tagClose]').click(function() {
        $('#tagName').val('');
        $('#isMonitor').prop('checked', false);
        $('#selectColor').val('');
    });
    $('button[name=tagsDeleteButton]').click(function() {
        var data = {_id:$(this).val()};
        if ($(this).val()) createFormSubmitByParam('/tags/delete',data);
    });
});