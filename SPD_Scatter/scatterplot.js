//Zoom behavior:
//All of my testing and development was done on a laptop with a trackpad, so I was able to get everything working using the following:
//To pan, click and hold on a circle and drag (this should transform circles AND country names)
//To zoom in: hover over a circle, and move two fingers on the trackpad upwards, downwards to zoom out.
// To display country tooltip, simply hover over the circle in question.



//Define Margin
var margin = {left: 90, right: 80, top: 50, bottom: 50 }, 
    width = 960 - margin.left -margin.right,
    height = 500 - margin.top - margin.bottom;

//Define Color
// I think I might need to change this to category 10
// Will look back at multiline chart code to confirm
var colors = d3.schemeCategory10;

//Define SVG
  var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Define Scales
// Reusing this code section from multiline chart, old version did not work with d3v5
var xScale = d3.scaleLinear()
    .range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

// Using this to access color for each dot, might be a better way, will revisit later (reusing multiline)
var zScale = d3.scaleOrdinal(d3.schemeCategory10).domain([0, 15]);
    
//Define Tooltip here
    
      
//Define Axis
// Reusing code from multiline chart, existing way to establish axes was not applicable to d3v5
var xAxis = d3.axisBottom(xScale).ticks(5);
var yAxis = d3.axisLeft(yScale).ticks(5);
    
// Pull the data from the csv file.
// Code adapted from multiline chart, expanded for more columns
function rowConverter(data) {
    return {
        country : data.country,
        gdp : +data.gdp,
        population : +data.population,
        ecc : +data.ecc,
        ec : +data.ec
    }
}

