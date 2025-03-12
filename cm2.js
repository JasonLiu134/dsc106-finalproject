let data1 = [];
let data2 = [];
const scaleFactor = 0.8;
const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([-1, 1]);

async function fetchCorrData(filepath) {
    const load = await d3.csv(filepath);
    return load
}

async function createPart1() {
    const nameLabels = ['Age', 'Sex', 'Height', 'Weight', 'BMI', 'Emergen. Op.', 'Operation', 'Diagnosis', 
    'Anesthesia', 'Mortality', 'Hypertension', 'Diabetes', 'ECG', 'Pulm. Function', 'Hemoglobin', 'Platelet Count',
    'Phys. Therapy', '    aPTT', 'Sodium', 'Potassium', 'Glucose', 'Albumin', 'Aspartate Amino.', 'Alanine Amino.',
    'BUN', 'Creatinine', '       pH', 'Bicarbonate', 'Base Excess', 'Partial O2 Pressure', 'Partial CO2 Pressure', 'O2 Saturation'];

    data1 = await fetchCorrData('datasets\\basic.csv');
    data2 = await fetchCorrData('datasets\\preop.csv');

    const basic = data1.find(obj => obj[""] === "icu_days");
    const preops = data2.find(obj => obj[""] === "icu_days");

    const total = Object.assign({}, basic, preops);
    delete total.icu_days;

    const svg = d3
    .select('#displaythings')
    .append('svg')
    .attr('viewBox', `-40, -20, 100, 100`)
    .attr('width', 250)
    .attr('height', 250)
    .style('overflow', 'visible');

    Object.entries(total).forEach(([key, value]) => {
        if (key != "") {
            const idx = Object.keys(total).indexOf(key) - 1;
            svg.append("rect")
                .attr("x", `${(Math.floor(idx / 4)) * 30}`)
                .attr("y", `${(idx % 4) * 50}`)
                .attr("height", "25")
                .attr("width", "25")
                .attr("fill", colorScale(value))
                .attr("stroke", "black");

                svg.append("text")
                .attr("x", `${(Math.floor(idx / 4)) * 30}`)
                .attr("y", `${(idx % 4) * 50 - 5}`)
                .attr("font-size", "0.3em")
                .attr("class", "filxtext")
                .text(nameLabels[idx]);

            svg.append("text")
                .attr("x", `${(Math.floor(idx / 4)) * 30 + 5}`)
                .attr("y", `${(idx % 4) * 50 + 15}`)
                .attr("font-size", "0.5em")
                .text((Math.round(parseFloat(value) * 10000) / 10000).toFixed(2))
        }
    });
}

async function createPart2() {
    const nameLabels = ['Aspartate Aminotransferase', 'Physical Therapy', '    Albumin', '  Hemoglobin',  '      aPTT', '    Sodium', '   Alanine Aminotransferase'];

    data1 = await fetchCorrData('datasets\\basic.csv');
    data2 = await fetchCorrData('datasets\\preop.csv');

    const basic = data1.find(obj => obj[""] === "icu_days");
    const preops = data2.find(obj => obj[""] === "icu_days");

    const total = Object.assign({}, basic, preops);
    const filtotal = Object.keys(total)
  .filter(key => ['preop_alt', 'preop_pt', 'preop_alb', 'preop_hb', 'preop_aptt', 'preop_na', 'preop_ast'].includes(key))
  .reduce((obj, key) => {
    obj[key] = total[key];
    return obj;
  }, {});

    const svg = d3
    .select('#displaythings')
    .append('svg')
    .attr('viewBox', `-40, -20, 100, 100`)
    .attr('width', 250)
    .attr('height', 250)
    .style('overflow', 'visible');

    Object.entries(filtotal).forEach(([key, value]) => {
        if (key != "") {
            const idx = Object.keys(filtotal).indexOf(key);
            svg.append("rect")
                .attr("x", `${idx * 60 - Math.floor(idx / 4) * 200}`)
                .attr("y", `${Math.floor(idx / 4) * 50 + 50}`)
                .attr("height", "25")
                .attr("width", "25")
                .attr("fill", colorScale(value))
                .attr("stroke", "black");

            svg.append("text")
                .attr("x", `${idx * 60 - 5 - Math.floor(idx / 4) * 200}`)
                .attr("y", `${Math.floor(idx / 4) * 50 + 45}`)
                .attr("font-size", "0.3em")
                .attr("class", "filxtext")
                .text(nameLabels[idx]);

            svg.append("text")
                .attr("x", `${idx * 60 + 5 - Math.floor(idx / 4) * 200}`)
                .attr("y", `${Math.floor(idx / 4) * 50 + 65}`)
                .attr("font-size", "0.5em")
                .text((Math.round(parseFloat(value) * 10000) / 10000).toFixed(2))
        }
    });
}

