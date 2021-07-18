// function GetKeyByValue(json, val){
//     for(var i in json){
//         if (json[i] == val){
//             return i
//         }
//     }
// }

// function arrRemoveByValue(arr, val) {
//     for (var i = 0; i < arr.length; i++) {
//         if (arr[i] == val) {
//             arr.splice(i, 1);
//             break;
//         }
//     }
// }

function objCompare(obj1, obj2){
    for(var i in obj1){
        if(obj1[i] != obj2[i]){
            return false
        }
    }
    return true
}

function objCalcNumber(obj){
    var count = 0;
    for(var key in obj){
        count++
    }
    return count
}

function getQueryString(name) { 
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); return null; 
} 

function ShowDialog(url) 
{ 
    if(document.all)
    { 
        feature="dialogWidth:300px;dialogHeight:200px;status:no;help:no";
        window.showModalDialog(url, null, feature); 
    } 
    else 
    { 
        feature ="width=300,height=200,menubar=no,toolbar=no,location=no,"; 
        feature+="scrollbars=no,status=no,modal=yes";
        window.open(url, null, feature); 
    } 
}