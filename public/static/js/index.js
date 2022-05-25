import * as d3 from "https://cdn.skypack.dev/d3@7";
// import * as anychart from "https://cdn.anychart.com/releases/8.10.0/js/anychart-base.min.js";
import axios from 'https://cdn.skypack.dev/axios';

console.log('js TOP')
document.getElementById("p1").innerHTML = "world";

const dataSet = async function getData() {
    return await axios.get('/api/data');
}
var data  = await dataSet()
var datastr = JSON.stringify(data.data)

const timeParse = d3.timeParse("%H:%M | %d-%b-%Y")

var timeData = []
var timeData2 = []
data.data.forEach(data => {
    var hasil = timeParse(data.time)
    var obj = {"value": data.value, "time": hasil}
    timeData.push(obj)
});
console.log(timeData)

// function getData() {
//   return [
//     ['1990',12],
//     ['1991',14],
//     ['1993',21],
//     ['1994',21],
//     ['1996',26],
//     ['1998',26],
//     ['2000',27],
//     ['2002',31],
//     ['2004',29],
//     ['2006',31],
//     ['2008',36],
//     ['2010',41],
//     ['2012',42],
//     ['2014',48],
//     ['2016',50],
//     ['2018',57]
//   ];
// }

// var dataSet = anychart.data.set(getData());
// var seriesData = dataSet.mapAs({ x: 0, value: 1 });
// var chart = anychart.line();

// chart.title('Acceptance of same-sex relationships in the US over the last 2 decades');
// chart.yAxis().title('% of people who accept same-sex relationships');

// var lineChart = chart.line(seriesData);
// chart.container('container');
// chart.draw();

function createLinechart(data){
  var parentDiv = document.getElementById("my_dataviz");
  var w = 1366 || parentDiv.clientWidth;
  var h = 768 || parentDiv.clientHeight;
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
