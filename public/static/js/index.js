import * as d3 from "https://cdn.skypack.dev/d3@7";
import axios from 'https://cdn.skypack.dev/axios';

console.log('js TOP')

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
  var parentDiv = document.getElementById("container");
  var w = parentDiv.clientWidth || 1920;
  var h = parentDiv.clientHeight || 1080;
  console.log( "h: " + h + "|| w: " + w)
  document.getElementById("p1").innerHTML = `${w} - ${h}`

  const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

  const svg = d3.select("#container")
    .append("svg")
        .style("color", "white")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .style("color", "white")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .style("stroke", "white")

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
      .attr("stroke", "white")
      .attr("stroke-width",3)
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.time) })
        .y(function(d) { return y(d.value) })
        )

    // Add the points
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


    
        
}

function update(){
  createLinechart(timeData)
}
update()


window.addEventListener('resize', function(event) {
  d3.selectAll('svg').remove();
  d3.select("#container").append("svg").remove()

  console.log('Resive event')

  createLinechart(timeData)
}, false);