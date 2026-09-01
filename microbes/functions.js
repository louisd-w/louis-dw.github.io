
// -------------------------------- drawing --------------------------------------------------------------------------

// drawing styles
function setSolidStyle(colour, width, plot) {
    plot.ctx.strokeStyle = colour;
    plot.ctx.lineWidth = width;
    plot.ctx.setLineDash([]);
}
function setDashedStyle(colour, width, dash, plot) {
    plot.ctx.strokeStyle = colour;
    plot.ctx.lineWidth = width;
    plot.ctx.setLineDash(dash); //[dashLength, gapLength]
}
function resetDrawStyle(plot) {
    plot.ctx.strokeStyle = "black";
    plot.ctx.lineWidth = 1;
    plot.ctx.setLineDash([]);
}

// draw axes, ticks and labels
function drawAxes(xLabel, yLabel, plot) {

    const tickSize = 5;
    const tickSpacing = 0.5;

    // style 
    resetDrawStyle(plot);
    plot.ctx.save();
    plot.ctx.fillStyle = "black";
    plot.ctx.font = "10px Arial";

    // axes
    plot.ctx.beginPath();

    // x-axis
    plot.ctx.moveTo(canvasX(0, plot), canvasY(0, plot));
    plot.ctx.lineTo(canvasX(plot.xmax, plot), canvasY(0, plot));

    // y-axis
    plot.ctx.moveTo(canvasX(0, plot), canvasY(0, plot));
    plot.ctx.lineTo(canvasX(0, plot), canvasY(plot.ymax, plot));

    plot.ctx.stroke();


    // x ticks
    for (let x = 0; x <= plot.xmax + 1e-10; x += tickSpacing) {

        const X = canvasX(x, plot);
        const Y = canvasY(0, plot);

        plot.ctx.beginPath();
        plot.ctx.moveTo(X, Y);
        plot.ctx.lineTo(X, Y + tickSize);
        plot.ctx.stroke();

        plot.ctx.textAlign = "center";
        plot.ctx.textBaseline = "top";
        plot.ctx.fillText(Number(x.toFixed(10)), X, Y + 8);
    }


    // y ticks
    for (let y = 0; y <= plot.ymax + 1e-10; y += tickSpacing) {

        const X = canvasX(0, plot);
        const Y = canvasY(y, plot);

        plot.ctx.beginPath();
        plot.ctx.moveTo(X, Y);
        plot.ctx.lineTo(X - tickSize, Y);
        plot.ctx.stroke();

        plot.ctx.textAlign = "right";
        plot.ctx.textBaseline = "middle";
        plot.ctx.fillText(Number(y.toFixed(10)), X - 8, Y);
    }


    // labels
    plot.ctx.font = "16px Arial";

    // x label
    plot.ctx.textAlign = "center";
    plot.ctx.textBaseline = "top";

    plot.ctx.fillText(
        xLabel,
        plot.leftMargin + plot.plotWidth / 2,
        canvasY(0, plot) + 20
    );


    // y label
    plot.ctx.save();

    plot.ctx.translate(
        canvasX(0, plot) - 35,
        plot.topMargin + plot.plotHeight / 2
    );

    plot.ctx.textAlign = "center";
    plot.ctx.textBaseline = "middle";

    plot.ctx.fillText(yLabel, 0, 0);

    plot.ctx.restore();
}

// draw legend
function drawLegend(xLabel, yLabel, plot) {

    const height = 70;
    const textPadding = 12;
    const drawing_and_gap = 60;

    plot.ctx.save();
    plot.ctx.font = "14px Helvetica, sans-serif";
    const textWidth = Math.max(
        plot.ctx.measureText(xLabel).width,
        plot.ctx.measureText(yLabel).width
    );
    const width = drawing_and_gap + textWidth + textPadding;
    const x = plot.plotWidth + plot.leftMargin - width - 10;
    const y = plot.topMargin + 10;

    // background
    plot.ctx.fillStyle = "rgb(255, 255, 255)";
    
    // border
    resetDrawStyle(plot);

    // draw
    plot.ctx.beginPath();
    plot.ctx.roundRect(x, y, width, height, 16);
    plot.ctx.fill();
    plot.ctx.stroke();

    // text
    plot.ctx.textAlign = "left";
    plot.ctx.textBaseline = "middle";

    // x nullcline
    plot.ctx.strokeStyle = "blue";
    plot.ctx.lineWidth = 4;
    plot.ctx.beginPath();
    plot.ctx.moveTo(x + 12, y + 23);
    plot.ctx.lineTo(x + 50, y + 23);
    plot.ctx.stroke();

    plot.ctx.fillStyle = "black";
    plot.ctx.fillText(xLabel, x + 60, y + 23);

    // y nullcline
    plot.ctx.strokeStyle = "red";
    plot.ctx.lineWidth = 4;
    plot.ctx.beginPath();
    plot.ctx.moveTo(x + 12, y + 49);
    plot.ctx.lineTo(x + 50, y + 49);
    plot.ctx.stroke();

    plot.ctx.fillStyle = "black";
    plot.ctx.fillText(yLabel, x + 60, y + 49);

    plot.ctx.restore();
}

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
function canvasX(x, plot) {
    return plot.leftMargin + (x / plot.xmax) * plot.plotWidth;
}
function canvasY(y, plot) {
    return plot.topMargin + plot.plotHeight - (y / plot.ymax) * plot.plotHeight;
}
function modelX(canvasPosition, plot) {
    return (canvasPosition - plot.leftMargin) * plot.xmax / plot.plotWidth;
}
function modelY(canvasPosition, plot) {
    return (plot.topMargin + plot.plotHeight - canvasPosition) * plot.ymax / plot.plotHeight;
}
