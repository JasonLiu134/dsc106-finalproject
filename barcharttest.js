const features = [
    'preop_hb', 'preop_plt', 'preop_pt', 'preop_na',
    'preop_k', 'preop_gluc', 'preop_alb', 'preop_alt'
];

let feature_caps = {
    'preop_hb': "This histogram illustrates the distribution of preoperative hemoglobin levels and their potential correlation with ICU stay duration. With average hemoglobin levels stabilizing around 12.3 to 17.5 g/dL, we can notice that taller bars reside on values outside these bounds. This is primarily due to preoperative anemia (liver-related surgery)",
    'preop_plt': "This histogram shows how preoperative platelet counts vary among patients and their possible impact on ICU stay duration. With average platelet levels stabilizing around 200 to 450 x1000mcL, and the bars remain higher outside this level. Some common surgeries for this are end-stage liver disease, neurosurgery, and ophthalmic surgery.",
    'preop_pt': "This histogram displays the distribution of preoperative prothrombin times and their potential link to ICU recovery patterns.",
    'preop_na': "This histogram visualizes the distribution of preoperative sodium levels and their potential influence on ICU stay outcomes. In general, the preoperative sodium levels on average remain around 139 mEq/L in which the majority of the higher bars are showcased to be lower from the average. A wide variety of surgeries revolve around low sodium, but primarily cardiac and orthopedic surgeries.",
    'preop_k': "This histogram highlights the range of preoperative potassium levels and explores their relationship with ICU duration. On average the preoperative potassium levels are seen around 4.29 to 4.67 mmol/L in which the larger of the bars reside around lower potassium levels. Some common surgeries for low potassium levels are due liver failure, muscle weakness, and cardiovascular surgeries.",
    'preop_gluc': "This histogram presents the distribution of preoperative blood glucose levels and their possible correlation with ICU stays. On average the blood glucose levels remain around 100 mg/dL, but can be higher for those with diabetes. We can notice that high glucose levels have higher intensive care stay, but have less of a correlation compared to others.",
    'preop_alb': "This histogram illustrates the distribution of preoperative albumin levels and their potential effect on ICU recovery duration. On average, preoperative albumin levels stay within 3.5 to 5.5 g/dL in which we can notice a large amount of albumin levels to be very low suggesting a higher correlation. Some surgeries related with low albumin levels are liver transplantation, partial hepatectomy, and cardiac surgeries.",
    'preop_alt': "This histogram visualizes the distribution of preoperative ALT levels and investigates their possible connection to ICU stay patterns. On average, the alanine transaminase levels should be less than 40, but we can see some higher ICU stays the higher ALT gets. Some surgeries related to low albumin levels are partial hepatectomy and cardiac surgeries."
}


let feature_full = {
    'preop_hb': 'Preoperative Hemoglobin (g/dL)',
    'preop_plt': 'Preoperative Platelet (x1000/mcL)',
    'preop_pt': 'Preoperative Prothrombin Time (%)',
    'preop_na': 'Preoperative Sodium Level (mmol/L)',
    'preop_k': 'Preoperative Potassium Level (mmol/L)',
    'preop_gluc': 'Preoperative Blood Glucose Level (mg/dL)',
    'preop_alb': 'Preoperative Albumin Level (g/dL)',
    'preop_alt': 'Preoperative Alanine Transaminase (IU/L)'
}

document.addEventListener('DOMContentLoaded', function () {
    updateChart(features[0]);

    d3.selectAll(".option").on("click", function() {
        const selectedPreop = d3.select(this).attr("data-value");
        updateChart(selectedPreop);
    });

});

