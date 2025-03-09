let data = []

// Set dimensions
const margin = { top: 50, right: 50, bottom: 50, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Select SVG and append group element
const svg = d3.select("svg")
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterPlot('preop_alt');
    setUpDropdown();
    brushSelector();
});

async function loadData() {
    data = await d3.csv("datasets\\vital.csv")
}

function setUpDropdown() {
    const dropdown = document.getElementById('preops');
    dropdown.addEventListener('change', (event) => {
        createScatterPlot(event.target.value);
    });
}

function createScatterPlot() {

    console.log("Creating Scatter Plot...");
    console.log(data);

    data.forEach(d => {
        d.preop_alt = +d.preop_alt;
        d.icu_days = +d.icu_days;
    });

    const xScale = d3.scaleLinear()
                    .domain([d3.min(data, d => d.preop_alt) - 5, d3.max(data, d => d.preop_alt) + 5])
                    .range([0, width]);

    const yScale = d3.scaleLinear()
                    .domain([d3.min(data, d => d.icu_days) - 10, d3.max(data, d => d.icu_days) + 10])
                    .range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

    svg.append("g")
    .call(yAxis);

    svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Preoperative ALT (IU/L)");

    svg.append("text")
    .attr("class", "axis-label")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("ICU Days (days)");

    svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.preop_alt))
    .attr("cy", d => yScale(d.icu_days))
    .attr("r", 5)
    .attr("fill", "steelblue")
    .attr("opacity", 0.7);
}

// Create scatter plot based on selected variable for x-axis
function createScatterPlot(xVar) {
    console.log("Creating Scatter Plot...");
    console.log(data);

    // Convert columns to numbers
    data.forEach(d => {
        d.preop_alt = +d.preop_alt;
        d.surgery_duration = +d.surgery_duration; // Assuming this column exists
        d.other_var = +d.other_var; // Add any other variables you'd like to switch between
        d.icu_days = +d.icu_days;
    });

    // Update scales based on selected x variable
    const xScale = d3.scaleLinear()
                    .domain([d3.min(data, d => d[xVar]) - 5, d3.max(data, d => d[xVar]) + 5])
                    .range([0, width]);

    const yScale = d3.scaleLinear()
                    .domain([d3.min(data, d => d.icu_days) - 10, 100]) // d3.max(data, d => d.icu_days) + 10
                    .range([height, 0]);

    // Clear previous plot elements (to avoid stacking when redrawing)
    svg.selectAll("*").remove();

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

    svg.append("g")
    .call(yAxis);

    // Add axis labels
    svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text(xVar === "preop_alt" ? "Preoperative ALT (IU/L)" : 
          xVar === "surgery_duration" ? "Surgery Duration (hours)" : 
          "Other Variable");

    svg.append("text")
    .attr("class", "axis-label")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("ICU Days (days)");

    // Add circles (dots) for the scatter plot
    svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d[xVar]))
    .attr("cy", d => yScale(d.icu_days))
    .attr("r", 5)
    .attr("fill", "steelblue")
    .attr("opacity", 0.7);
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }
  
function updateTooltipContent(commit) {
const link = document.getElementById('commit-link');
const date = document.getElementById('commit-date');

if (Object.keys(commit).length === 0) return;

link.href = commit.url;
link.textContent = commit.id;
date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
});
}

function updateTooltipPosition(event) {
const tooltip = document.getElementById('commit-tooltip');
tooltip.style.left = `${event.clientX}px`;
tooltip.style.top = `${event.clientY}px`;
}

function brushSelector() {
const svg = document.querySelector('svg');
// Create brush
d3.select(svg).call(d3.brush());

// Raise dots and everything after overlay
d3.select(svg).selectAll('.dots, .overlay ~ *').raise();

// Update brush initialization to listen for events
d3.select(svg).call(d3.brush().on('start brush end', brushed));
}

let brushSelection = null;

function brushed(event) {
brushSelection = event.selection;
updateSelection();
updateLanguageBreakdown();
}