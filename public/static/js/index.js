import * as d3 from "https://cdn.skypack.dev/d3@7";
import axios from 'https://cdn.skypack.dev/axios';
import { getDatabase, ref, onValue} from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.8.3/firebase-database.min.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-analytics.js";
//import * as gsap from "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenMax.min.js";

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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getDatabase();
const moistureRef = ref(db, 'moisture');


/////Filter Data
const dataSet = async function getData() {
  return await axios.get('/api/data');
}
var data = await dataSet()
const timeParse = d3.timeParse("%H:%M | %d-%b-%Y")

var moistureData = []
var temperatureData = []
forEach()

///////Buat Graph Top Left
createTopLeft();

////TOP Right + Firebase RDB TopRight
var finalInt
var text = document.getElementById('moistureValue');
var valuetext = text.innerText;
var valueInt = parseInt(valuetext);
var maxValue = 300;
finalInt = (valueInt/maxValue)*100;
move(finalInt);

onValue(moistureRef, (snapshot) => {
  const data = snapshot.val();
  text.innerText = data;
  finalInt = (data/maxValue)*100;
  console.log("finalInt" + finalInt)
  move(finalInt)
});


//////on Window Resize
window.addEventListener('resize', function (event) {
  d3.selectAll('svg').remove();
  d3.select("#container").append("svg").remove()
  console.log('Resive event')
  createTopLeft()
}, false);

//////////////////////F*CKTIONS

function createTopLeft(){
  data = moistureData;
  
  var parentDiv = document.getElementById(`container`);
  var w = parentDiv.clientWidth || 720;
  var h = parentDiv.clientHeight || 360;
  console.log("h: " + h + "|| w: " + w)

  const margin = { top: 20, right: 30, bottom: 30, left: 50 },
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
    .style("stroke", "white")

  var x = d3.scaleTime()
    .domain(d3.extent(data, function (d) { return d.time; }))
    .range([0, width]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function (d){return + d.value;})])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 3)
    .attr("d", d3.line()
      .x(function (d) { return x(d.time) })
      .y(function (d) { return y(d.value) })
    )
  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .join("circle")
    .attr("class", "myCircle")
    .attr("cx", d => x(d.time))
    .attr("cy", d => y(d.value))
    .attr("r", 2)
    .attr("stroke", "#ff893b")
    .attr("stroke-width", 3)
    .attr("fill", "#ff893b")
}

function forEach(){
  data.data.moisture.forEach(moisture => {
    var hasil = timeParse(moisture.time)
    var obj = {"value": moisture.value,"time": hasil }
    moistureData.push(obj)
  });

  data.data.temperature.forEach(temperature => {
    var hasil = timeParse(temperature.time)
    var obj = {"value": temperature.value,"time": hasil }
    temperatureData.push(obj)
  });
}

function move(persen) {
  persen = Math.ceil(persen)
  var elem = document.getElementById("myBar");
  gsap.to(elem,{width: `${persen}%`, duration: 0.5, ease: 'back'})
}

