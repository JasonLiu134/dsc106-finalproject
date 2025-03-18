let initialLoad = 0;
const features = [
    'age', 'height', 'weight'
];

let feature_full = {
    'age': 'Age of Patient (Years)',
    'height': 'Patient Height (cm)',
    'weight': 'Patient Weight (kg)',
}

const colormap = 
    {'age': '#8014af',
    'height': '#cc4949',
    'weight': '#1867cd'};

// Load and process CSV data
async function fetchData() {
    const data = await d3.csv('datasets\\vital.csv');
    return data.map(row => ({
        age: +row.age,
        height: +row.height,
        weight: +row.weight,
        icu_days: +row.icu_days
    }))
    .filter(d => {
        return !(
            d.age === 0 &&
            d.height === 0 &&
            d.weight === 0
        );
    });
}

// Update chart with selected feature
async function updateChart(feature) {
    const data = await fetchData();
    const filteredData = data.filter(d => !isNaN(d[feature]));

    const width = 700;
    const height = 400;
    
    const margin = { top: 40, right: 30, bottom: 40, left: 50 };

    d3.select("#bchart").selectAll("svg").remove();
    
    const xScale = d3.scaleLinear()
        .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);

    const svg = d3.select("#bchart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Axes groups
    svg.selectAll("g").remove();

    // const xAxis = svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`);
    // const yAxis = svg.append("g").attr("transform", `translate(${margin.left},0)`);

    // Generate bins based on the feature value
    const binGenerator = d3.bin()
    .domain(d3.extent(filteredData, d => d[feature]))
    .thresholds(50);

    const bins = binGenerator(filteredData.map(d => d[feature]));

    // Calculate mean ICU days and margin of error
    bins.forEach(bin => {
        const values = filteredData.filter(d => d[feature] >= bin.x0 && d[feature] < bin.x1).map(d => d.icu_days);
        const mean = d3.mean(values) || 0;
        const stdDev = d3.deviation(values) || 0;
        const n = values.length || 1;  // Prevent division by zero

        bin.meanIcuDays = mean;
        bin.moeUpper = mean + stdDev; // Upper bound
        bin.moeLower = Math.max(0, mean - stdDev); // Lower bound (ensure non-negative ICU days)
        bin.count = n;
    });

    //Sets the domain of the x and yscales
    xScale.domain([d3.min(bins, d => d.x0), d3.max(bins, d => d.x1)]);
    yScale.domain([0, d3.max(bins, d => d.moeUpper)]).nice();

    // Remove old axes and labels
    svg.selectAll(".grid, .x-axis, .y-axis, .x-label, .y-label, .chart-title, .line, .moe").remove();

    // X Gridlines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("stroke", "gray")
        .attr("stroke-opacity", 0.1)
        .call(d3.axisBottom(xScale)
            .tickSize(-height + margin.top + margin.bottom)
            .tickFormat("")
        );

    // Y Gridlines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("stroke", "gray")
        .attr("stroke-opacity", 0.1)
        .call(d3.axisLeft(yScale)
            .tickSize(-width + margin.left + margin.right)
            .tickFormat("")
        );

    // Append X-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    // Append Y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // Append X-axis label
    svg.append("text")
        .attr("class", "x-label")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text(`Mean Distribution of ${feature_full[feature]}`);

    // Append Y-axis label
    svg.append("text")
        .attr("class", "y-label")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Average Number of ICU Days");

    // Append Chart Title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(`Mean Graph of ${feature_full[feature]}`);

    // Area generator for margin of error
    const area = d3.area()
        .x(d => xScale(d.x0))
        .y0(d => yScale(d.moeLower))
        .y1(d => yScale(d.moeUpper)); // Smooth curve

    // Append or update confidence interval area
    const areaPath = svg.selectAll(".area").data([bins]);

    areaPath.enter()
        .append("path")
        .attr("class", "area")
        .attr("fill", colormap[feature])
        .attr("opacity", 0)
        .attr("d", area)
        .attr("stroke-dasharray", function() { return this.getTotalLength(); })
        .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
        .transition().duration(1000)
        .attr("opacity", 0.2)
        .attr("stroke-dashoffset", 0);

    areaPath.transition().duration(1000)
        .attr("d", area);

    areaPath.exit().transition().duration(800).attr("opacity", 0).remove();
    const dots = svg.selectAll(".dots").data(bins);

    // Enter phase: Add new dots
    dots.enter()
        .append('circle')
        .attr("class", "dots")
        .attr('cx', (d) => xScale(d.x0))
        .attr('cy', height - margin.bottom) // Start from bottom
        .attr('r', 3)
        .attr("fill", colormap[feature])
        .transition().duration(1000) // Smooth transition
        .attr('cy', (d) => yScale(d.meanIcuDays));

    // Update phase: Animate position change
    dots.transition().duration(1000)
        .attr('cx', (d) => xScale(d.x0))
        .attr('cy', (d) => yScale(d.meanIcuDays));

    // Line Animation
    const line = d3.line()
        .x(d => xScale(d.x0))
        .y(d => yScale(d.meanIcuDays));

    const path = svg.selectAll(".line").data([bins]);

    // Enter phase: Append the path and animate drawing
    path.enter()
        .append('path')
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", colormap[feature])
        .attr("stroke-width", 1.5)
        .attr("d", line(bins))
        .attr("stroke-dasharray", function() { 
            const length = this.getTotalLength();
            return `${length} ${length}`;
        })
        .attr("stroke-dashoffset", function() { 
            return this.getTotalLength();
        })
        .transition().duration(1000)
        .attr("stroke-dashoffset", 0);

    // Update phase: Smoothly transition to new line
    path.transition().duration(1000)
        .attr("d", line(bins));

    // Exit phase: Fade out old paths
    path.exit()
        .transition().duration(800)
        .attr("opacity", 0)
        .remove();

    const tooltip = d3.select("#bchart")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("display", "none");
    
    // Append a foreignObject for legend inside the SVG
    const legend = svg.append("foreignObject")
        .attr("width", 150)
        .attr("height", 100)
        .style("pointer-events", "none") // Prevents blocking mouse events
        .append("xhtml:div")
        .attr("class", "legend")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "6px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("display", "none");

    // Function to update legend dynamically
    function updateLegend(bin, mouseX) {
        svg.selectAll('.highlight-line').remove();
        const chartWidth = width; // Use the SVG chart width
        const rightSide = mouseX < chartWidth / 2; // Decide position based on mouse location

        let legendX = rightSide ? width - 160 : 50; // Position inside chart
        let legendY = 35; // Always at the top

        legend.style("display", "block")
            .html(`
                <strong>Legend</strong><br/>
                Value: ${d3.format(".2f")(bin.x0)}<br/>
                Mean ICU Days: ${d3.format(".2f")(bin.meanIcuDays)}<br/>
                Upper Error Margin: ${d3.format(".2f")(bin.moeUpper)}<br/>
                Lower Error Margin: ${d3.format(".2f")(bin.moeLower)}<br/>
                Count: ${bin.count}
            `);

        // Move the legend inside the SVG
        legend.node().parentNode.setAttribute("x", legendX);
        legend.node().parentNode.setAttribute("y", legendY);

        const highlightLine = svg.append('line')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4')
            .attr('x1', xScale(bin.x0))
            .attr('x2', xScale(bin.x0))
            .attr('y1', margin.top)
            .attr('y2', height - margin.bottom)
            .attr('class', 'highlight-line');
    }

    svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .style("opacity", 0) // Transparent but responsive
    .on("mousemove", function(event) {
        const mouseX = d3.pointer(event)[0];
        const closestBin = bins.reduce((a, b) => 
            Math.abs(xScale(a.x0) - mouseX) < Math.abs(xScale(b.x0) - mouseX) ? a : b
        );
        
        updateLegend(closestBin, mouseX);
    })
    .on("mouseout", function() {
        svg.selectAll('.highlight-line').remove();
        legend.style("display", "none");
    });
}

export function createBVis(featureNum){
    if (featureNum != 0) {
        updateChart(features[featureNum - 1]);
    } else {
        if (initialLoad === 0) {
            updateChart(features[0]);
            initialLoad = 1;
        }
    }
}