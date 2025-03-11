document.addEventListener('DOMContentLoaded', function () {
    createFinalVis();
  });

export function createFinalVis() {
d3.select('#fin').selectAll("svg").remove();
const svg = d3
    .select('#fin')
    .append('svg')
    .attr('width', 200)
    .attr('height', 100)
    .attr('viewBox', `65 0 200 100`)
    .style('overflow', 'visible');

// Create the maximum container
svg.append("rect")
    .attr("x", 50)
    .attr("y", 30)
    .attr("height", 40)
    .attr("width", 314)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("class", "container");

// Create the rectangle
const widthScale = d3.scaleLinear().domain([0, 14]).range([0, 400]);
    svg.append("rect")
        .attr("x", 50)
        .attr("y", 30)
        .attr("height", 40)
        .attr("width", widthScale(14))
        .attr("fill", "black")
        .attr("class", "fillbox");

    // Create text
    const label = svg.append("text")
        .attr("x", 50 + widthScale(14) + 10)
        .attr("y", 80)
        .attr("dy", ".35em")
        .text("14 days");

    document.getElementById("sodium").addEventListener("input", updateDisplay);
    document.getElementById("hemoglobin").addEventListener("input", updateDisplay);
    document.getElementById("platelets").addEventListener("input", updateDisplay);
    document.getElementById("aptt").addEventListener("input", updateDisplay);
    document.getElementById("ast").addEventListener("input", updateDisplay);

    function updateDisplay() {
        let sodium = parseFloat(document.getElementById("sodium").value);
        let hemoglobin = parseFloat(document.getElementById("hemoglobin").value);
        let platelets = parseFloat(document.getElementById("platelets").value);
        let aptt = parseFloat(document.getElementById("aptt").value);
        let ast = parseFloat(document.getElementById("ast").value);

        // Example regression line equation (will replace with actual model coefficients)
        let icu_days = (0.029775145236927203 * aptt) + (-0.13463185618371287 * sodium) + 
            (-0.20034793436033685 * hemoglobin) + (-0.004446836926403632 * platelets) + 
            (0.003035309694611115 * ast) + 21.920014027366662;
        icu_days = Math.max(0, Math.min(14, icu_days.toFixed(1)));

        document.getElementById("sodiumVal").innerText = sodium;
        document.getElementById("hbVal").innerText = hemoglobin;
        document.getElementById("pltVal").innerText = platelets;
        document.getElementById("apttVal").innerText = aptt;
        document.getElementById("astVal").innerText = ast;
        document.getElementById("icuPred").innerText = icu_days;

        // Update bar width
        svg.select(".fillbox")
        .transition()
        .duration(500)
        .attr("width", widthScale(icu_days));

        // Update text position and value
        label.transition()
        .duration(500)
        .attr("x", widthScale(icu_days) + 10)
        .text(`${icu_days} days`);
    }
}