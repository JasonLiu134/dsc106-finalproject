let data = [];
const scaleFactor = 0.8;
// const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([-1, 1]);
function colorScale(c) {
  if (c < 0) {
    return d3.scaleSequential(d3.interpolateOranges).domain([0, 1])(-c)
  } else {
    return d3.scaleSequential(d3.interpolateBlues).domain([0, 1.25])(c)
  }
}

document.addEventListener('DOMContentLoaded', function () {
    createInitialRectangle();
    const tooltip = document.getElementById('corr-tooltip');
    tooltip.hidden = true;
  });

async function fetchCorrData(filepath) {
  const load = await d3.csv(filepath);
  return load
}

function createInitialRectangle() {
  const svg = d3
    .select('#corrmatrix')
    .append('svg')
    .attr('viewBox', `-40, -20, 100, 100`)
    .attr('width', 250)
    .attr('height', 250)
    .style('overflow', 'visible');

  svg.append("rect")
    .attr("x", '0')
    .attr("y", '0')
    .attr("height", "88")
    .attr("width", "88")
    .attr("fill", colorScale(-0.4))
    .attr("stroke", "black");
  
  svg.append("text")
    .attr("x", '18')
    .attr("y", '55')
    .attr("font-size", "2em")
    .text(`-0.4`)

  svg.append("rect")
    .attr("x", '88')
    .attr("y", '0')
    .attr("height", "88")
    .attr("width", "88")
    .attr("fill", colorScale(-0.15))
    .attr("stroke", "black");
  
  svg.append("text")
    .attr("x", '98')
    .attr("y", '55')
    .attr("font-size", "2em")
    .text(`-0.15`)

  svg.append("rect")
    .attr("x", '0')
    .attr("y", '88')
    .attr("height", "88")
    .attr("width", "88")
    .attr("fill", colorScale(0.15))
    .attr("stroke", "black");

  svg.append("text")
    .attr("x", '18')
    .attr("y", '143')
    .attr("font-size", "2em")
    .text(`0.15`)

  svg.append("rect")
    .attr("x", '88')
    .attr("y", '88')
    .attr("height", "88")
    .attr("width", "88")
    .attr("fill", colorScale(0.4))
    .attr("stroke", "black");

  svg.append("text")
    .attr("x", '110')
    .attr("y", '143')
    .attr("font-size", "2em")
    .text(`0.4`)

  svg.append("text")
    .attr("x", '44')
    .attr("y", '-10')
    .attr("font-size", "1.5em")
    .attr("font-style", "italic")
    .text(`Example`)
}

async function createBasicCorr() {
  data = await fetchCorrData('datasets\\basic.csv');
  const correlationLabels = Object.keys(data[0]).filter(key => key !== "");
  const nameLabels = ['ICU Days', 'Age', 'Sex', 'Height', 'Weight', 'BMI', 'Emergency Operation', 'Operation Type', 'Diagnosis', 
    'Anesthesia Type', 'Mortality'];

  const cellSize = 20;
  const allData = d3.merge(
    data.map((row, rowIndex) =>
      correlationLabels.map((col, colIndex) => ({
        rowIndex: rowIndex,
        colIndex: colIndex,
        col: col,   
        value: (Math.round(parseFloat(row[col]) * 10000) / 10000).toFixed(2)
      }))
    )
  );

  const svg = d3
      .select('#corrmatrix')
      .append('svg')
      .attr('viewBox', `-40, -20, 100, 100`)
      .attr('width', 250)
      .attr('height', 250)
      .style('overflow', 'visible');

  allData.forEach(function(cell) {
      svg.append("rect")
      .attr("x", `${cellSize * cell.colIndex * scaleFactor}`)
      .attr("y", `${cellSize * cell.rowIndex * scaleFactor}`)
      .attr("height", cellSize * scaleFactor)
      .attr("width", `${cellSize * scaleFactor}`)
      .attr("fill", colorScale(cell.value))
      .attr("stroke", "black")
      .on('mouseenter', function (event, d, i) {
        d3.select(event.currentTarget).style('fill', 'white');
        updateTooltip(nameLabels[cell.rowIndex], nameLabels[cell.colIndex], cell.value);
    })
    .on('mouseleave', function () {
        d3.select(event.currentTarget).style('fill', colorScale(cell.value));
        hideTooltip();
    });

      svg.append("text")
      .attr("x", `${cellSize * cell.colIndex * scaleFactor + 2.4}`)
      .attr("y", `${cellSize * cell.rowIndex * scaleFactor + 9}`)
      .attr("font-size", "0.35em")
      .attr("pointer-events", "none")
      .text(`${cell.value}`);
  });

  correlationLabels.forEach(function(label) {
    svg.append("text")
      .attr("x", `${-8 - nameLabels[correlationLabels.indexOf(label)].length * 3.4}`)
      .attr("y", `${-6 - correlationLabels.indexOf(label) * scaleFactor * cellSize}`)
      .attr("font-size", "0.5em")
      .text(`${nameLabels[correlationLabels.indexOf(label)]}`)
      .attr("transform", "rotate(90)")
      .attr("pointer-events", "none")
      .attr("class", "corrlabel");
  });

  correlationLabels.forEach(function(label) {
    svg.append("text")
      .attr("x", `${-6 - nameLabels[correlationLabels.indexOf(label)].length * 3.4}`)
      .attr("y", `${9 + correlationLabels.indexOf(label) * scaleFactor * cellSize}`)
      .attr("font-size", "0.5em")
      .text(`${nameLabels[correlationLabels.indexOf(label)]}`)
      .attr("pointer-events", "none")
      .attr("class", "corrlabel");
  });
}

