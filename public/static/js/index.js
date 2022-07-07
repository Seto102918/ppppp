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

const db = getDatabase();
const moistureRef = ref(db, 'moisture');
const timeParse = d3.timeParse("%H:%M | %d-%b-%Y");

var moistureData = [];
var data;

async function ambilData(){
  data =  await axios.get('/api/moistureData');
  data.data.moisture.forEach(moisture => {
    var hasil = timeParse(moisture.time)
    var obj = {"value": moisture.value,"time": hasil }
    moistureData.push(obj)
  });
}

///////Buat Graph Top Left
await ambilData();
createTopLeft();

////TOP Right + Firebase RDB TopRight
var finalInt
var text = document.getElementById('moistureValue');
var valuetext = text.innerText;
var valueInt = parseInt(valuetext);
var maxValue = 5000;

finalInt = (valueInt/maxValue)*100;
move(finalInt);

onValue(moistureRef, (snapshot) => {
  const data = snapshot.val();
  text.innerText = data;
  finalInt = (data/maxValue)*100;
  console.log("finalInt" + finalInt)

  move(finalInt)
  refreshChart()
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
  await ambilData()
  createTopLeft()
}

function removeChart(){
  d3.selectAll('svg').remove();
  d3.select("#container").append("svg").remove()
}

function createTopLeft(){
  data = moistureData;

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
    .domain(d3.extent(data, function (d){return d.time;}))
    .range([0, width]);
  // svg.append("g")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(d3.axisBottom(x));

  var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function (d){return + d.value;})])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));
  
  var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width )
    .attr("height", height )
    .attr("x", 0)
    .attr("y", 0);

  var brush = d3.brushX()
      .extent( [ [0,0], [width,height] ] )
      // .on("end", updateChart)
  
  var scatter = svg.append('g')
    .attr("clip-path", "url(#clip)")

  
  
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
    
  scatter
    .append("path")
    .datum(data)
    .attr("stroke", "white")
    .attr("fill", "none")
    .attr("stroke-width", 3)
    .attr("d", d3.line()
      .x(d => x(d.time))
      .y(d => y(d.value))
    )  

  scatter
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.time); } )
      .attr("cy", function (d) { return y(d.value); } )
      .attr("r", 8)
      .style("opacity", 1)
      .attr("fill", "#1ed75f")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      
  

  var idleTimeout
  function idled() { idleTimeout = null; }

  function updateChart(event) {
    var extent = event.selection
    if(!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
      x.domain(d3.extent(data, function (d){return d.time;}));
    }else{
      x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
      scatter.select(".brush").call(brush.move, null)
    }

    xAxis.transition().duration(1000).call(d3.axisBottom(x))
    scatter
      .selectAll("circle")
      .transition().duration(1000)
      .attr("cx", function (d) { return x(d.time); } )
      .attr("cy", function (d) { return y(d.value); } )

    }

    
}

function move(persen) {
  persen = Math.ceil(persen)
  var elem = document.getElementById("myBar");
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
  
