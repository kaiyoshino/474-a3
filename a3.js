


var margin = {top: 20, right: 20, bottom: 30, left: 50};
	width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

var color = d3.scaleOrdinal()
    .range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"]);

var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.value; });

// add doughnut chart to canvas
var chart1 = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


d3.csv("assets.csv", type, function(error, data) {
  if (error) throw error;

  var g = chart1.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
	  .attr("id", function(d) { return d.data.tick })
      .attr("class", "arc")
      .on("click", function(d) {
          toggleTicker(this)
      });

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.tick); });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(function(d) { return d.data.tick; });
});

function type(d) {
  d.value = +d.value;
  return d;
}


function toggleTicker(ticker) {
	if (ticker.classList.contains("clicked")) {
		chart2.selectAll("path#line-" + ticker.getAttribute("id") + "").remove()
	} else {
		d3.csv("./data/" + ticker.getAttribute("id").toLowerCase()  + ".csv", function(d) {
		  d.date = parseTime(d.date);
		  d.adj_close = +d.adj_close;
		  return d;
		}, function(error, data) {
		  if (error) throw error;

			// add line
			chart2.append("path")
				.datum(data)
				.attr("id", "line-" + ticker.getAttribute("id"))
				.attr("fill", "none")
				.attr("stroke", "steelblue")
				.attr("stroke-linejoin", "round")
				.attr("stroke-linecap", "round")
				.attr("stroke-width", 1.5)
				.attr("d", line);
		});
	}
	ticker.classList.toggle("clicked")
}


// add line chart to canvas
var	chart2 = d3.select("body")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y-%m-%d");

var x = d3.scaleTime()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);


var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.adj_close); });

var portLine = d3.line()
    .x(function(d) { return x(d.aapl_date); })
    .y(function(d) { return y(d.port_close); });

// get line chart data
d3.csv("./data/aapl.csv", function(d) {
  d.date = parseTime(d.date);
  d.adj_close = +d.adj_close;
  return d;
}, function(error, data) {
  if (error) throw error;
  //console.log(data, function(d) { return (d.aapl_close + d.ge_close + d.googl_close + d.sbux_close + d.ndaq_close) ; })
  // scale range of data
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, 1100]);

  // add x axis
  chart2.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

  // y axis
  chart2.append("g")
	.call(d3.axisLeft(y))
	.append("text")
	.attr("fill", "#000")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", "0.71em")
	.attr("text-anchor", "end")
	.text("Price ($)");
});

d3.csv("./data/data.csv", function(d) {
	d.aapl_date = parseTime(d.aapl_date);
	d.aapl_close = +d.aapl_close;
	d.ge_close = +d.ge_close;
	d.googl_close = +d.googl_close;
	d.ndaq_close = +d.ndaq_close;
	d.sbux_close = +d.sbux_close;
	d.port_close = +(d.aapl_close + d.googl_close + d.ge_close + d.ndaq_close + d.sbux_close);
  return d;
}, function(error, data) {
	// add portfolio value line
  	chart2.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", portLine);
});

