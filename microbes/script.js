// setup canvas
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

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

// limits
const xmax = 6;
const ymax = 6;

// plot margins
const leftMargin = 50;
const rightMargin = 20;
const topMargin = 20;
const bottomMargin = 50;

const plotWidth = canvasWidth - leftMargin - rightMargin;
const plotHeight = canvasHeight - topMargin - bottomMargin;

// model functions
const mu = (M) => d + phi * c * M;
const beta = (M) => (a * M) / (b + M) - (1 - phi) * c * M;
const U = (M) =>  a_f * M + (W_c * M) / (K_b + M);
const U_prime = (M) =>  a_f + (W_c * K_b) / (K_b + M)**2;
const S = (C, M) =>  C * (beta(M) * (1 - C / K) - mu(M));

// Model M
const F = (C, M) => S(C, M);
const G = (C, M) => -U(M) * S(C, M) / (1 + C * U_prime(M));

// vector field grid
    const spacing = 0.3;
    const nx = Math.round(xmax / spacing);
    const ny = Math.round(ymax / spacing);
    const dx = xmax / nx;
    const dy = ymax / ny;
    const x_vals = linspace(dx / 2, xmax - dx / 2, nx);
    const y_vals = linspace(dy / 2, ymax - dy / 2, ny);

// initial plot
drawPlot();

//event listener for button
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

    // redraw plot with new parameters
    drawPlot();
});

//event listener for clicks
canvas.addEventListener('click', function(event) {
try {

    // get coordinates of click
    const coords = getClickCoordinates(event);

    // draw a small dot where clicked
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // convert canvas coordinates to mathematical coordinates
    const x0 = modelX(coords.x);
    const y0 = modelY(coords.y);

    // draw trajectory from clicked point
    setSolidStyle("lime", 2);
    drawTrajectory(F, G, x0, y0);
    resetDrawStyle();

    // redraw legend
    drawLegend("C", "M");

} catch (err) {
    console.error('Error getting click coordinates:', err);
}
});