//Get Data
// Define domain for xScale and yScale
d3.csv("scatterdata.csv", rowConverter).then(function(data){
    
    // Some code reuse from multiline chart
    // X axis should be absed on gdp, y on energy consumption per capita
    xScale.domain([0,d3.max(data, function(d){ return d.gdp; }) + 5]);
    yScale.domain([0,d3.max(data, function(d) { return d.ecc; }) + 15]);
    
    //Draw Scatterplot
    // updated x/y coords to be based on csv data, not js data
    // Made radius dynamic by basic it on the ec data field
    // Added color using zscale in the same manner as was done in multiline chart. 
    
    // The mouseover code is adapted from the book example on page 212 and 213, a few changes are made to incorporate multiple data fields for pop/gdp/etc
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) {return d.ec*1.25;})
        .attr("cx", function(d) {return xScale(d.gdp);})
        .attr("cy", function(d) {return yScale(d.ecc);})
        .style("fill", function(d, i) { return zScale(i); })
        .on("mouseover", function(d) {
            var xPos = xScale(d.gdp);
            var yPos = yScale(d.ecc);
        
        d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .select("#htmlcountry")
            .text(d.country);
        
        d3.select("#tooltip").select("#htmlpop")
            .text(d.population);
        d3.select("#tooltip").select("#htmlgdp")
            .text(d.gdp);
        d3.select("#tooltip").select("#htmlepc")
            .text(d.ecc);
        d3.select("#tooltip").select("#htmltec")
            .text(d.ec);
        
        d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function() {
            // Hide the tooltip
            d3.select("#tooltip").classed("hidden", true);
        });
    
    //Draw Country Names
    var names = svg.selectAll("text")
        .data(data)
        .enter().append("text")
        .attr("class","text")
        .style("text-anchor", "start")
        .attr("x", function(d) {return xScale(d.gdp);})
        .attr("y", function(d) {return yScale(d.ecc);})
        
        .style("fill", "black")
        .text(function (d) {return d.country; });
    //Add .on("mouseover", .....
    //Add Tooltip.html with transition and style
    //Then Add .on("mouseout", ....
    
    //Scale Changes as we Zoom
    // Call the function d3.behavior.zoom to Add zoom
    // I used puzzlr.org/zoom-in-d3-v4 as a guide
    // In addition I used observablehw.com/@d3/zoom
    
    // I used - bl.ocks.org/mbostock d3 zoom/pan example
    // As an axample of how to modify the axes
    var zoom = d3.zoom()
        .on("zoom", zoomed);
    
    // Tracks the x value to modify when scaling axes and names etc
    var gX = svg.append("g")
        .attr("class", "axis axis--x")
        .call(xAxis);
    
    // Tracks the y value to modify when scaling axes and names etc
    var gY = svg.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);
    
    // Dictates the behavior that will occur when zooming
    function zoomed() { 
        
        // logic for transforming names alongide the circles.
        names.attr("transform", d3.event.transform);
        
        // Apply transformation to all circles
       svg.selectAll(".dot").attr("transform", d3.event.transform); 
       
       // Modify the x and y axes
        gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
    }
    
    zoom(svg);
    
    // Legend box
    // var legendbox = svg.append("rect")
    //     .attr("x", 600)
    //     .attr("y", 150)
    //     .attr("width", 200)
    //     .attr("height", 250)
    //     .style("fill", "gray");
    // var legendtext = svg.append("text")
    //     .attr("class", "label")
    //     .attr("y", 410)
    //     .attr("x", width - 100)
    //     .style("text-anchor", "middle")
    //     .attr("font-size", "12px")
    //     .text("Total Energy Consumption (Trillion BTUs)");
    
    // // Legend big component
    // var legendbigcirc = svg.append("circle")
    //     .attr("r", 90)
    //     .attr("cx", 710)
    //     .attr("cy", 310)
    //     .style("fill", "white");
    // var lbtext = svg.append("text")
    //     .attr("class", "label")
    //     .attr("y", 310)
    //     .attr("x", 710)
    //     .style("text-anchor", "middle")
    //     .attr("font-size", "12px")
    //     .text("90");
    
    // // Legend medium component
    // var legendmedcirc = svg.append("circle")
    //     .attr("r", 20)
    //     .attr("cx", 740)
    //     .attr("cy", 195)
    //     .style("fill", "white");
    // var medtext = svg.append("text")
    //     .attr("class", "label")
    //     .attr("y", 200)
    //     .attr("x", 740)
    //     .style("text-anchor", "middle")
    //     .attr("font-size", "12px")
    //     .text("20");
    
    // // Legend small component
    // var legendsmallcirc = svg.append("circle")
    //     .attr("r", 7)
    //     .attr("cx", 760)
    //     .attr("cy", 165)
    //     .style("fill", "white");
    // var smalltext = svg.append("text")
    //     .attr("class", "label")
    //     .attr("y", 169)
    //     .attr("x", 760)
    //     .style("text-anchor", "middle")
    //     .attr("font-size", "12px")
    //     .text("7");
    
    
    // x axis text
    var xtext = svg.append("text")
        .attr("class", "label")
        .attr("y", -10)
        .attr("x", width / 2)
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("UOF Reports against African Americans");
    
    // y axis text
    var xtext = svg.append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")   
        .attr("y", -50)
        .attr("x", -200)
        
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Total UOF Reports");
//
// //x-axis
//    svg.append("g")
//    .attr("class", "x axis")
//    .attr("transform", "translate(0," + height + ")")
//    .call(xAxis)
//    .append("text")
//    .attr("class", "label")
//    .attr("y", 50)
//    .attr("x", width/2)
//    .style("text-anchor", "middle")
//    .attr("font-size", "12px")
//    .text("GDP (in Trillion US Dollars) in 2010");

    
//    //Y-axis
//    svg.append("g")
//    .attr("class", "y axis")
//    .call(yAxis)
//    .append("text")
//    .attr("class", "label")
//    .attr("transform", "rotate(-90)")
//    .attr("y", -50)
//    .attr("x", -50)
//    .attr("dy", ".71em")
//    .style("text-anchor", "end")
//    .attr("font-size", "12px")
//    .text("Energy Consumption per Capita (in Million BTUs per person)");    
})
    
    
   
    
     
//}
