import * as d3 from "https://cdn.skypack.dev/d3@7";
import axios from 'https://cdn.skypack.dev/axios';




const dataSet = async function getData() {
    return await axios.get('/api/data');
}
var data  = await dataSet()
var datastr = JSON.stringify(data.data)

const timeParse = d3.timeParse("%H:%M | %d-%b-%Y")

var timeData = []

data.data.forEach(data => {
    var hasil = timeParse(data.time)
    var obj = {"value": data.value, "time": hasil}
    timeData.push(obj)
});

console.log(timeData)




function createLinechart(data){
  var parentDiv = document.getElementById("my_dataviz");
  var w = parentDiv.clientWidth;
  var h = parentDiv.clientHeight;
  console.log( "h: " + h + "|| w: " + w)

  const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

  const svg = d3.select("#my_dataviz")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .attr("stroke","white");

    var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.time; }))
        .range([ 0, width ]);
      

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));


    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.value; })])
        .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y));


    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.time) })
        .y(function(d) { return y(d.value) })
        )
}

function update(){
  createLinechart(timeData)
}
update()

window.addEventListener('resize', function(event) {
  d3.selectAll('svg').remove();
  d3.select("#my_dataviz").append("svg").remove()

  console.log('Resive event')

  createLinechart(timeData)
}, false);

window.onload = timedRefresh(900000);