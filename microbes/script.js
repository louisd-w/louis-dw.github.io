// setup canvas
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;


// parameters
const a = 5;
const b = 2;
const c = 0.5;
const d = 1;
const phi = 1;
const K = 10;
const a_f = 1;
const W_c = 1;
const K_b = 1;

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

// lotka volterra
//const F = (x, y) => x * (1 - y);
//const G = (x, y) => y * (x - 1);

// vector field grid
const spacing = 0.3;
const nx = Math.round(xmax / spacing);
const ny = Math.round(ymax / spacing);
const dx = xmax / nx;
const dy = ymax / ny;
const x_vals = linspace(dx / 2, xmax - dx / 2, nx);
const y_vals = linspace(dy / 2, ymax - dy / 2, ny);


//draw axes, ticks and labels
resetDrawStyle();
drawAxes("C", "M");

// draw vector field
drawVectorField(F, G, x_vals, y_vals);

// draw nullclines
// C
setDashedStyle("blue", 4, [15, 10]); //[dashLength, gapLength]
drawImplicitCurve(F);
// M
setSolidStyle("red", 2);
drawImplicitCurve(G);

drawLegend("C", "M");

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

