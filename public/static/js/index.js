import * as d3 from "https://cdn.skypack.dev/d3@7";
import axios from 'https://cdn.skypack.dev/axios';
import { getDatabase, ref, onValue, set} from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.8.3/firebase-database.min.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut  } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.8.3/firebase-auth.min.js";

const socket = io("https://setongeteslagi.herokuapp.com/")
socket.on("connect", () => {
  console.log("socket ID: " + socket.id)
})

/////initialize DATABEZZ/////
const firebaseConfig = {
  apiKey: "AIzaSyB-Yzm45NRR3TaLLE6bNqAo2Yllu1HdTLE",
  authDomain: "garden1-53f71.firebaseapp.com",
  databaseURL: "https://garden1-53f71-default-rtdb.firebaseio.com",
  projectId: "garden1-53f71",
  storageBucket: "garden1-53f71.appspot.com",
  messagingSenderId: "733557734745",
  appId: "1:733557734745:web:a24c0912247181623e6048"
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
const top = document.getElementById('top');
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
    top.style.maxHeight = "100%";
    loginAnimation();
  })
  .catch((error) => {
    alert(`${error.code} : ${error.message}`)
  });
})

function loginAnimation(){
  var tl = gsap.timeline();
  tl.to(background,{opacity: 0, duration: 0.5, ease: 'back', onComplete: () => {
    background.style.display = "none"; 
  }})
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
socket.on('moisture_update', moistureInput => {
  const data = moistureInput;
  text.innerText = data;
  finalInt = (data/maxValue)*100;

  var date = new Date();
  var waktu = `${date.getHours()}:${date.getMinutes()}`;
  var hasil = timeParse(waktu)

  var obj = {"value": moistureInput,"time": hasil}
  moistureData.push(obj)

  var obj_p = {"value": moistureData_2[moistureData_2.length-1].value,"time": hasil}
  moistureData_2.push(obj_p)

  move(finalInt, "myBar")
  refreshChart();
})

socket.on('moisture_update_2', moistureInput2 => {
  const data = moistureInput2;
  text2.innerText = data;
  finalInt = (data/maxValue)*100;

  var date = new Date();
  var waktu = `${date.getHours()}:${date.getMinutes()}`;
  var hasil = timeParse(waktu)

  var obj = {"value": moistureInput2,"time": hasil}
  moistureData_2.push(obj)
  
  var obj_p = {"value": moistureData[moistureData.length-1].value,"time": hasil}
  moistureData.push(obj_p)

  move(finalInt, "myBar2")
  refreshChart();
})

var state;
socket.on('button_event', state => {
  if (state == 0){
    button.style.backgroundColor = '#1ed75f';
  }else if(state == 1){
    button.style.backgroundColor = '#121212';
  }else{
    console.log("Error Pump state != 0 / 1")
  }
})
//////on Window Resize
window.addEventListener('resize', function (event) {refreshChart()}, false);

//////////////////////F*CKTIONS
async function refreshChart(){
  removeChart()
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
    .domain(d3.extent(moistureData, function (d){
      return d.time;
    }))
    .range([0, width]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .domain([0, 5000])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));
  /////////////////////////////
  const Tooltip = d3.select("#container")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "#1ed75f")
      .style("border", "solid")
      .style("font-weight","600")
      .style("border-width", "0px")
      .style("border-radius", "5px")
      .style("padding", "5px")

      const mouseover = function(event,d) {
        Tooltip
          .style("opacity", 1)
      }
      const mousemove = function(event,d) {
        Tooltip
          .html("Exact value: " + d.value)
          .style("left", `${event.layerX+10}px`)
          .style("top", `${event.layerY}px`)
      }
      const mouseleave = function(event,d) {
        Tooltip
          .style("opacity", 0)
      }

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
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

  
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
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)


  svg
    .selectAll("myLabels")
    .data(moistureData)
    .enter()
      .append('g')
      .append("text")
        .attr("class", "moistureData")
        .datum(function(d) { 
          return {name: "moistureData" , value: moistureData[moistureData.length - 1]}
        })
          .attr("transform", function(d) { 
            return "translate(" + x(d.value.time) + "," + y(d.value.value) + ")"; })
          .attr("x", -40)
          .attr("y", 30)
          .text("Plant 1")
          .style("fill", "white")
          .style("font-size", 15)

  svg
    .selectAll("myLabels")
    .data(moistureData_2)
    .enter()
      .append('g')
      .append("text")
        .attr("class", "moistureData")
        .datum(function(d) { 
          return {name: "moistureData" , value: moistureData_2[moistureData_2.length - 1]}
        })
          .attr("transform", function(d) { 
            return "translate(" + x(d.value.time) + "," + y(d.value.value) + ")"; })
          .attr("x", -40)
          .attr("y", 30)
          .text("Plant 2")
          .style("fill", "white")
          .style("font-size", 15)
}


function move(persen, id) {
  persen = Math.ceil(persen)
  var elem = document.getElementById(id);
  gsap.to(elem,{width: `${persen}%`, duration: 1, ease: 'back'})
}

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
  
