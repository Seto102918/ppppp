import * as d3 from "https://cdn.skypack.dev/d3@7";
import axios from 'https://cdn.skypack.dev/axios';
import { getDatabase, ref, onValue, set} from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.8.3/firebase-database.min.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut  } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.8.3/firebase-auth.min.js";

const socket = io("http://localhost:8080")
socket.on("connect", () => {
  console.log("socket ID: " + socket.id)
  socket.on("dataUpdate", datanya => {
    ////
  })
})

/////initialize DATABEZZ/////
const firebaseConfig = {
  apiKey: "AIzaSyCWXmej8_QGBrQtkaETSrzsu2NocNZT3FY",
  authDomain: "projectiot-2af49.firebaseapp.com",
  databaseURL: "https://projectiot-2af49-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "projectiot-2af49",
  storageBucket: "projectiot-2af49.appspot.com",
  messagingSenderId: "176019695566",
  appId: "1:176019695566:web:96ca2ecc715fdb9edaad9f",
  measurementId: "G-XG0D9KWDRS"
};

initializeApp(firebaseConfig);
const auth = getAuth();

const authDiv = document.getElementById("authDiv");
const conDiv = document.getElementById("container");
const background = document.getElementById("backgroundAuth");
const topLeft = document.getElementsByClassName("top-left");
const topRight= document.getElementsByClassName("top-right");
const botLeft = document.getElementsByClassName("bottom-left");
const parentDiv = document.getElementById(`containersize`);
const right = document.getElementById('right');
var w,h, width, height;

conDiv.style.display = "none";

const singInButton = document.getElementById("buttonSignin");
singInButton.addEventListener("click",() => {
  var emailInput = document.getElementById("emailInput").value;
  var passwordInput = document.getElementById("passwordInput").value;

  signInWithEmailAndPassword(auth, emailInput, passwordInput)
  .then((userCredential) => {
    const user = userCredential.user;
    authDiv.style.display = "none";
    conDiv.style.display = "block";
    
    loginAnimation();
  })
  .catch((error) => {
    alert(`${error.code} : ${error.message}`)
  });
})

function loginAnimation(){
  var tl = gsap.timeline();
  tl.to(background,{opacity: 0, duration: 0.5, ease: 'back', onComplete: () => {background.style.display = "none";}})
    .to(topLeft,{opacity: 1, y: 0 , duration: 0.35, ease: 'back'})
    .to(topRight,{opacity: 1, y: 0, duration: 0.35, ease: 'back'})
    .to(botLeft,{opacity: 1, y: 0, duration: 0.35, ease: 'back'});
}


const timeParse = d3.timeParse("%H:%M");
var moistureData = [];
var moistureData_2 = [];
var maxMoisture, maxMoisture_2, batesData;

async function ambilData(){
  const data =  await axios.get('/api/moistureData');
  var moisture_p, moisture_pp;
  var moisture2_p, moisture2_pp;

  data.data.moisture.forEach(moisture => {
    var hasil = timeParse(moisture.time)
    var obj = {"value": moisture.value,"time": hasil}

    moistureData.push(obj)
  });

  data.data.moisture2.forEach(moisture2 => {
    var hasil = timeParse(moisture2.time)
    var obj = {"value": moisture2.value,"time": hasil}

    moistureData_2.push(obj)
  });

  for (let i = 0; i < moistureData_2.length; i++) {
    moisture2_p = moistureData_2[i].value;
    if (i != 0){ moisture2_pp = moistureData_2[i-1].value || null; }
    if (moisture2_p > moisture2_pp && i != 0){ maxMoisture_2 = moisture2_p;}
  }

  for (let i = 0; i < moistureData.length; i++) {
    moisture_p = moistureData[i].value;
    if (i != 0){ moisture_pp = moistureData[i-1].value || null; }
    if (moisture_p > moisture_pp && i != 0){ maxMoisture = moisture_p;}
  }

  console.log( "moisture Data :" +JSON.stringify(moistureData))
  console.log( "moisture Data2 :" +JSON.stringify(moistureData_2))
}

///////Buat Graph Top Left
await ambilData();
createTopLeft();

