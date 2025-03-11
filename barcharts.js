const features = [
    'preop_hb', 'preop_plt', 'preop_pt', 'preop_na',
    'preop_k', 'preop_gluc', 'preop_alb', 'preop_alt'
];

let feature_caps = {
    'preop_hb': "This histogram illustrates the distribution of preoperative hemoglobin levels and their potential correlation with ICU stay duration.",
    'preop_plt': "This histogram shows how preoperative platelet counts vary among patients and their possible impact on ICU stay duration.",
    'preop_pt': "This histogram displays the distribution of preoperative prothrombin times and their potential link to ICU recovery patterns.",
    'preop_na': "This histogram visualizes the distribution of preoperative sodium levels and their potential influence on ICU stay outcomes.",
    'preop_k': "This histogram highlights the range of preoperative potassium levels and explores their relationship with ICU duration.",
    'preop_gluc': "This histogram presents the distribution of preoperative blood glucose levels and their possible correlation with ICU stays.",
    'preop_alb': "This histogram illustrates the distribution of preoperative albumin levels and their potential effect on ICU recovery duration.",
    'preop_alt': "This histogram visualizes the distribution of preoperative ALT levels and investigates their possible connection to ICU stay patterns."
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
    // updateChart(features[0]);

    // d3.selectAll(".option").on("click", function() {
    //     const selectedPreop = d3.select(this).attr("data-value");
    //     updateChart(selectedPreop);
    // });
});

// Load and process CSV data
async function fetchData() {
    const data = await d3.csv('datasets\\vital.csv');
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
    d3.select("#chart").selectAll("svg").remove();
    const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);

    const margin = { top: 40, right: 30, bottom: 40, left: 50 };

    const x = d3.scaleLinear().range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    // Axes groups
    svg.selectAll("g").remove();

    const xAxis = svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`);
    const yAxis = svg.append("g").attr("transform", `translate(${margin.left},0)`);

    const bins = d3.bin()
        .domain(d3.extent(filteredData, d => d[feature]))
        .thresholds(100)
        (filteredData.map(d => d[feature]));

    x.domain([d3.min(bins, d => d.x0), d3.max(bins, d => d.x1)]);
    y.domain([0, d3.max(bins, d => d.length)]).nice();

    // Remove old axes and labels
    svg.selectAll(".x-axis, .y-axis, .x-label, .y-label, .chart-title").remove();

    // Append X-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    // Append X-axis label
    svg.append("text")
        .attr("class", "x-label")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text(`Distribution of ${feature.replace("preop_", "").toUpperCase()}`);

    // Append Y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Append Y-axis label
    svg.append("text")
        .attr("class", "y-label")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of ICU Days");

    // Append Chart Title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(`Histogram of ${feature.replace("preop_", "").toUpperCase()}`);

    // Bind data to bars
    const bars = svg.selectAll(".bar").data(bins);

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0))
        .attr("y", height - margin.bottom)
        .attr("height", 0)
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("fill", "steelblue")
        .merge(bars)
        .transition().duration(800)
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length));

    bars.exit()
        .transition().duration(800)
        .attr("y", height - margin.bottom)
        .attr("height", 0)
        .remove();

    const caption = d3.select('#bar_caption');
    caption.select('p').remove();

    caption.append('p').text(feature_caps[feature]);
}

export function createVis(){
    updateChart(features[0]);

    d3.selectAll(".option").on("click", function() {
        const selectedPreop = d3.select(this).attr("data-value");
        updateChart(selectedPreop);
    });
}