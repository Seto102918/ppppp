import * as d3 from "https://cdn.skypack.dev/d3@7";
import axios from 'https://cdn.skypack.dev/axios';

const parentDiv = document.getElementById('webview_container');

const socket = io("https://setongeteslagi.herokuapp.com/")
socket.on("connect", () => {
  console.log("socket ID: " + socket.id)
})

const timeParse = d3.timeParse("%H:%M");
var moistureData = [];
var moistureData_2 = [];
var maxMoisture, maxMoisture_2;

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

socket.on('moisture_update', moistureInput => {
  var date = new Date();
  var waktu = `${date.getHours()}:${date.getMinutes()}`;
  var hasil = timeParse(waktu)

  var obj = {"value": moistureInput,"time": hasil}
  moistureData.push(obj)

  var obj_p = {"value": moistureData_2[moistureData_2.length-1].value,"time": hasil}
  moistureData_2.push(obj_p)
  refreshChart();
})

socket.on('moisture_update_2', moistureInput2 => {
  var date = new Date();
  var waktu = `${date.getHours()}:${date.getMinutes()}`;
  var hasil = timeParse(waktu)

  var obj = {"value": moistureInput2,"time": hasil}
  moistureData_2.push(obj)
  
  var obj_p = {"value": moistureData[moistureData.length-1].value,"time": hasil}
  moistureData.push(obj_p)

  refreshChart();
})

window.addEventListener('resize', function (event) {refreshChart()}, false);

async function refreshChart(){
  removeChart()
  createTopLeft()
}

function removeChart(){
  d3.selectAll('svg').remove();
  d3.select("#container_buat_app").append("svg").remove()
}



function createTopLeft(){
  var data;
  if (maxMoisture >= maxMoisture_2) { data = moistureData; }
  else { data = moistureData_2; }

  var w = parentDiv.clientWidth || 720;
  var h = parentDiv.clientHeight || 360;
  const margin = { top: 20, right: 30, bottom: 30, left: 50 }
  var width = w - margin.left - margin.right
  var height = h - margin.top - margin.bottom
  console.log("height: " + height + "||   width: " + width)

  const svg = d3.select(`#container_buat_app`)
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

//////////////////////
  
  /////////////////////////moisture data
  
  svg.append("path")
    .datum(moistureData)
    .attr("fill", "none")
    .attr("stroke", "#69b3a2")
    .text("Plant 1")
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
