/**
 * numに対応したtdのinnerTextを返却する
 * @param target thisオブジェクト
 * @param num    対象の番号
 * @returns
 */
function getTableValueByNum(target,num) {

    return $(target).closest("tr").find("td").eq(num).text();
}

/**
 * trに属するhidden項目を検索しvalueを返却する.
 * tr中にhiddenが1つの場合に呼び出す.
 * @verion 1.0
 * @param target thisオブジェクト
 * @returns valueプロパティ設定値
 */

function getTableHiddenValue(target) {

    var obj = $(target).closest("tr").find("input:hidden");
    return $(obj).val();
}

/**
 * trに属するhidden項目を検索しkeyに一致したvalueを取得し連想配列へ格納する
 * tr中にhiddenが複数の場合に呼び出す.
 * パラメータのkeyが指定されていない場合、すべてのhidden項目を対象とする
 * @verion 1.0
 * @param target thisオブジェクト
 * @param key    nameの配列
 * @returns　連想配列 {name:value}
 */
function getTableHiddenValueByKey(target, key) {

    var obj = $(target).closest("tr").find("input:hidden");
    var objCount = obj.length;
    var keyCount = (key !== "") ? key.length : 0;
    var resultHash = {};
    var name;
    if (keyCount === 0) {

        for(var i=0; i < objCount; i++) {

            name = $(obj[i]).attr("name");
            resultHash[name] = $(obj[i]).val();
        }

    } else {

        for(var j=0; j < objCount; j++) {

            name = $(obj[j]).attr("name");

            for(var k=0; k < keyCount; k++) {

                if (name == key[j]) {

                    resultHash[name] = $(obj[j]).val();
                    break;
                }
            }
        }
    }

    return resultHash;
}