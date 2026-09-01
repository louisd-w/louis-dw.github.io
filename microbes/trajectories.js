// get click coordinates relative to a plot canvas
function getClickCoordinates(event, plot) {
    const canvas = plot.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // get canvas position and displayed size
    const rect = canvas.getBoundingClientRect();

    // calculate mouse coordinates relative to canvas display
    const displayX = event.clientX - rect.left;
    const displayY = event.clientY - rect.top;

    // scale to internal canvas resolution (accounts for CSS scaling)
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    
    const x = displayX * scaleX;
    const y = displayY * scaleY;

    // check if click is within the axes
    const isWithinPlot = x >= plot.leftMargin && 
                         x <= canvasWidth - plot.rightMargin &&
                         y >= plot.topMargin && 
                         y <= canvasHeight - plot.bottomMargin;

    if (!isWithinPlot) {
        return; // ignore clicks outside
    }
    else{
        return {x, y};
    }
}

// rk4 step for system of 2 ODEs
function rk4Step(F, G, x, y, dt) {
    const k1x = F(x, y);
    const k1y = G(x, y);

    const k2x = F(x + 0.5 * dt * k1x, y + 0.5 * dt * k1y);
    const k2y = G(x + 0.5 * dt * k1x, y + 0.5 * dt * k1y);

    const k3x = F(x + 0.5 * dt * k2x, y + 0.5 * dt * k2y);
    const k3y = G(x + 0.5 * dt * k2x, y + 0.5 * dt * k2y );

    const k4x = F(x + dt * k3x, y + dt * k3y);
    const k4y = G(x + dt * k3x, y + dt * k3y);

    return {
        x: x + dt * (k1x + 2 * k2x + 2 * k3x + k4x) / 6,
        y: y + dt * (k1y + 2 * k2y + 2 * k3y + k4y) / 6
    };
}

// draw trajectory from initial point (x0, y0) and add to time plot
function drawTrajectory(F, G, x0, y0, dt = 0.01, steps = 5000) {

    // default values
    let t = [0];
    let x = [x0];
    let y = [y0];

    // phase plot intial point
    plots.phase.ctx.beginPath();
    plots.phase.ctx.moveTo(canvasX(x[0], plots.phase), canvasY(y[0], plots.phase));


    // integrate
    for (let i = 0; i < steps; i++) {

        // rk4 step
        const next = rk4Step(F, G, x[x.length - 1], y[y.length - 1], dt);

        // stop if the trajectory blows up or leaves the phase plot
        if (next.x < 0 || next.x > plots.phase.xmax || next.y < 0 || next.y > plots.phase.ymax) {
            break;
        }

        // update arrays
        x.push(next.x);
        y.push(next.y);
        t.push(t[t.length - 1] + dt);

        // draw trajectory on phase plot
        plots.phase.ctx.lineTo(canvasX(x[x.length - 1], plots.phase), canvasY(y[y.length - 1], plots.phase));

    }

    //reset time plot and scale the axes
    plots.time.xmax = t[t.length - 1];
    plots.time.ymax = Math.max(Math.max(...x), Math.max(...y))*1.1;
    drawTimePlot();

    // draw trajectories on time plot

    const xTimePath = new Path2D();
    const yTimePath = new Path2D();

    xTimePath.moveTo(canvasX(t[0], plots.time), canvasY(x[0], plots.time));
    yTimePath.moveTo(canvasX(t[0], plots.time), canvasY(y[0], plots.time));

    for (let i = 1; i < t.length; i++) {
        xTimePath.lineTo(canvasX(t[i], plots.time), canvasY(x[i], plots.time));
        yTimePath.lineTo(canvasX(t[i], plots.time), canvasY(y[i], plots.time));
    }

    
    // stroke the paths with styles

    //phase plot trajectory
    setSolidStyle("lime", 2, plots.phase);
    plots.phase.ctx.stroke();
    resetDrawStyle(plots.phase);

    //time plot trajectories
    setSolidStyle("blue", 2, plots.time);
    plots.time.ctx.stroke(xTimePath);
    setSolidStyle("red", 2, plots.time);
    plots.time.ctx.stroke(yTimePath);
    resetDrawStyle(plots.time);

    

}
