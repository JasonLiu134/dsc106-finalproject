document.addEventListener('DOMContentLoaded', function () {
    createFinalVis();
});

const colorScale = d3.scaleLinear().domain([0, 14]).range(["#0085ff", "#ff7b00"]).interpolate(d3.interpolateLab);

export function createFinalVis() {
    d3.select('#fin').selectAll("svg").remove();
    const width = 500, height = 50, radius = 200;
    const tickCount = 7;

    const svg = d3.select('#fin')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    const arc = d3.arc()
        .innerRadius(radius - 30) 
        .outerRadius(radius)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);

    svg.append("path")
        .attr("d", arc)
        .attr("fill", "white")
        .attr("transform", `translate(${width / 2 + 75}, ${height - 75})`)
        .attr("stroke", "black") 
        .attr("stroke-width", 3);

    const icuDaysArc = svg.append("path")
        .attr("transform", `translate(${width / 2 + 75}, ${height - 75})`);

    const label = svg.append("text")
        .attr("class", "label-text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("4.7");

    const ticks = svg.append("g").attr("transform", `translate(${width / 2 + 75}, ${height - 75})`);

    for (let i = 0; i <= tickCount; i++) {
        const value = i * 2;
        const angle = -Math.PI / 2 + (i / tickCount) * Math.PI;
        const tickStart = radius;
        const tickEnd = radius + 15;
        const x1 = tickStart * Math.cos(angle);
        const y1 = tickStart * Math.sin(angle);
        const x2 = tickEnd * Math.cos(angle);
        const y2 = tickEnd * Math.sin(angle);

        ticks.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        const text = ticks.append("text")
            .attr("class", "tick-text")
            .attr("x", (radius + 25) * Math.cos(angle))
            .attr("y", (radius + 25) * Math.sin(angle))
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("dy", "0.5em")
            .text(value);
        
        text.attr("transform", `rotate(90 ${(radius + 25) * Math.cos(angle)} ${(radius + 25) * Math.sin(angle)})`)
    }

    ticks.attr("transform", `translate(${width / 2 + 75}, ${height - 75}) rotate(-90)`);

    let sodium = parseFloat(document.getElementById("sodium").value);
    let alb = parseFloat(document.getElementById("alb").value);
    let aptt = parseFloat(document.getElementById("aptt").value);
    let alt = parseFloat(document.getElementById("alt").value);

    document.getElementById("sodiumVal").innerText = sodium;
    document.getElementById("altVal").innerText = alt;
    document.getElementById("apttVal").innerText = aptt;
    document.getElementById("albVal").innerText = alb;

    let icu_days = (0.029044775719852478 * aptt) + (-0.9991864296384556 * alb) + 
    (0.008351254739927469 * alt) + (-0.08939127425750719 * sodium) + 15.881580890725147;

    icu_days = Math.max(0, Math.min(14, icu_days.toFixed(1)));
    updateDisplay(icuDaysArc, label, radius, icu_days);
}

// Function to update the display based on the icu_days value
export function updateDisplay(icuDaysArc, label, radius, icu_days) {
    const newAngle = (-Math.PI / 2) + (icu_days / 14) * Math.PI;
    const arcUpdate = d3.arc()
        .innerRadius(radius - 22)
        .outerRadius(radius - 8)
        .startAngle(-Math.PI / 2)
        .endAngle(newAngle);
    
    icuDaysArc.attr("fill", colorScale(icu_days));

    icuDaysArc.transition()
        .duration(500)
        .attrTween("d", function() {
            const interpolate = d3.interpolateNumber(-Math.PI / 2, newAngle);
            return function(t) {
                const angle = interpolate(t);
                return arcUpdate.endAngle(angle)();
            };
        });

    label.transition()
        .duration(500)
        .text(`${icu_days}`)
}

document.getElementById("sodium").addEventListener("input", createFinalVis);
document.getElementById("alb").addEventListener("input", createFinalVis);
document.getElementById("aptt").addEventListener("input", createFinalVis);
document.getElementById("alt")?.addEventListener("input", createFinalVis);