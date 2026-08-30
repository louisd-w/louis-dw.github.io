// get click coordinates relative to canvas
function getClickCoordinates(event) {
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
    const isWithinPlot = x >= leftMargin && 
                         x <= canvasWidth - rightMargin &&
                         y >= topMargin && 
                         y <= canvasHeight - bottomMargin;

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

// draw trajectory from initial point (x0, y0)
function drawTrajectory(F, G, x0, y0, dt = 0.01, steps = 5000) {
    
    let x = x0;
    let y = y0;

    ctx.beginPath();
    ctx.moveTo(canvasX(x), canvasY(y));

    for (let i = 0; i < steps; i++) {

        // rk4 step
        const next = rk4Step(F, G, x, y, dt);
        x = next.x;
        y = next.y;

        // break early if trajectory goes out of bounds
        if (
            !Number.isFinite(x) ||
            !Number.isFinite(y) ||
            x < 0 || x > xmax ||
            y < 0 || y  > ymax
        ) {
            break;
        }

        ctx.lineTo(canvasX(x), canvasY(y));
    }

    ctx.stroke();
}