async function createPreopCorr() {
  data = await fetchCorrData('datasets\\preop.csv');
  const correlationLabels = Object.keys(data[0]).filter(key => key !== "");
  const nameLabels = ['ICU Days', 'Hypertension', 'Diabetes', 'ECG', 'Pulmonary Function', 'Hemoglobin', 'Platelet Count',
    'Physical Therapy', 'aPTT', 'Sodium', 'Potassium', 'Glucose', 'Albumin', 'Aspartate Aminotransferase', 'Alanine Aminotransferase',
    'Blood Urea Nitrogen', 'Creatinine', 'pH', 'Bicarbonate', 'Base Excess', 'Partial Oxygen Pressure', 'Partial CO2 Pressure', 'Peripheral Oxygen Saturation'];

  const cellSize = 14;
  const allData = d3.merge(
    data.map((row, rowIndex) =>
      correlationLabels.map((col, colIndex) => ({
        rowIndex: rowIndex,
        colIndex: colIndex,
        col: col,   
        value: (Math.round(parseFloat(row[col]) * 10000) / 10000).toFixed(2)
      }))
    )
  );

  const svg = d3
      .select('#corrmatrix')
      .append('svg')
      .attr('viewBox', `0, 0, 100, 100`)
      .attr('width', 250)
      .attr('height', 250)
      .style('overflow', 'visible');

  allData.forEach(function(cell) {
      svg.append("rect")
      .attr("x", `${cellSize * cell.colIndex * scaleFactor}`)
      .attr("y", `${cellSize * cell.rowIndex * scaleFactor}`)
      .attr("height", cellSize * scaleFactor)
      .attr("width", `${cellSize * scaleFactor}`)
      .attr("fill", colorScale(cell.value))
      .attr("stroke", "black")
      .on('mouseenter', function (event, d, i) {
        d3.select(event.currentTarget).style('fill', 'white');
        updateTooltip(nameLabels[cell.rowIndex], nameLabels[cell.colIndex], cell.value);
      })
      .on('mouseleave', function () {
          d3.select(event.currentTarget).style('fill', colorScale(cell.value));
          hideTooltip();
      });

      svg.append("text")
      .attr("x", `${cellSize * cell.colIndex * scaleFactor + 1.8}`)
      .attr("y", `${cellSize * cell.rowIndex * scaleFactor + 6}`)
      .attr("font-size", "0.25em")
      .attr("pointer-events", "none")
      .text(`${cell.value}`);
  });

  correlationLabels.forEach(function(label) {
    svg.append("text")
      .attr("x", `${-7 - nameLabels[correlationLabels.indexOf(label)].length * 1.85}`)
      .attr("y", `${-5 - correlationLabels.indexOf(label) * scaleFactor * cellSize}`)
      .attr("font-size", "0.3em")
      .text(`${nameLabels[correlationLabels.indexOf(label)]}`)
      .attr("transform", "rotate(90)")
      .attr("pointer-events", "none")
      .attr("class", "corrlabel");
  });

  correlationLabels.forEach(function(label) {
    svg.append("text")
      .attr("x", `${-7 - nameLabels[correlationLabels.indexOf(label)].length * 2.6}`)
      .attr("y", `${7.5 + correlationLabels.indexOf(label) * scaleFactor * cellSize}`)
      .attr("font-size", "0.4em")
      .text(`${nameLabels[correlationLabels.indexOf(label)]}`)
      .attr("pointer-events", "none")
      .attr("class", "corrlabel");
  });
}