async function createPart3() {
    const nameLabels = ['Aspartate Aminotransferase', 'Physical Therapy', '    Albumin', '  Hemoglobin',  '      aPTT', '    Sodium', '   Alanine Aminotransferase'];

    data1 = await fetchCorrData('datasets\\basic.csv');
    data2 = await fetchCorrData('datasets\\preop.csv');

    const basic = data1.find(obj => obj[""] === "icu_days");
    const preops = data2.find(obj => obj[""] === "icu_days");

    const total = Object.assign({}, basic, preops);
    const filtotal = Object.keys(total)
  .filter(key => ['preop_alt', 'preop_pt', 'preop_alb', 'preop_hb', 'preop_aptt', 'preop_na', 'preop_ast'].includes(key))
  .reduce((obj, key) => {
    obj[key] = total[key];
    return obj;
  }, {});

    const svg = d3
    .select('#displaythings')
    .append('svg')
    .attr('viewBox', `-40, -20, 100, 100`)
    .attr('width', 250)
    .attr('height', 250)
    .style('overflow', 'visible');

    Object.entries(filtotal).forEach(([key, value]) => {
        if (key != "") {
            const idx = Object.keys(filtotal).indexOf(key);
            let cola = colorScale(value);
            const aknum = (Math.round(parseFloat(value) * 10000) / 10000).toFixed(2);
            if (aknum === '-0.17' || aknum === '0.27' || aknum === '0.18'|| aknum === '-0.18') {
                cola = "#FFFFFF";
            }
            svg.append("rect")
                .attr("x", `${idx * 60 - Math.floor(idx / 4) * 200}`)
                .attr("y", `${Math.floor(idx / 4) * 50 + 50}`)
                .attr("height", "25")
                .attr("width", "25")
                .attr("fill", cola)
                .attr("stroke", "black");

            svg.append("text")
                .attr("x", `${idx * 60 - 5 - Math.floor(idx / 4) * 200}`)
                .attr("y", `${Math.floor(idx / 4) * 50 + 45}`)
                .attr("font-size", "0.3em")
                .attr("class", "filxtext")
                .text(nameLabels[idx]);

            svg.append("text")
                .attr("x", `${idx * 60 + 5 - Math.floor(idx / 4) * 200}`)
                .attr("y", `${Math.floor(idx / 4) * 50 + 65}`)
                .attr("font-size", "0.5em")
                .text((Math.round(parseFloat(value) * 10000) / 10000).toFixed(2))
        }
    });
}

