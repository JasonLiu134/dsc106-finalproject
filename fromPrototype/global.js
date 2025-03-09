document.addEventListener('DOMContentLoaded', function () {
  createInitialCorr();
  createFinalVis();
});

function createInitialCorr() {
  const correlationMatrixData = [
    [-0.048, -0.045, 0.097, -0.004, -0.007, 0.006, -0.063, 0.098, 0.097, 0.006, -0.016, 0.005, 1.0],
    [0.017, -0.017, 0.171, 0.098, 0.131, 0.203, 0.095, 0.099, 0.004, -0.004, 0.702, 1, -0.016],
    [0.106, 0.034, 0.27, 0.199, 0.238, 0.299, 0.247, 0.198, 0.104, 0.12, 1, 0.702, 0.006],
    [-0.013, -0.071, -0.068, 0.14, 0.044, 0.034, 0.071, -0.022, 0.832, 1, 0.12, -0.004, 0.097],
    [-0.043, -0.06, -0.072, 0.151, 0.023, 0.023, 0.04, -0.039, 1, 0.832, 0.104, 0.004, 0.098],
    [0.805, 0.43, 0.693, 0.437, 0.628, 0.608, 0.384, 1, -0.039, -0.022, 0.198, 0.099, -0.063],
    [0.339, 0.186, 0.37, 0.298, 0.361, 0.358, 1, 0.394, 0.04, 0.071, 0.247, 0.095, 0.006],
    [0.52, 0.335, 0.545, 0.44, 0.95, 1, 0.358, 0.608, 0.023, 0.034, 0.299, 0.203, -0.007],
    [0.539, 0.326, 0.554, 0.441, 1, 0.95, 0.361, 0.628, 0.023, 0.044, 0.238, 0.131, -0.004],
    [0.4, 0.22, 0.449, 1, 0.441, 0.44, 0.298, 0.437, 0.151, 0.14, 0.199, 0.098, 0.097],
    [0.618, 0.406, 1, 0.449, 0.554, 0.545, 0.37, 0.693, -0.072, -0.068, 0.27, 0.171, -0.076],
    [0.422, 1, 0.406, 0.22, 0.326, 0.335, 0.186, 0.43, -0.06, -0.071, 0.034, -0.017, -0.045],
    [1.0, 0.422, 0.618, 0.4, 0.539, 0.52, 0.339, 0.085, -0.043, -0.013, 0.106, 0.017, -0.048]
  ];
  
  const correlationMatrixVars = ['Hemoglobin', 'Hypertension', 'ECG Findings', 'Pulmonary Function', 'Platelets', 
    'Prothombim', 'Partial Thromboplastin', 'Sodium', 'Pottasium', 'Glucose', 'Albumin', 'Aspartate', 'Alanine'];

  const cellSize = 15;
  const allData = d3.merge(correlationMatrixData.map((row, rowIndex) => row.map((value, colIndex) => ({ rowIndex, colIndex, value }))));

  const svg = d3
    .select('#corrmatrix')
    .append('svg')
    .attr('viewBox', `0 0 400 400`)
    .style('overflow', 'visible');

  const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([-1, 1]);
  allData.forEach(function(cell) {
    svg.append("rect")
      .attr("x", `${cellSize * cell.rowIndex * 1.2}`)
      .attr("y", `${cellSize * cell.colIndex}`)
      .attr("height", cellSize)
      .attr("width", `${cellSize * 1.2}`)
      .attr("fill", colorScale(cell.value))
      .attr("stroke", "black");

    svg.append("text")
      .attr("x", `${cellSize * cell.rowIndex * 1.2 + 4}`)
      .attr("y", `${cellSize * cell.colIndex + 8}`)
      .attr("font-size", "0.3em")
      .text(`${cell.value}`);
  });

}

function createFinalVis() {
  const svg = d3
    .select('#fin')
    .append('svg')
    .attr('viewBox', `0 0 800 400`)
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
    .attr("width", widthScale(3))
    .attr("fill", "black")
    .attr("class", "fillbox");

  // Create text
  const label = svg.append("text")
    .attr("x", 50 + widthScale(3) + 10)
    .attr("y", 80)
    .attr("dy", ".35em")
    .text("3 days");

  document.getElementById("glucose").addEventListener("input", updateDisplay);
  document.getElementById("albumin").addEventListener("input", updateDisplay);
  document.getElementById("alt").addEventListener("input", updateDisplay);

  function updateDisplay() {
    let glucose = parseFloat(document.getElementById("glucose").value);
    let alb = parseFloat(document.getElementById("albumin").value);
    let alt = parseFloat(document.getElementById("alt").value);
  
    // Example regression line equation (will replace with actual model coefficients)
    let icu_days = 0.02 * glucose - 1.5 * alb + 0.03 * alt + 5;
    icu_days = Math.max(0, Math.min(14, icu_days.toFixed(1)));
  
    document.getElementById("glucoseVal").innerText = glucose;
    document.getElementById("albuminVal").innerText = alb;
    document.getElementById("altVal").innerText = alt;
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