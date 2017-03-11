

// define canvas variables
var margin = {top: 20, right: 20, bottom: 80, left: 20};
	margin2 = {top: 350, right: 20, bottom: 30, left: 20};
	width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    height2 = 410 - margin2.top - margin2.bottom,
    radius = Math.min(width, height) / 1.6;

// pie colors
var color = d3.scaleOrdinal()
    .range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"]);

// pie arcs
var arc = d3.arc()
    .outerRadius(radius - 5)
    .innerRadius(radius - 50);

//pie chart
var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.value; });

// add doughnut chart to canvas
var chart1 = d3.select("body").append("svg")
	.attr("id", "chart1")
	.attr("width", width - 70)
	.attr("height", height + margin.top + margin.bottom + 100)
		.append("g")
	.attr("transform", "translate(" + ((width / 2) - 60) + "," + (height - margin.top - margin.bottom + 20) + ")");


// get pie chart assets
d3.csv("assets.csv", type, function(error, data) {
	if (error) throw error;

  	var g = chart1.selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("id", function(d) { return d.data.tick })
		.attr("class", "arc");

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



// add line chart area to canvas
var	chart2 = d3.select("body")
	.append("svg")
		.attr("id", "chart2")
		.attr("class", "chart2")
		.attr("width", width + margin.left * 2 + margin.right + 90 )
		.attr("height", height + margin.top + margin.bottom + 110)
	.append("g")
		.attr("transform", "translate(" + 20 + "," + margin.top + ")");

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

var clip = chart2.append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("id", "clip-rect")
    .attr("x", "0")
    .attr("y", "0")
    .attr('width', width)
    .attr('height', height);

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
    .y(function(d) { 
    	return y(d.port_close); });

var asset_line;

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
		.attr("clip-path", "url(#clip)")
		.attr("class", "portLine")
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 3)
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

	tooltip.append("rect")
		.attr("width", 85)
		.attr("height", 90)
		.attr("class", "tooltip-rect")

	focus.append("line")
        .attr("class", "x")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);


	tooltip.append("text")
		.attr("x", 5)
		.attr("y", 10)
		.attr("class", "tooltip-rect-text-1")
		.attr("dy", ".35em")
	tooltip.append("text")
		.attr("x", 5)
		.attr("y", 24)
		.attr("class", "tooltip-rect-text-2")
		.attr("dy", ".35em");
	tooltip.append("text")
		.attr("x", 5)
		.attr("y", 38)
		.attr("class", "tooltip-rect-text-3")
		.attr("dy", ".35em");
	tooltip.append("text")
		.attr("x", 5)
		.attr("y", 52)
		.attr("class", "tooltip-rect-text-4")
		.attr("dy", ".35em");	
	tooltip.append("text")
		.attr("x", 5)
		.attr("y", 66)
		.attr("class", "tooltip-rect-text-5")
		.attr("dy", ".35em");
	tooltip.append("text")
		.attr("x", 5)
		.attr("y", 80)
		.attr("class", "tooltip-rect-text-6")
		.attr("dy", ".35em");


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
		.on("mouseover", function() { 
			tooltip.style("display", null); 
			focus.select(".x").style("display", null);
		})
		.on("mouseout", function() { 
			tooltip.style("display", "none");
			focus.select(".x").style("display", "none");
		})
		.on("mousemove", mousemove)
		.call(zoom);




	function mousemove() {
		var x0 = x.invert(d3.mouse(this)[0]),
			i = bisectDate(data, x0, 1),
			d0 = data[i - 1],
			d1 = data[i],
			d = x0 - d0.aapl_date > d1.aapl_date - x0 ? d1 : d0;
		tooltip.attr("transform", "translate(" + (x(d.aapl_date) + margin.left + 5) + "," + (d3.event.pageY - 215) + ")");
		tooltip.select(".tooltip-rect-text-1").text("Portfolio: " + parseFloat(d.port_close).toFixed(2));
		tooltip.select(".tooltip-rect-text-2").text("SBUX: " + parseFloat(d.sbux_close).toFixed(2));
		tooltip.select(".tooltip-rect-text-3").text("GOOGL: " + parseFloat(d.googl_close).toFixed(2));
		tooltip.select(".tooltip-rect-text-4").text("NDAQ: " + parseFloat(d.ndaq_close).toFixed(2));
		tooltip.select(".tooltip-rect-text-5").text("GE: " + parseFloat(d.ge_close).toFixed(2));
		tooltip.select(".tooltip-rect-text-6").text("AAPL: " + parseFloat(d.aapl_close).toFixed(2));
		focus.select(".x")
		    .attr("transform",
		          "translate(" + x(d.aapl_date) + "," +
		                         0 + ")")
		               .attr("y2", height);
	}

  	var g = chart1.selectAll(".arc")
		.on("click", function(d) {
			toggleTicker(this)
	});



	// toggle specific stock lines on chart2 by clicking arcs
	function toggleTicker(ticker) {
		// asset lines
		asset_line = d3.line()
		    .x(function(d) { return x(d.aapl_date); })
		    .y(function(d) { 
		    	var asset_data = {
					googl: d.googl_close,
					sbux: d.sbux_close,
					ndaq: d.ndaq_close,
					ge: d.ge_close,
					aapl: d.aapl_close
				}
		    	return y(asset_data[ticker.getAttribute("id").toLowerCase()]); 
		    });

		if (ticker.classList.contains("clicked")) {
			ticker.classList.remove("clicked")
			chart2.selectAll("path#line-" + ticker.getAttribute("id") + "").remove()
		} else {
			elements = document.getElementById("chart1").childNodes[0].childNodes
			for (var i = 0; i < elements.length; i++) {
				elements[i].classList.remove('clicked');
			}



			focus.select("path.line").remove();

			// add line
			focus.append("path")
				.attr("clip-path", "url(#clip)")
				.datum(data)
				.attr("class", "line")
				.attr("id", "line-" + ticker.getAttribute("id"))
				.attr("fill", "none")
				.attr("stroke", ticker.childNodes[0].style.fill) // get color by id
				.attr("stroke-linejoin", "round")
				.attr("stroke-linecap", "round")
				.attr("stroke-width", 3)
				.attr("d", asset_line);

			ticker.classList.add("clicked");
		}
	}

});



// brush function - big thanks to mike bostocks tutorials for this function
function brushed() {
	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
	var s = d3.event.selection || x2.range();
	x.domain(s.map(x2.invert, x2));
	focus.select(".grid")
	focus.selectAll(".line").attr("d", asset_line);
	focus.select(".portLine").attr("d", portLine);
	focus.select(".axis--x").call(xAxis);
	chart2.select(".zoom").call(zoom.transform, d3.zoomIdentity
		.scale(width / (s[1] - s[0]))
		.translate(-s[0], 0));

}


// zoom function
function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.select(".grid")
    focus.selectAll(".line").attr("d", asset_line);
    focus.select(".portLine").attr("d", portLine);
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }





















