
// -------------------------------- maths -----------------------------------------------------------------------------

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

// -------------------------------- coordinates ----------------------------------------------------------------------
// convert mathematical coordinates to canvas coordinates
function canvasX(x) {
    return leftMargin + (x / xmax) * plotWidth;
}
function canvasY(y) {
    return topMargin + plotHeight - (y / ymax) * plotHeight;
}

// convert canvas coordinates to mathematical coordinates
function modelX(canvasPosition) {
    return (canvasPosition - leftMargin) * xmax / plotWidth;
}
function modelY(canvasPosition) {
    return (topMargin + plotHeight - canvasPosition) * ymax / plotHeight;
}


// -------------------------------- drawing ---------------------------------------------------------------------------
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

    // arrow shaft
    ctx.beginPath();
    ctx.moveTo(X1, Y1);
    ctx.lineTo(X2, Y2);
    ctx.stroke();

    // arrow head
    const angle = Math.atan2(Y2 - Y1, X2 - X1);
    const headLength = 5;

    ctx.beginPath();

    ctx.moveTo(X2, Y2); // end of shaft

    ctx.lineTo(
        X2 - headLength * Math.cos(angle - Math.PI / 6),    // left side of head
        Y2 - headLength * Math.sin(angle - Math.PI / 6)
    );

    ctx.moveTo(X2, Y2); // back to end of shaft

    ctx.lineTo(
        X2 - headLength * Math.cos(angle + Math.PI / 6),    // right side of head
        Y2 - headLength * Math.sin(angle + Math.PI / 6)
    );

    ctx.stroke();
}

// draw vector field
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

// draw axes, ticks and labels
function drawAxes(xLabel, yLabel) {

    const tickSize = 5;
    const tickSpacing = 0.5;

    // style 
    resetDrawStyle();
    ctx.save();
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";

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


    // y label (LLM)
    ctx.save();

    ctx.translate(
        canvasX(0) - 35,
        topMargin + plotHeight / 2
    );

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(yLabel, 0, 0);

    ctx.restore();
}

// draw legend for nullclines
function drawLegend(xLabel, yLabel) {

    const width = 150;
    const height = 70;
    const x = plotWidth + leftMargin - width - 10;
    const y = topMargin + 10;
    
    ctx.save();

    // background
    ctx.fillStyle = "rgb(255, 255, 255)";
    
    // border
    resetDrawStyle();

    // draw
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 16);
    ctx.fill();
    ctx.stroke();

    // text
    ctx.font = "14px Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // x nullcline
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 23);
    ctx.lineTo(x + 50, y + 23);
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.fillText(xLabel + " nullcline", x + 60, y + 23);

    // y nullcline
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 49);
    ctx.lineTo(x + 50, y + 49);
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.fillText(yLabel + " nullcline", x + 60, y + 49);

    ctx.restore();
}

// draw the entire plot
function drawPlot() {
    // clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    //draw axes, ticks and labels
    resetDrawStyle();
    drawAxes("C", "M");

    // draw vector field
    drawVectorField(F, G, x_vals, y_vals);

    // draw nullclines
    
    // C
    setDashedStyle("blue", 4, [15, 10]); //[dashLength, gapLength]
    drawImplicitCurveLLM(F);

    // M
    setSolidStyle("red", 2);
    drawImplicitCurveLLM(G);

    drawLegend("C", "M");
}

// drawing styles
function setSolidStyle(colour, width) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.setLineDash([]);
}
function setDashedStyle(colour, width, dash) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.setLineDash(dash); //[dashLength, gapLength]
}
function resetDrawStyle() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
}

