
// draw the entire plot
function drawTimePlot() {

    //hard-code time plot
    const plot = plots.time;

    // clear timeCanvas
    plot.ctx.clearRect(0, 0, plot.canvas.width, plot.canvas.height);

    // draw axes, ticks and labels
    resetDrawStyle(plot);
    drawAxes("t", "", plot);
}

