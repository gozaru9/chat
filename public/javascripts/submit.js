/**
 * Formタグを持たない画面で指定されたパラメータを使用してPOSTする
 * 
 * @param action 遷移先
 * @param data パラメータ
 * */
function createFormSubmitByParam(action, data){
    
    var form = document.createElement('form');
    form.setAttribute("action", action);
    form.setAttribute("method", "post");
    form.style.display = "none";
    document.body.appendChild(form); 
    
    if (data !== undefined) {
        for (var paramName in data) {
            var input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', paramName);
            input.setAttribute('value', data[paramName]);
            form.appendChild(input);
        }
    }
    form.submit();   
}