// Load and process CSV data
async function fetchData() {
    const data = await d3.csv('datasets\\test_vital.csv');
    return data.map(row => ({
        preop_hb: +row.preop_hb,
        preop_plt: +row.preop_plt,
        preop_pt: +row.preop_pt,
        preop_na: +row.preop_na,
        preop_k: +row.preop_k,
        preop_gluc: +row.preop_gluc,
        preop_alb: +row.preop_alb,
        preop_alt: +row.preop_alt,
        icu_days: +row.icu_days
    }))
    .filter(d => d.preop_alt < 200)
    .filter(d => d.preop_hb > 1)
    .filter(d => d.preop_na > 5)
    .filter(d => d.preop_k > 1)
    .filter(d => d.preop_alb > 0.3)
    .filter(d => {
        // Check if ALL features (except icu_days) are 0
        return !(
            d.preop_hb === 0 &&
            d.preop_plt === 0 &&
            d.preop_pt === 0 &&
            d.preop_na === 0 &&
            d.preop_k === 0 &&
            d.preop_gluc === 0 &&
            d.preop_alb === 0 &&
            d.preop_alt === 0
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

    d3.select("#chart").selectAll("svg").remove();
    
    const xScale = d3.scaleLinear()
        .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);

    const svg = d3.select("#chart")
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

    console.log(bins);

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
        .text(`Mean Histogram of ${feature_full[feature]}`);

    // const dots = svg.selectAll(".dots").data(bins)

    // dots.enter()
    //     .append('circle')
    //     .attr("class", "dots")
    //     .attr('cx', (d) => xScale(d.x0))
    //     .attr('cy', (d) => yScale(d.meanIcuDays))
    //     .attr('r', 1.5)
    //     .attr("fill", "red")
    
    // dots.exit()
    //     .transition().duration(800)
    //     .attr("cy", height - margin.bottom)
    //     .remove();

    // const line = d3.line()
    //     .x(d => xScale(d.x0))
    //     .y(d => yScale(d.meanIcuDays));
    
    // svg.selectAll(".line")
    //     .data(bins)
    //     .enter()
    //     .append('path')
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-width", 1.5)
    //     .attr("d", line(bins))

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
        .attr("fill", "steelblue")
        .attr("opacity", 0.2)
        .attr("d", area)
        .attr("stroke-dasharray", function() { return this.getTotalLength(); })
        .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
        .transition().duration(1000)
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
        .attr("fill", "steelblue")
        .transition().duration(1000) // Smooth transition
        .attr('cy', (d) => yScale(d.meanIcuDays));

    // Update phase: Animate position change
    dots.transition().duration(1000)
        .attr('cx', (d) => xScale(d.x0))
        .attr('cy', (d) => yScale(d.meanIcuDays));

    // Exit phase: Remove old dots with fade-out
    dots.exit()
        .transition().duration(800)
        .attr("cy", height - margin.bottom)
        .attr("opacity", 0)
        .remove();

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
        .attr("stroke", "steelblue")
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

    const hoverLine = svg.append("line")
        .attr("class", "hover-line")
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "5,5") // Dashed pattern
        .attr("stroke-width", 1.5)
        .style("visibility", "hidden"); // Initially hidden

    const tooltip = d3.select("#chart")
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



    svg.selectAll(".dot")
        .data(bins)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.x0))
        .attr("cy", d => yScale(d.meanIcuDays))
        .attr("r", 3)
        .attr("fill", "blue")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`
                    <strong>Value: ${d3.format(".2f")(d.x0)}</strong><br/>
                    Mean ICU Days: ${d3.format(".2f")(d.meanIcuDays)}<br/>
                    MOE Upper: ${d3.format(".2f")(d.moeUpper)}<br/>
                    MOE Lower: ${d3.format(".2f")(d.moeLower)}<br/>
                    Count: ${d.count}
                `);
            d3.select(this).attr("r", 7).attr("fill", "orange");
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 40) + "px")
                   .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
            d3.select(this).attr("r", 3).attr("fill", "blue");
        });
    
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
    const chartWidth = width; // Use the SVG chart width
    const rightSide = mouseX < chartWidth / 2; // Decide position based on mouse location

    let legendX = rightSide ? width - 160 : 50; // Position inside chart
    let legendY = 35; // Always at the top

    legend.style("display", "block")
        .html(`
            <strong>Legend</strong><br/>
            Value: ${d3.format(".2f")(bin.x0)}<br/>
            Mean ICU Days: ${d3.format(".2f")(bin.meanIcuDays)}<br/>
            MOE Upper: ${d3.format(".2f")(bin.moeUpper)}<br/>
            MOE Lower: ${d3.format(".2f")(bin.moeLower)}<br/>
            Count: ${bin.count}
        `);

    // Move the legend inside the SVG
    legend.node().parentNode.setAttribute("x", legendX);
    legend.node().parentNode.setAttribute("y", legendY);
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
        legend.style("display", "none");
    });

    //Changes the caption for the particular feature
    const caption = d3.select('#bar_caption');
    
    caption.select('p').remove();
    caption.append('p').text(feature_caps[feature]);
}

export function createVis(){
    updateChart(features[0]);
    updateLegend();

    d3.selectAll(".option").on("click", function() {
        const selectedPreop = d3.select(this).attr("data-value");
        updateChart(selectedPreop);
    });
}