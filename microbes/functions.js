// MATLAB linspace in JS
function linspace(start, end, n) {

    const values = [];

    for (let i = 0; i < n; i++) {
        values.push(start + i * (end - start) / (n - 1));
    }

    return values;
}


// normalise a vector
function normalise(x, y) {

    const L = Math.sqrt(x**2 + y**2);

    if (L === 0) {
        return [0, 0];
    }

    return [x / L, y / L];
}


// convert mathematical x coordinate to canvas coordinate
function canvasX(x) {
    return leftMargin + (x / xmax) * plotWidth;
}


// convert mathematical y coordinate to canvas coordinate
function canvasY(y) {
    return topMargin + plotHeight - (y / ymax) * plotHeight;
}


// draw entire vector field
function drawVectorField(F, G, x_vals, y_vals) {

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;

    for (let i = 0; i < x_vals.length; i++) {

        for (let j = 0; j < y_vals.length; j++) {

            const x = x_vals[i];
            const y = y_vals[j];

            // evaluate vector field
            let dx = F(x, y);
            let dy = G(x, y);

            // normalise
            [dx, dy] = normalise(dx, dy);

            // don't draw zero vectors
            if (dx !== 0 || dy !== 0) {
                drawArrow(x, y, dx, dy);
            }
        }
    }

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
}


// draw one arrow
function drawArrow(x, y, dx, dy) {

    const arrowLength = 0.5 * spacing;

    // centre arrow on grid point
    const x1 = x - 0.5 * arrowLength * dx;
    const y1 = y - 0.5 * arrowLength * dy;

    const x2 = x + 0.5 * arrowLength * dx;
    const y2 = y + 0.5 * arrowLength * dy;

    // convert to canvas coordinates
    const X1 = canvasX(x1);
    const Y1 = canvasY(y1);

    const X2 = canvasX(x2);
    const Y2 = canvasY(y2);

    // shaft
    ctx.beginPath();
    ctx.moveTo(X1, Y1);
    ctx.lineTo(X2, Y2);
    ctx.stroke();

    // arrowhead
    const angle = Math.atan2(Y2 - Y1, X2 - X1);
    const headLength = 5;

    ctx.beginPath();

    ctx.moveTo(X2, Y2);

    ctx.lineTo(
        X2 - headLength * Math.cos(angle - Math.PI / 6),
        Y2 - headLength * Math.sin(angle - Math.PI / 6)
    );

    ctx.moveTo(X2, Y2);

    ctx.lineTo(
        X2 - headLength * Math.cos(angle + Math.PI / 6),
        Y2 - headLength * Math.sin(angle + Math.PI / 6)
    );

    ctx.stroke();
}


// draw axes, ticks and labels
function drawAxes(xLabel = "x", yLabel = "y") {

    const tickSize = 5;
    const tickSpacing = 0.5;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // axes
    ctx.beginPath();

    // x-axis
    ctx.moveTo(canvasX(0), canvasY(0));
    ctx.lineTo(canvasX(xmax), canvasY(0));

    // y-axis
    ctx.moveTo(canvasX(0), canvasY(0));
    ctx.lineTo(canvasX(0), canvasY(ymax));

    ctx.stroke();


    // x ticks
    for (let x = 0; x <= xmax + 1e-10; x += tickSpacing) {

        const X = canvasX(x);
        const Y = canvasY(0);

        ctx.beginPath();
        ctx.moveTo(X, Y);
        ctx.lineTo(X, Y + tickSize);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(Number(x.toFixed(10)), X, Y + 8);
    }


    // y ticks
    for (let y = 0; y <= ymax + 1e-10; y += tickSpacing) {

        const X = canvasX(0);
        const Y = canvasY(y);

        ctx.beginPath();
        ctx.moveTo(X, Y);
        ctx.lineTo(X - tickSize, Y);
        ctx.stroke();

        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(Number(y.toFixed(10)), X - 8, Y);
    }


    // labels
    ctx.font = "16px Arial";

    // x label
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.fillText(
        xLabel,
        leftMargin + plotWidth / 2,
        canvasY(0) + 20
    );


    // y label
    ctx.save();

    ctx.translate(
        canvasX(0) - 35,
        topMargin + plotHeight / 2
    );

    ctx.rotate(-Math.PI / 2);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(yLabel, 0, 0);

    ctx.restore();
}


// drawing styles
function setSolidStyle(colour, width = 2) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.setLineDash([]);
}


function setDashedStyle(colour, width = 2, dash = [8, 6]) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
}


function resetDrawStyle() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
}


// draw both nullclines
function drawNullclines(F, G) {

    // y-dot = 0 underneath
    setSolidStyle("red", 2.5);
    drawImplicitCurve(G);

    // x-dot = 0 dashed on top
    setDashedStyle("blue", 2.5, [4, 2]);
    drawImplicitCurve(F);

    resetDrawStyle();
}

// approximate f(x,y) = 0 numerically
function drawImplicitCurve(f) {

    const nx = 150;
    const ny = 150;

    const dx = xmax / nx;
    const dy = ymax / ny;

    for (let i = 0; i < nx; i++) {

        for (let j = 0; j < ny; j++) {

            const x0 = i * dx;
            const x1 = (i + 1) * dx;

            const y0 = j * dy;
            const y1 = (j + 1) * dy;

            // function values at corners
            const f00 = f(x0, y0);
            const f10 = f(x1, y0);
            const f11 = f(x1, y1);
            const f01 = f(x0, y1);

            const points = [];

           // bottom edge
           if (f00 * f10 < 0) {
               const t = f00 / (f00 - f10);
               points.push([
                   x0 + t * (x1 - x0),
                   y0
               ]);
           }

           // right edge
           if (f10 * f11 < 0) {
               const t = f10 / (f10 - f11);
               points.push([
                   x1,
                   y0 + t * (y1 - y0)
               ]);
           }

           // top edge
           if (f01 * f11 < 0) {
               const t = f01 / (f01 - f11);
               points.push([
                   x0 + t * (x1 - x0),
                   y1
               ]);
           }

           // left edge
           if (f00 * f01 < 0) {
               const t = f00 / (f00 - f01);
               points.push([
                   x0,
                   y0 + t * (y1 - y0)
               ]);
           }

            // usually a nullcline crosses a cell twice
            if (points.length >= 2) {

                ctx.beginPath();

                ctx.moveTo(
                    canvasX(points[0][0]),
                    canvasY(points[0][1])
                );

                ctx.lineTo(
                    canvasX(points[1][0]),
                    canvasY(points[1][1])
                );

                ctx.stroke();
            }
        }
    }
}