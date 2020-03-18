// .where(firebase.firestore.FieldPath.documentId(), '==', 'fK3ddutEpD2qQqRMXNW5').get()


// Initialize Cloud Firestore through Firebase
var firebaseConfig = {
    apiKey: "AIzaSyAZMFYvjvNhT7AK53yW_3fAhANywEhCGks",
    authDomain: "minmun-todo.firebaseapp.com",
    databaseURL: "https://minmun-todo.firebaseio.com",
    projectId: "minmun-todo",
    storageBucket: "minmun-todo.appspot.com",
    messagingSenderId: "1042612010644",
    appId: "1:1042612010644:web:fd429c911a8e7f3ba5fe81"
}
firebase.initializeApp(firebaseConfig);

//var db = firebase.database();
var db = firebase.firestore();

var CLCT_TASK = "tasks";
var CLCT_DN = "dones";

function addTask(data){
    /*
        [form input] data ...
            name: string
            date: "YYYY-MM-DD"
            // time: "hh:mm" (currently ignored)
            repeatUnit: "day", "week", "month", or null
            repeatValue: integer
            monthlyRepeatDay: integer, or null
        [saved to DB] saveData ...
            name: string
            date: timestamp (9AM GMT+0900)
            // time: "hh:mm" (currently ignored)
            repeatDays: integer, or null
            monthlyRepeatDay: integer, or null
            monthlyRepeatMonths: integer, or null
            createdDate: timestamp
    */
    var saveData = {};
    saveData["name"] = data.name;
    //saveData["date"] = new Date(data.date).getTime();
    saveData["date"] = new Date(data.date);
    if(["day","week"].indexOf(data.repeatUnit) >= 0){
        var multBy = data.repeatUnit=="day" ? 1 : 7;
        saveData["repeatDays"] = data.repeatValue*multBy;
    } else {
        saveData["repeatDays"] = null;
    }
    saveData["monthlyRepeatDay"] = data.monthlyRepeatDay;
    saveData["monthlyRepeatMonths"] = data.monthlyRepeatDay ? data.repeatValue : null;

    console.log(saveData);
    //db.ref(CLCT_TASK).push(saveData)
    db.collection(CLCT_TASK).add(saveData)
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        console.log(saveData);
        alert("登録しました");
        //window.location.reload();
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        console.log(saveData);
        alert("error occurred: see console");
    });
}

function getTasksByDate(qDate, callback){
    var qDateStr = getStringFromDate(qDate,"YYYY-MM-DD");

    var tasks = {};

    // get all done records for the day ... orderBy,startAt,endAt techniques inspired from:
    // https://stackoverflow.com/questions/47876754/query-firestore-database-for-document-id
    // https://note.com/shogoyamada/n/n8fe9486fcbec
    db.collection(CLCT_DN).orderBy(firebase.firestore.FieldPath.documentId()).startAt(qDateStr).endAt(qDateStr + '\uf8ff').get().then(function(docs){
        if(!docs.empty){
            docs.forEach(function(doc){
                var taskKey = doc.id.split(":")[1];
                tasks[taskKey] = { "persons": Object.keys(doc.data()) };
            });
        }

        // get all tasks first and extract those whose repetition should be displayed on the queried date
        db.collection(CLCT_TASK).get().then(function(docs){
            if(!docs.empty){
                docs.forEach(function(doc){
                    var taskKey = doc.id;
                    var d = doc.data();
                    var regDate = d["date"].toDate();
                    var dateDiff = dayDiff(regDate,qDate);
                    var isRepeatedTask = (d["repeatDays"] || d["monthlyRepeatMonths"]);
                    var repeatToday = (isRepeatedTask && (dateDiff % d["repeatDays"] == 0));
                    if(taskKey in tasks) tasks[taskKey]["data"] = d;
                    else if((!isRepeatedTask && dateDiff==0) || (dateDiff>=0 && repeatToday)) tasks[taskKey] = { "data": d, "persons": [] };
                });
            }
            //console.log(tasks);
            callback(tasks);
        });
    });

}

function addDone(dateStr, taskKey, person, callback){
    var createdDate = new Date()
    db.collection(CLCT_DN).doc(dateStr+`:${taskKey}`).get().then(function(doc){
        if(doc.exists){
            var data = doc.data();
            if(!(person in data)) data[person] = createdDate;
        }
        else {
            var data = {};
            data[person] = createdDate;
        }
        db.collection(CLCT_DN).doc(dateStr+`:${taskKey}`).set(data).then(callback);
    });
}
function removeDone(dateStr, taskKey, person, callback){
    var createdDate = new Date()
    db.collection(CLCT_DN).doc(dateStr+`:${taskKey}`).get().then(function(doc){
        if(doc.exists){
            var data = doc.data();
            if(person in data) delete data[person];
        }
        db.collection(CLCT_DN).doc(dateStr+`:${taskKey}`).set(data).then(callback);
    });
}
