import * as d3 from "https://cdn.skypack.dev/d3@7";
import axios from 'https://cdn.skypack.dev/axios';
import { getDatabase, ref, onValue} from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.8.3/firebase-database.min.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut  } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.8.3/firebase-auth.min.js";

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

const authDiv = document.getElementById("authDiv");
const topDiv = document.getElementById("top");
const botDiv = document.getElementById("bottom");
const conDiv = document.getElementById("container");
const background = document.getElementById("backgroundAuth");
const topLeft = document.getElementsByClassName("top-left");
const topRight= document.getElementsByClassName("top-right");
const botLeft = document.getElementsByClassName("bottom-left");
const botRight = document.getElementsByClassName("bottom-right");
var parentDiv = document.getElementById(`containersize`);
var w,h, width, height;


conDiv.style.display = "none";
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

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
    const errorCode = error.code;
    const errorMessage = error.message;
    alert("Wrong Email or Password")
  });
})

function loginAnimation(){
  var tl = gsap.timeline();
  tl.to(background,{opacity: 0, duration: 0.5, ease: 'back', onComplete: () => {background.style.display = "none";}})
    .to(topLeft,{opacity: 1, y: 0 , duration: 0.35, ease: 'back'})
    .to(topRight,{opacity: 1, y: 0, duration: 0.35, ease: 'back'})
    .to(botLeft,{opacity: 1, y: 0, duration: 0.35, ease: 'back'})
    .to(botRight,{opacity: 1, y: 0, duration: 0.35, ease: 'back'});
}


const db = getDatabase();
const moistureRef = ref(db, 'moisture');

var moistureData = [];
var temperatureData = [];
var data;
const timeParse = d3.timeParse("%H:%M | %d-%b-%Y");

async function ambilData(){
  const dataSet = async function getData() {
    return await axios.get('/api/data');
  }
  data = await dataSet()
  forEach()
}

///////Buat Graph Top Left
await ambilData();
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
    .attr("stroke", "white")
    .attr("stroke-width", 3)
    .attr("d", d3.line()
      .x(d => x(d.time))
        .y(d => y(d.value))
    )
  
  const Tooltip = d3.select("#container")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

      // Three function that change the tooltip when user hover / move / leave a cell
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


  svg
      .append("g")
      .selectAll("dot")
      .data(data)
      .join("circle")
        .attr("class", "myCircle")
        .attr("cx", d => x(d.time))
        .attr("cy", d => y(d.value))
        .attr("r", 8)
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 3)
        .attr("fill", "white")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    
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
  gsap.to(elem,{width: `${persen}%`, duration: 1, ease: 'back'})
}

