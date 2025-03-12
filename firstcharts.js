const features = [
    'age', 'height', 'weight'
];

let feature_full = {
    'age': 'Age of Patient (Years)',
    'height': 'Patient Height (cm)',
    'weight': 'Patient Weight (kg)',
}

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
    
    const svg = d3.select("#bchart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scaleLinear()
        .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);

    // Axes groups
    svg.selectAll("g").remove();

    const xAxis = svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`);
    const yAxis = svg.append("g").attr("transform", `translate(${margin.left},0)`);

    // Generate bins based on the feature value
    const binGenerator = d3.bin()
    .domain(d3.extent(filteredData, d => d[feature]))
    .thresholds(100);

    const bins = binGenerator(filteredData.map(d => d[feature]));

    // Calculate mean of icu_days per bin
    bins.forEach(bin => {
        console.log(filteredData.filter(d => d[feature] >= bin.x0 && d[feature] < bin.x1),
        d => d.icu_days);
        bin.meanIcuDays = d3.mean(
        filteredData.filter(d => d[feature] >= bin.x0 && d[feature] < bin.x1),
        d => d.icu_days
    ) || 0; // Default to 0 if no data in the bin
    });

    xScale.domain([d3.min(bins, d => d.x0), d3.max(bins, d => d.x1)]);
    yScale.domain([0, d3.max(bins, d => d.meanIcuDays)]).nice();

    // Remove old axes and labels
    svg.selectAll(".x-axis, .y-axis, .x-label, .y-label, .chart-title").remove();

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
        .text(`${feature_full[feature]}`);

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

    // Bind data to bars
    const bars = svg.selectAll(".bar").data(bins);

    bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.x0))
    .attr("y", height - margin.bottom) // Start from the bottom
    .attr("height", 0) // Start with no height
    .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
    .attr("fill", "steelblue")
    .merge(bars)
    .transition().duration(800)
    .attr("x", d => xScale(d.x0))
    .attr("y", d => yScale(d.meanIcuDays))
    .attr("height", d => Math.max(0, yScale(0) - yScale(d.meanIcuDays))); // Fix height calculation


    bars.exit()
        .transition().duration(800)
        .attr("y", height - margin.bottom)
        .attr("height", 0)
        .remove();
}

export function createBVis(featureNum){
    updateChart(features[featureNum - 1]);
}