import * as d3 from "https://cdn.skypack.dev/d3@7";
import axios from 'https://cdn.skypack.dev/axios';

const dataSet = async function getData() {
  return await axios.get('/api/data');
}
var data = await dataSet()
const timeParse = d3.timeParse("%H:%M | %d-%b-%Y")

var moistureData = []
var temperatureData = []
forEach()

var parentDiv = document.getElementById(`container`);
var w = parentDiv.clientWidth || 720;
var h = parentDiv.clientHeight || 360;
console.log("h: " + h + "|| w: " + w)

var parentDiv2 = document.getElementById(`container2`);
var w2 = parentDiv2.clientWidth || 1920;
var h2 = parentDiv2.clientHeight || 1080;
console.log("h2: " + h2 + "|| w2: " + w2)

const margin = { top: 40, right: 30, bottom: 30, left: 40 },
width = w - margin.left - margin.right,
height = h - margin.top - margin.bottom;

function createTopLeft(){
  data = moistureData;
  const svg = d3.select(`#container`)
    .append("svg")
    .style("color", "white")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
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
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

  var Tooltip = d3.select("#container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }

  var mousemove = function(d) {
    Tooltip
      .html("The exact value of<br>this cell is: " + d.value)
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }

  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }
}

createTopLeft()

// update()

// function update() {
//   createLinechart(moistureData)
//   console.log(moistureData)
// }

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

window.addEventListener('resize', function (event) {
  d3.selectAll('svg').remove();
  d3.select("#container").append("svg").remove()

  console.log('Resive event')
  // createLinechart(moistureData)
}, false);