let port = process.env.PORT || 1234
console.log("port" + port)

const fs = require('fs')
const admin = require('firebase-admin')
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
var http = require("http")
const express = require('express')
const { engine } = require('express-handlebars')
const app = express()
const { get } = require('http')           
const { stringify } = require('querystring')
const { json } = require('express')
const { time } = require('console')
const { rejects } = require('assert')
const { resolve } = require('path')

/////////////////////////////////////////APP///////////////////////////////////////////
app.use(express.static('public'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.listen(port,function(error){
    if(error){ 
        console.log("WARNING ERROR" + error)
    } else console.log('Server is listening to port' + port)
})

//////////////////////////////////////////FIREBASE///////////////////////////////////////////
var serviceAccount = require("./teskotl-firebase-adminsdk-ei2g0-7f8bf6a9d4.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://teskotl-default-rtdb.firebaseio.com",
  storageBucket:'gs://teskotl.appspot.com'
});
var bucket = admin.storage().bucket();
let timeDMY = getdate();



var moistureInput
var temperatureInput

const refmoisture = admin.database().ref('moisture');
const reftemp = admin.database().ref('suhu');

refmoisture.on('value', (snapshot) => {
    let timeHM = getTime()
    let timeDMY = getdate()

    console.log(`moisture: ${timeDMY} || ${timeHM} || value: ${snapshot.val()}`)

    moistureInput = snapshot.val()

    existsSync(timeDMY, timeHM, snapshot.val(), "moisture")

    app.get('/', function (req, res) {
        res.render('home', { 
            moistureInput: moistureInput
        });
    });

    app.get('/api/data', (req, res) => {
        const data = require(`./public/static/data/${timeDMY}.json`)
        res.json(data);
    });

    bucket.upload(`./public/static/data/${timeDMY}.json`);

}, (errorObject) => {console.log('The read failed: ' + errorObject.name);}); 


// reftemp.on('value', (snapshot) => {
//     let timeHM = getTime()
//     let timeDMY = getdate()

//     console.log(`temperature: ${timeDMY} || ${timeHM} || value: ${snapshot.val()}`)

//     existsSync(timeDMY, timeHM, snapshot.val(), "temperature")

//     app.get('/api/data', (req, res) => {
//         let timeDMY = getdate()
//         const data = require(`./public/static/data/${timeDMY}.json`)
//         console.log("api/data: " + data)
//         res.json(data);
//     });

// }, (errorObject) => {console.log('The read failed: ' + errorObject.name);}); 



function getdate(){
    const date_ob = new Date()
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;

        if(month == 1) month = 'Jan'
        if(month == 2) month = 'Feb'
        if(month == 3) month = 'Mar'
        if(month == 4) month = 'Apr'
        if(month == 5) month = 'May'
        if(month == 6) month = 'Jun'
        if(month == 7) month = 'Jul'
        if(month == 8) month = 'Aug'
        if(month == 9) month = 'Sep'
        if(month == 10) month = 'Oct'
        if(month == 11) month = 'Nov'
        if(month == 12) month = 'Dec'

    let year = date_ob.getFullYear();

    let timeDMY = `${date}-${month}-${year}`
    return timeDMY
}

async function writejson(timeDMY,isi){
    var val = JSON.stringify(isi)
    await fs.writeFile(`./public/static/data/${timeDMY}.json`, val, function(err, result) {
        if(err) console.log('error', err);
    });
}

function getTime(){
    const date_ob = new Date()
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    return `${hours}:${minutes}`;
}

function existsSync(timeDMY, timeHM, value, tipe){
    var isi = {
        value :value,
        time : `${timeHM} | ${timeDMY}`
    }

    if (fs.existsSync(`./public/static/data/${timeDMY}.json`)){
        console.log(`./public/static/data/${timeDMY}.json exist!`)
        try{
            const filejson = require(`./public/static/data/${timeDMY}.json`)
    
            if(tipe == "moisture") {
                filejson.moisture.push(isi)
            }else if(tipe == "temperature"){
                filejson.temperature.push(isi)
            }
            writejson(timeDMY,filejson,tipe)
        }catch (e) {console.log("Error" + e);}
        
    }else if (!fs.existsSync(`./public/static/data/${timeDMY}.json`)){
        console.log(`./public/static/data/${timeDMY}.json doesnt exist, creating new!`)

        var val = {
            moisture:[],
            temperature:[]
        }

        try{
            if(tipe == "moisture") {
                val.moisture.push(isi)
            }else if(tipe == "temperature"){
                val.temperature.push(isi)
            }
            console.log(val)
            writejson(timeDMY,val,tipe)
        }catch (e) {console.log("Error" + e);}
    }

}


setTimeout(function(){
    http.get("http://tes2idklg.herokuapp.com/")
},900000)