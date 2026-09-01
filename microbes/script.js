
// plot configurations
const leftMargin = 50;
const rightMargin = 20;
const topMargin = 20;
const bottomMargin = 50;

const phaseCanvas = document.getElementById("phaseCanvas");
const phaseCtx = phaseCanvas.getContext("2d");
const timeCanvas = document.getElementById("timeCanvas");
const timeCtx = timeCanvas.getContext("2d");

const plots = {
    phase: {
        canvas: phaseCanvas,
        ctx: phaseCtx,
        xmax: 6,
        ymax: 6,
        leftMargin: leftMargin,
        rightMargin: rightMargin,
        topMargin: topMargin,
        bottomMargin: bottomMargin,
        plotWidth: phaseCanvas.width - leftMargin - rightMargin,
        plotHeight: phaseCanvas.height - topMargin - bottomMargin
    },
    time: {
        canvas: timeCanvas,
        ctx: timeCtx,
        xmax: 10,
        ymax: 6,
        leftMargin: leftMargin,
        rightMargin: rightMargin,
        topMargin: topMargin,
        bottomMargin: bottomMargin,
        plotWidth: timeCanvas.width - leftMargin - rightMargin,
        plotHeight: timeCanvas.height - topMargin - bottomMargin
    }
};

// initial parameters
let a = 5;
let b = 2;
let c = 0.5;
let d = 1;
let phi = 1;
let K = 10;
let a_f = 1;
let W_c = 1;
let K_b = 1;

// Model M functions
const mu = (M) => d + phi * c * M;
const beta = (M) => (a * M) / (b + M) - (1 - phi) * c * M;
const U = (M) =>  a_f * M + (W_c * M) / (K_b + M);
const U_prime = (M) =>  a_f + (W_c * K_b) / (K_b + M)**2;
const S = (C, M) =>  C * (beta(M) * (1 - C / K) - mu(M));

// Model M ODEs
const F = (C, M) => S(C, M);
const G = (C, M) => -U(M) * S(C, M) / (1 + C * U_prime(M));

// Cool spirals
//const F = (C, M) => M - 0.5*C;
//const G = (C, M) => Math.sin(C);

// vector field grid
const spacing = 0.3;
const nx = Math.round(plots.phase.xmax / spacing);
const ny = Math.round(plots.phase.ymax / spacing);
const dx = plots.phase.xmax / nx;
const dy = plots.phase.ymax / ny;
const x_vals = linspace(dx / 2, plots.phase.xmax - dx / 2, nx);
const y_vals = linspace(dy / 2, plots.phase.ymax - dy / 2, ny);

// initial phase plot
drawPhasePlot();

// draw time plot and legend
drawTimePlot();
drawLegend("C", "M", plots.time);

// event listener for button
document.getElementById("parameter-form").addEventListener("submit", function (event) {

    // stop form from submitting and refreshing the page
    event.preventDefault();

    // get form data
    const form = new FormData(event.currentTarget);

    // extract values from form and convert to numbers
    const values = Object.fromEntries(
        Array.from(form, ([name, value]) => [name, Number(value)])
    );

    // update parameters
    ({a, b, c, d, phi, K, a_f, W_c, K_b} = values);

    // redraw plots with new parameters
    drawPhasePlot();
    drawTimePlot();
    drawLegend("C", "M", plots.time);
});

// event listener for clicks
phaseCanvas.addEventListener('click', function(event) {
try {

    // get coordinates of click
    const coords = getClickCoordinates(event, plots.phase);

    // draw a small dot where clicked
    plots.phase.ctx.fillStyle = 'lime';
    plots.phase.ctx.beginPath();
    plots.phase.ctx.arc(coords.x, coords.y, 5, 0, Math.PI * 2);
    plots.phase.ctx.fill();

    // convert phaseCanvas coordinates to mathematical coordinates
    const x0 = modelX(coords.x, plots.phase);
    const y0 = modelY(coords.y, plots.phase);

    // draw trajectory from clicked point, and add to time plot
    drawTrajectory(F, G, x0, y0);

    // redraw legends
    drawLegend("C nullcline", "M nullcline", plots.phase);
    drawLegend("C", "M", plots.time);

} catch (err) {
    console.error('Error getting click coordinates:', err);
}
});


