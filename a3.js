

// define canvas variables
var margin = {top: 20, right: 20, bottom: 80, left: 40};
	margin2 = {top: 445, right: 20, bottom: 30, left: 40};
	width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom,
    radius = Math.min(width, height) / 2;

// pie colors
var color = d3.scaleOrdinal()
    .range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"]);

// pie arcs
var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

//pie chart
var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.value; });

// add doughnut chart to canvas
var chart1 = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top)
		.append("g")
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


// get pie chart assets
d3.csv("assets.csv", type, function(error, data) {
	if (error) throw error;

  	var g = chart1.selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("id", function(d) { return d.data.tick })
		.attr("class", "arc")
		.on("click", function(d) {
			chart1.selectAll(".arc").classed("clicked", false)
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

// toggle specific stock lines on chart2 by clicking arcs
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
		  	focus.select("path.line").remove();

			// add line
			focus.append("path")
				.datum(data)
				.attr("class", "line")
				.attr("id", "line-" + ticker.getAttribute("id"))
				.attr("fill", "none")
				.attr("stroke", ticker.childNodes[0].style.fill) // get color by id
				.attr("stroke-linejoin", "round")
				.attr("stroke-linecap", "round")
				.attr("stroke-width", 1.5)
				.attr("d", line);
		});
	}
	ticker.classList.toggle("clicked")
}



// add line chart area to canvas
var	chart2 = d3.select("body")
	.append("svg")
		.attr("id", "chart2")
		.attr("class", "chart2")
		.attr("width", width + margin.left * 2 + margin.right)
		.attr("height", height + margin.top + margin.bottom * 2)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// // tool tip div
// var tooltip = d3.select("body").append("div")
//     .attr("class", "tooltip");

var x = d3.scaleTime().range([0, width]),
	x2 = d3.scaleTime().range([0, width]),
	y = d3.scaleLinear().range([height, 0]),
	y2 = d3.scaleLinear().range([height2, 0]);

var parseTime = d3.timeParse("%Y-%m-%d");
	bisectDate = d3.bisector(function(d) { return d.aapl_date; }).left;
	
var xAxis = d3.axisBottom(x),
	xAxis2 = d3.axisBottom(x2);

var brush = d3.brushX()
		.extent([[0, 0], [width, height2]])
		.on("brush end", brushed);

// create zoom variable
var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);


// focus area
var focus = chart2.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// context area
var context = chart2.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


chart2.append("defs").append("clipPath")
		.attr("id", "clip")
	.append("rect")
		.attr("width", width)
		.attr("height", height);

// portfolio lines
var portLine = d3.line()
    .x(function(d) { return x(d.aapl_date); })
    .y(function(d) { return y(d.port_close); });

// asset lines
var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.adj_close); });


// add specific stock lines
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
  	focus.append("path")
		.datum(data)
		.attr("class", "portLine")
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", portLine);

	// scale range of data
	x.domain(d3.extent(data, function(d) { return d.aapl_date; }));
	y.domain([0, 1200]);
	x2.domain(x.domain());
	y2.domain(y.domain());

	// add x axis
 	focus.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// y axis
	focus.append("g")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("fill", "#000")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("Value ($)");

	// x axis 2
	context.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height2 + ")")
		.call(xAxis2);

	var tooltip = chart2.append("g")
		.attr("class", "tooltip")
		.style("display", "none");

	tooltip.append("text")
		.attr("x", 10)
		.attr("dy", ".35em");

    tooltip.append("circle")
        .attr("r", 7.5);

	// add brush area
	context.append("g")
		.attr("class", "brush")
		.call(brush)
		.call(brush.move, x.range());

	chart2.append("rect")
		.attr("class", "zoom")
		.attr("width", width)
		.attr("height", height)
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.on("mouseover", function() { tooltip.style("display", null); })
		.on("mouseout", function() { tooltip.style("display", "none"); })
		.on("mousemove", mousemove)
		.call(zoom);




	function mousemove() {
		var x0 = x.invert(d3.mouse(this)[0]),
			i = bisectDate(data, x0, 1),
			d0 = data[i - 1],
			d1 = data[i],
			d = x0 - d0.aapl_date > d1.aapl_date - x0 ? d1 : d0;
		tooltip.attr("transform", "translate(" + (x(d.aapl_date) + margin.left) + "," + (y(d.port_close) + margin.top)+ ")");
		tooltip.select("text").text(d.port_close);
	}

});



// brush function - big thanks to mike bostocks tutorials for this function
function brushed() {
	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
	var s = d3.event.selection || x2.range();
	x.domain(s.map(x2.invert, x2));
	focus.select(".grid")
	focus.select(".line").attr("d", line);
	focus.select(".portLine").attr("d", portLine);
	focus.select(".axis--x").call(xAxis);
	focus.select(".zoom").call(zoom.transform, d3.zoomIdentity
		.scale(width / (s[1] - s[0]))
		.translate(-s[0], 0));

}


// zoom function - again, thank you mike bostock!
function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.select(".grid")
    focus.select(".line").attr("d", line);
    focus.select(".portLine").attr("d", portLine);
    focus.select(".axis--x").call(xAxis);
    focus.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }





















