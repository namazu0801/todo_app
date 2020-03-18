var dayOfWeekJa = [ '日', '月', '火', '水', '木', '金', '土'];
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getStringFromDate(date,format_str) {
    var year_str = date.getFullYear();
    //月だけ+1すること
    var month_str = (1 + date.getMonth()).toString().padStart(2,'0');
    var day_str = date.getDate().toString().padStart(2,'0');
    var hour_str = date.getHours();
    var minute_str = date.getMinutes();
    var second_str = date.getSeconds();
             
    format_str = format_str.replace(/YYYY/g, year_str);
    format_str = format_str.replace(/MM/g, month_str);
    format_str = format_str.replace(/DD/g, day_str);
    format_str = format_str.replace(/hh/g, hour_str);
    format_str = format_str.replace(/mm/g, minute_str);
    format_str = format_str.replace(/ss/g, second_str);
    
    return format_str;
};

function convertFromMilliTimestamp(milliTime, format){
    switch(format){
        case "date":
            return new Date(milliTime);
        case "dateStr":
            return getStringFromDate(new Date(milliTime), "YYYY-MM-DD");
    }
}

function dayDiff(d1, d2) {
    //var diffInTime = Math.abs(d2.getTime() - d1.getTime()); 
    var diffInTime = d2.getTime() - d1.getTime(); 
    var diffInDays = diffInTime / (1000 * 3600 * 24); 
    return diffInDays;
}

function weekDiff(d1, d2) {
    var diff =(d2.getTime() - d1.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 7);
    return Math.abs(Math.round(diff));
}

function isRepeatedTask(task) {
    return (task["repeatDays"] || task["monthlyRepeatMonths"]);
}

function isMonthlyRepeated(task) {
    return task["monthlyRepeatMonths"] ? true: false;
}
