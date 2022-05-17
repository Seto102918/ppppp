const port = 3000
const fs = require('fs')
const admin = require('firebase-admin')

const express = require('express');
const { engine } = require('express-handlebars');
const app = express();

///////////////////////////////////////////////////////////////



/////////////////////////////////////////APP///////////////////////////////////////////
app.use(express.static('public'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
//////////////////////////////////////////FIREBASE///////////////////////////////////////////
var serviceAccount = require("./teskotl-firebase-adminsdk-ei2g0-7f8bf6a9d4.json");
const { get } = require('http');
const { stringify } = require('querystring');
const { json } = require('express');
const { time } = require('console');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://teskotl-default-rtdb.firebaseio.com"
});

// function getdata(path){
//     const ref = admin.database().ref(path);

//     ref.on('value', (snapshot) => {
//         console.log(snapshot.val());

//     }, (errorObject) => {
//         console.log('The read failed: ' + errorObject.name);
//     }); 
// }
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

function writejson(timeDMY,isi){
    fs.writeFile(`./public/static/data/${timeDMY}.json`, isi, function(err, result) {
        if(err) console.log('error', err);
    });
}

function ehe(){
    const ref = admin.database().ref('value');

    ref.once('value', (snapshot) => {
        const date_ob = new Date()
        console.log(snapshot.val());

        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let timeHM = `${hours}:${minutes}`

        let timeDMY = getdate()

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
            

    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    }); 

    app.get('/', (req, res) => {
    res.render('home');
    });
    app.get('/api/data', (req, res) => {
        let timeDMY = getdate()
        const data = require(`./public/static/data/${timeDMY}.json`)
        
        res.json(data);
    });
}
ehe()
setInterval(ehe,900000)

/////////////////////////////////////////APP///////////////////////////////////////////



app.listen(port,function(error){
    if(error){
        console.log("WARNING ERROR" + error)
    }else{
        console.log('Server is listening to port' + port)
    }
})

module.exports = {
    admin
}