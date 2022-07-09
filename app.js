let port = process.env.PORT || 8080
const admin = require('firebase-admin')
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const http = require("http")
const express = require('express')
const { engine } = require('express-handlebars')           
const { stringify } = require('querystring')
const { time } = require('console')
const { rejects } = require('assert')
const { resolve } = require('path')
const { Server } = require("socket.io");

const { getDate , getTime } = require('./timeModule')
const { existsSync } = require('./fileModule')

console.log("port" + port)
////////////////////////////////////////socket io DUAR/////////////////////////////////
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {});
/////////////////////////////////////////Express///////////////////////////////////////////
app.use(express.static('public'));
app.engine('handlebars', engine({ 
    defaultLayout: 'main',
    partialsDir:'views/partials'
}));
app.set('view engine', 'handlebars');
app.set('views', './views');
//////////////////////////////////////////FIREBASE///////////////////////////////////////////
var serviceAccount = require("./garden1-53f71-firebase-adminsdk-th80d-0d6e9d4558.json");
const { storage } = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://garden1-53f71-default-rtdb.firebaseio.com",
  storageBucket: "gs://garden1-53f71.appspot.com"
});
var bucket = admin.storage().bucket();

var moistureInput, moistureInput2
const refmoisture = admin.database().ref('plant1/humidity1');
const refmoisture2 = admin.database().ref('plant2/humidity');
const pumpRef = admin.database().ref('Button');

io.on("connection", (socket) => {
    console.log("socket ID: " + socket.id)

    refmoisture.on('value', (snapshot) => {
        let timeHM = getTime()
        let timeDMY = getDate()
        console.log(`moisture: ${timeDMY} || ${timeHM} || value: ${snapshot.val()}`)
        moistureInput = snapshot.val();
        existsSync(timeDMY, timeHM, snapshot.val(), 1)

        bucket.upload(`./data/${timeDMY}.json`);
        socket.emit("moisture_update", moistureInput);
    }, (errorObject) => {console.log('The read failed: ' + errorObject.name);}); 

    refmoisture2.on('value', (snapshot) => {
        let timeHM = getTime()
        let timeDMY = getDate()
        console.log(`moisture: ${timeDMY} || ${timeHM} || value: ${snapshot.val()}`)
        moistureInput2 = snapshot.val();
        existsSync(timeDMY, timeHM, snapshot.val(), 2)

        bucket.upload(`./data/${timeDMY}.json`);
        socket.emit("moisture_update_2", moistureInput2);

    }, (errorObject) => {console.log('The read failed: ' + errorObject.name);}); 

    pumpRef.on('value', (snapshot) => {
        var state = snapshot.val();
        socket.emit("button_event", state);
    }, (errorObject) => {console.log('The read failed: ' + errorObject.name);}); 

});


///////////////////////////////////////LANJUT EXPRESS PPPPPPPPPPPP///////////////
app.get('/', function (req, res) {
    res.render('home',{
        moistureInput: moistureInput,
        moistureInput2: moistureInput2
    });
});

app.get('/api/moistureData', (req, res) => {
    const moistureData = require(`./data/${ getDate() }.json`)
    res.json(moistureData);
});


httpServer.listen(port,function(error){
    if(error){ 
        console.log("WARNING ERROR" + error)
    } else console.log('Server is listening to port' + port)
})


setTimeout(function(){
    console.log("PING")
    var url = "http://setongeteslagi.herokuapp.com/"
    try{
        http.get(url)
    } catch(e){
        console.log(`ERROR, Unable to get ${url}`)
    }
},900000)