///////////
var finalInt
var text = document.getElementById('moistureValue');
var valuetext = text.innerText;
var valueInt = parseInt(valuetext);
var maxValue = 5000;
finalInt = (valueInt/maxValue)*100;
move(finalInt, "myBar");

var text2 = document.getElementById('moistureValue2');
var valuetext2 = text2.innerText;
var valueInt2 = parseInt(valuetext2);
finalInt = (valueInt2/maxValue)*100;
move(finalInt, "myBar2");

//////////
const db = getDatabase();
const moistureRef = ref(db, 'moisture');
const moisture2Ref = ref(db, 'moisture2');

onValue(moistureRef, (snapshot) => {
  const data = snapshot.val();
  text.innerText = data;
  finalInt = (data/maxValue)*100;

  move(finalInt, "myBar")
  refreshChart()
});

onValue(moisture2Ref, (snapshot) => {
  const data = snapshot.val();
  text2.innerText = data;
  finalInt = (data/maxValue)*100;

  move(finalInt, "myBar2")
});

//////on Window Resize
window.addEventListener('resize', function (event) {
  removeChart()
  console.log('Resive event')
  createTopLeft()
}, false);

//////////////////////F*CKTIONS
async function refreshChart(){
  removeChart()
  moistureData = []
  moistureData_2 = []
  await ambilData()
  createTopLeft()
}

function removeChart(){
  d3.selectAll('svg').remove();
  d3.select("#container").append("svg").remove()
}

function createTopLeft(){
  var data;
  if (maxMoisture >= maxMoisture_2) { data = moistureData; }
  else { data = moistureData_2; }

  w = parentDiv.clientWidth || 720;
  h = parentDiv.clientHeight || 360;
  const margin = { top: 20, right: 30, bottom: 30, left: 50 }
  width = w - margin.left - margin.right,
  height = h - margin.top - margin.bottom;
  console.log("height: " + height + "||   width: " + width)

  const svg = d3.select(`#container`)
    .append("svg")
      .style("color", "white")
      .attr("width", w)
      .attr("height", h)
    .append("g")
      .style("color", "white")
      .attr("transform", `translate(${margin.left},${margin.top})`)

  var x = d3.scaleTime()
    .domain(d3.extent(moistureData, function (d){return d.time;}))
    .range([0, width]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .domain([0, 5000])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  /////////////////////////moisture data
  
  svg.append("path")
    .datum(moistureData)
    .attr("fill", "none")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.time) })
      .y(function(d) { return y(d.value) })
    )
   
  svg
    .append("g")
    .selectAll("dot")
    .data(moistureData)
    .enter()
    .append("circle")
      .attr("cx", function(d) { return x(d.time) } )
      .attr("cy", function(d) { return y(d.value) } )
      .attr("r", 5)
      .attr("fill", "#69b3a2")

  
 /////////////////////////moisture data2

 svg.append("path")
    .datum(moistureData_2)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(d => x(d.time))
      .y(d => y(d.value))
    )
   
  svg
    .append("g")
    .selectAll("dot")
    .data(moistureData_2)
    .enter()
    .append("circle")
      .attr("cx", d => x(d.time))
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", "white")

}

function move(persen, id) {
  persen = Math.ceil(persen)
  var elem = document.getElementById(id);
  gsap.to(elem,{width: `${persen}%`, duration: 1, ease: 'back'})
}


var state;
const pumpRef = ref(db, 'Waterpump');

onValue(pumpRef, (snapshot) => {
  state = snapshot.val();
  if (state == 0){
    button.style.backgroundColor = '#1ed75f';
  }else if(state == 1){
    button.style.backgroundColor = '#121212';
  }else{
    console.log("Error Pump state != 0 / 1")
  }
});

const button = document.getElementById('waterPumpButton');

button.addEventListener('click', () => {

  if (state == 0){
    set(pumpRef, 1);
    button.style.backgroundColor = '#1ed75f';
  }else if(state == 1){
    set(pumpRef, 0);
    button.style.backgroundColor = '#121212';
  }else{
    console.log("Error Pump state != 0 / 1")
  }

});
  
