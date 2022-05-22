let port = process.env.PORT || 3000

console.log("process.env.PORT" + process.env.PORT)
console.log("port" + port)

const fs = require('fs')
const admin = require('firebase-admin')
const { Storage } = require('@google-cloud/storage')

var http = require("http")

const express = require('express')
const { engine } = require('express-handlebars')
const app = express()

/////////////////////////////////////////APP///////////////////////////////////////////
app.use(express.static('public'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
//////////////////////////////////////////FIREBASE///////////////////////////////////////////
var serviceAccount = require("./teskotl-firebase-adminsdk-ei2g0-7f8bf6a9d4.json")

const { get } = require('http')           
const { stringify } = require('querystring')
const { json } = require('express')
const { time } = require('console')
const { rejects } = require('assert')
const { resolve } = require('path')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://teskotl-default-rtdb.firebaseio.com",
  storageBucket:'gs://teskotl.appspot.com'
});

function getdate(when){
    const date_ob = new Date()
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;

    if(when == "yesterday"){
        date = date - 1
        console.log("Yesterday")

        if(date == 0 ){
            month = month - 1
                if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8|| month == 10 || month == 12) {
                    date = 30
                }else if(month == 4|| month == 6 || month == 9|| month == 11){
                    date = 31
                } else if(month == 2){
                    if (year % 4){
                        date = 29
                    } else date = 28
                } else if (month == 0){
                    month = 12
                    date = 30
                } else console.log("Date Error")
        }
    }else console.log("Today")

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
    await fs.writeFile(`./public/static/data/${timeDMY}.json`, isi, function(err, result) {
        if(err) console.log('error', err);
    });
}

async function uploadFile(filePath,destFileName) {
    await storage.bucket(teskotl).upload(filePath, {
      destination: destFileName,
    });

    console.log(`${filePath} uploaded to teskotl`);
}

const ref = admin.database().ref('value');
// const bucket = admin.storage.getStorage().bucket();
// const storage = new Storage();

function ehe(){
    
    ref.once('value', (snapshot) => {

        const date_ob = new Date()
        console.log(snapshot.val());

        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let timeHM = `${hours}:${minutes}`

        let timeDMY = getdate("today")

        console.log(timeDMY)
        console.log(timeHM)

        if (fs.existsSync(`./public/static/data/${timeDMY}.json`)){

            console.log(`./public/static/data/${timeDMY}.json exist!`)
            const filejson = require(`./public/static/data/${timeDMY}.json`)
            
            var newvalue = {
                "value" : snapshot.val(),
                "time" : `${timeHM} | ${timeDMY}`
            }
            filejson.push(newvalue)
            var masok = JSON.stringify(filejson)
            writejson(timeDMY,masok)
            
        }else if (!fs.existsSync(`./public/static/data/${timeDMY}.json`)){

            console.log(`./public/static/data/${timeDMY}.json doesnt exist, creating new!`)

            var isi = [{
                "value": snapshot.val(),
                "time": `${timeHM} | ${timeDMY}`
            }]
            var String = JSON.stringify(isi);
            writejson(timeDMY,String)

        }
    }, (errorObject) => {console.log('The read failed: ' + errorObject.name);}); 


    let yestimeDMY = getdate("yesterday")
    console.log(yestimeDMY)

    app.get('/', (req, res) => {
        res.render('home');
    });

    app.get('/api/data', (req, res) => {

        let timeDMY = getdate()
        const data = require(`./public/static/data/${timeDMY}.json`)
        res.json(data);

    });
    

    // if(fs.existsSync(`./public/static/data/${yestimeDMY}.json`)){

    //     app.get('/api/data2', (req, res) => {
    //         const data2 = require(`./public/static/data/${yestimeDMY}.json`)
    //         res.json(data2);
    //     });

    // }

    console.log("End of EHE")
    http.get("http://serverfirebasenyaseto.herokuapp.com/");
    
}


ehe()
setInterval(ehe,10000)

app.listen(port,function(error){

    if(error){
        console.log("WARNING ERROR" + error)
    }else console.log('Server is listening to port' + port)
    
})