$(function() {
    $('#hederMenu').children().removeClass('active');
    $('#fixedView').addClass('active');
    
    $('button[name=myFixedUpdateButton]').click(function() {
        if ($(this).val()) {
            $('#fixedCreateFormLabel').text('定型文を更新します');
            $('#completeButton').text('更新する');
            $.ajax({
                    type: 'POST',
                    url: '/chat/getFixedById',
                    dataType: 'json',
                    data: ({fixedId:$(this).val()}),
                    cache: false,
                    success: function(data) {
                        console.log(data);
                        if (data.target) {
                            if(data.target.isOpen) {
                                $('#open').addClass('active');
                                $('#openRadio').attr('checked', 'checked');
                            } else {
                                $('#mine').addClass('active');
                                $('#mineRadio').attr('checked', 'checked');
                            }
                            $('#title').val(data.target.title);
                            $('#contents').val(data.target.contents);
                            $('#completeButton').val(data.target._id);
                        }
                　　},
                　　error: function(XMLHttpRequest, textStatus, errorThrown) {
                　　    console.log(XMLHttpRequest);
                　　    console.log(textStatus);
                　　},
                });
        }
    });
    $('#fixedCreateButton').click(function() {
        
        $('#fixedCreateFormLabel').text('定型文を作成します');
        $('#completeButton').text('作成する');
    });
    $('#completeButton').click(function() {
        
        if ( $('input[name=isOpen]:radio').val() === '' ) return;
        if ( ($('#title').val().trim() === '') ) return;
        if ( ($('#contents').val().trim() === '') ) return;
        var data = {id : $('#completeButton').val(),
                    isOpen: $('input[name=isOpen]:checked').val(),
                    title: $('#title').val(),
                    contents: $('#contents').val()};
        if (data.id) {
            
            createFormSubmitByParam('/chat/fixedSectence/update',data);
        } else {
            
            createFormSubmitByParam('/chat/fixedSectence/save',data);
        }
    });
    $('button[name=close]').click(function() {
        $('#competeButton').val('');
        $('#open').removeClass('active');
        $('#mine').removeClass('active');
        $('#title').val('');
        $('#contents').val('');
        $('#fixedCreateFormLabel').text('');
        $('#completeButton').text('');
    });
    $('button[name=myFixedDeleteButton]').click(function() {
        var data = {_id:$(this).val()};
        if ($(this).val()) createFormSubmitByParam('/chat/fixedSectence/delete',data);
    });
});