async function createPart4() {
    const svg = d3
    .select('#displaythings')
    .append('svg')
    .attr('viewBox', `-40, -20, 100, 100`)
    .attr('width', 250)
    .attr('height', 250)
    .style('overflow', 'visible');

    svg.append("rect")
    .attr("x", `50`)
    .attr("y", `50`)
    .attr("height", "25")
    .attr("width", "25")
    .attr("fill", colorScale(0.60))
    .attr("stroke", "black");

    svg.append("text")
        .attr("x", `52`)
        .attr("y", `46`)
        .attr("font-size", "0.3em")
        .attr("class", "filxtext")
        .text('Hemoglobin');

    svg.append("text")
        .attr("x", `-70`)
        .attr("y", `46`)
        .attr("font-size", "0.3em")
        .attr("class", "filxtext")
        .attr("transform", "rotate(270)")
        .text('Albumin');

    svg.append("text")
        .attr("x", `55`)
        .attr("y", `65`)
        .attr("font-size", "0.5em")
        .text('0.60')

    svg.append("rect")
        .attr("x", `50`)
        .attr("y", `100`)
        .attr("height", "25")
        .attr("width", "25")
        .attr("fill", colorScale(0.83))
        .attr("stroke", "black");
    
    svg.append("text")
            .attr("x", `52`)
            .attr("y", `96`)
            .attr("font-size", "0.3em")
            .attr("class", "filxtext")
            .text('Aspartate Aminotransferase');

    svg.append("text")
            .attr("x", `-135`)
            .attr("y", `46`)
            .attr("font-size", "0.3em")
            .attr("class", "filxtext")
            .attr("transform", "rotate(270)")
            .text('Alanine Aminotransferase');
    
    svg.append("text")
            .attr("x", `55`)
            .attr("y", `115`)
            .attr("font-size", "0.5em")
            .text('0.83')
}

async function createPart5() {
    const svg = d3
    .select('#displaythings')
    .append('svg')
    .attr('viewBox', `-40, -20, 100, 100`)
    .attr('width', 250)
    .attr('height', 250)
    .style('overflow', 'visible');

    svg.append("rect")
    .attr("x", `30`)
    .attr("y", `50`)
    .attr("height", "25")
    .attr("width", "25")
    .attr("fill", colorScale(-0.01))
    .attr("stroke", "black");

    svg.append("text")
        .attr("x", `32`)
        .attr("y", `46`)
        .attr("font-size", "0.3em")
        .attr("class", "filxtext")
        .text('Age');

    svg.append("text")
        .attr("x", `35`)
        .attr("y", `65`)
        .attr("font-size", "0.5em")
        .text('-0.01')

    svg.append("rect")
    .attr("x", `80`)
    .attr("y", `50`)
    .attr("height", "25")
    .attr("width", "25")
    .attr("fill", colorScale(-0.12))
    .attr("stroke", "black");

    svg.append("text")
        .attr("x", `82`)
        .attr("y", `46`)
        .attr("font-size", "0.3em")
        .attr("class", "filxtext")
        .text('Height');

    svg.append("text")
        .attr("x", `85`)
        .attr("y", `65`)
        .attr("font-size", "0.5em")
        .text('-0.12')

    svg.append("rect")
    .attr("x", `130`)
    .attr("y", `50`)
    .attr("height", "25")
    .attr("width", "25")
    .attr("fill", colorScale(-0.1))
    .attr("stroke", "black");

    svg.append("text")
        .attr("x", `132`)
        .attr("y", `46`)
        .attr("font-size", "0.3em")
        .attr("class", "filxtext")
        .text('Weight');

    svg.append("text")
        .attr("x", `135`)
        .attr("y", `65`)
        .attr("font-size", "0.5em")
        .text('-0.10')
}

export function changeCorrDisplay2(pageNum) {
    let opacityChange = 100;
    let removal = d3.selectAll("svg");
    if (pageNum === 1) {
      const fade = setInterval(() => {
        if (opacityChange <= 0) {
            removal.remove();
            createPart1();
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
            createPart2();
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
            removal.remove();
            createPart3();
            clearInterval(fade);
        } else {
          opacityChange = opacityChange - 1.2;
          removal.style('opacity', `${opacityChange}%`);
        }
      }, 1); 
    }
  
    if (pageNum === 4) {
      const fade = setInterval(() => {
        if (opacityChange <= 0) {
            removal.remove();
            createPart4();
            clearInterval(fade);
        } else {
          opacityChange = opacityChange - 1.2;
          removal.style('opacity', `${opacityChange}%`);
        }
      }, 1); 
    }

    if (pageNum === 5) {
        const fade = setInterval(() => {
          if (opacityChange <= 0) {
              removal.remove();
              createPart5();
              clearInterval(fade);
          } else {
            opacityChange = opacityChange - 1.2;
            removal.style('opacity', `${opacityChange}%`);
          }
        }, 1); 
      }
  }