function updateTooltip(xIndex, yIndex, val) {
  const tooltip = document.getElementById('corr-tooltip');
  tooltip.hidden = false;
  tooltip.style.left = `${event.clientX}px`;
  if (event.clientY <= 650) {
    tooltip.style.top = `${event.clientY}px`;
  } else {
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY - 100}px`;
  }

  const corrs = document.getElementById('corrs');
  const value = document.getElementById('corr-value');
  
  corrs.textContent = `${xIndex} vs ${yIndex}`;
  value.textContent = val;
}

function hideTooltip() {
  const tooltip = document.getElementById('corr-tooltip');
  tooltip.style.top = 0;
  tooltip.style.left = 0;
  tooltip.hidden = true;
}

function createFinalList() {
  const fin = d3.select('#corrmatrix')

  fin.append('h3').text("Important Correlations with ICU Days");
  fin.append('div')
    .attr("class", "corrlist")
    .append('h4').text("Age: -0.01").attr("class", "corrtext")
    .append('h4').text("Weight: -0.10").attr("class", "corrtext")
    .append('h4').text("Height: -0.12").attr("class", "corrtext")
    .append('h4').text("Hemoglobin: -0.17").attr("class", "corrtext")
    .append('h4').text("Aspartate Aminotransferase: 0.17").attr("class", "corrtext")
    .append('h4').text("Sodium: -0.18").attr("class", "corrtext")
    .append('h4').text("aPTT: 0.18").attr("class", "corrtext")
    .append('h4').text("Albumin: -0.26").attr("class", "corrtext")
    .append('h4').text("Physical Therapy: -0.27").attr("class", "corrtext")
    .append('h4').text("Alanine Animotransferase: 0.27").attr("class", "corrtext");
}

export function changeCorrDisplay(pageNum) {
  let opacityChange = 100;
  let removal = d3.selectAll("svg");
  let removal2 = d3.select('.corrlist');
  let removal3 = d3.select('h3');
  hideTooltip();
  if (pageNum === 1) {
    const fade = setInterval(() => {
      if (opacityChange <= 0) {
          removal.remove();
          createInitialRectangle();
          clearInterval(fade);
      } else {
        opacityChange = opacityChange - 1.2;
        removal.style('opacity', `${opacityChange}%`);
      }
    }, 1); 
  }

  if (pageNum === 2) {
    const fade = setInterval(() => {
      if (opacityChange <= 0) {
          removal.remove();
          createBasicCorr();
          clearInterval(fade);
      } else {
        opacityChange = opacityChange - 1.2;
        removal.style('opacity', `${opacityChange}%`);
      }
    }, 1); 
  }

  if (pageNum === 3) {
    const fade = setInterval(() => {
      if (opacityChange <= 0) {
          removal3.remove();
          removal2.remove();
          removal.remove();
          createPreopCorr();
          clearInterval(fade);
      } else {
        opacityChange = opacityChange - 1.2;
        removal.style('opacity', `${opacityChange}%`);
        removal2.style('opacity', `${opacityChange}%`);
        removal3.style('opacity', `${opacityChange}%`);
      }
    }, 1); 
  }

  if (pageNum === 4) {
    const fade = setInterval(() => {
      if (opacityChange <= 0) {
          removal3.remove();
          removal2.remove();
          removal.remove();
          createFinalList();
          clearInterval(fade);
      } else {
        opacityChange = opacityChange - 1.2;
        removal.style('opacity', `${opacityChange}%`);
      }
    }, 1); 
  }
}