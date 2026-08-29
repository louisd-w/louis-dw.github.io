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

    // arrow head (LLM)
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

    resetDrawStyle();

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

    ctx.rotate(-Math.PI / 2);

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
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    
    // border
    resetDrawStyle();
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    // text
    ctx.font = "14px Arial";
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

// approximate f(x,y) = 0 using triangulation algorithm (LLM)
function drawImplicitCurve(f) {
    const meshDensity = 200;
    const dx = xmax / meshDensity;
    const dy = ymax / meshDensity;

    const tolerance = 1e-10;

    // Interpolate the point where f crosses zero
    function zeroPoint(p1, p2) {
        const denominator = p1.value - p2.value;
        const t = Math.abs(denominator) < tolerance ? 0.5 : p1.value / denominator;
        
        return {
            x: p1.x + t * (p2.x - p1.x),
            y: p1.y + t * (p2.y - p1.y)
        };
    }

    // Collect all segments as line endpoints
    const segments = [];

    // Draw the zero contour within one triangle
    function drawTriangle(points) {
        const intersections = [];

        const edges = [
            [points[0], points[1]],
            [points[1], points[2]],
            [points[2], points[0]]
        ];

        for (const [p1, p2] of edges) {
            if (!Number.isFinite(p1.value) || !Number.isFinite(p2.value)) {
                continue;
            }

            const abs1 = Math.abs(p1.value);
            const abs2 = Math.abs(p2.value);

            // Detect zero crossing with tolerance
            const hasCrossing = (p1.value > tolerance && p2.value < -tolerance) ||
                               (p1.value < -tolerance && p2.value > tolerance);
            
            // Or: one endpoint is near zero and the other is far
            const p1NearZero = abs1 < tolerance;
            const p2NearZero = abs2 < tolerance;
            
            if (hasCrossing || (p1NearZero && !p2NearZero) || (p2NearZero && !p1NearZero)) {
                intersections.push(zeroPoint(p1, p2));
            }
        }

        if (intersections.length >= 2) {
            segments.push([
                intersections[0],
                intersections[1]
            ]);
        }
    }

    for (let i = 0; i < meshDensity; i++) {
        for (let j = 0; j < meshDensity; j++) {
            const x1 = i * dx;
            const x2 = x1 + dx;
            const y1 = j * dy;
            const y2 = y1 + dy;

            const bottomLeft = {
                x: x1,
                y: y1,
                value: f(x1, y1)
            };

            const bottomRight = {
                x: x2,
                y: y1,
                value: f(x2, y1)
            };

            const topRight = {
                x: x2,
                y: y2,
                value: f(x2, y2)
            };

            const topLeft = {
                x: x1,
                y: y2,
                value: f(x1, y2)
            };

            // Split each grid square into two triangles
            drawTriangle([bottomLeft, bottomRight, topRight]);
            drawTriangle([bottomLeft, topRight, topLeft]);
        }
    }

    // Connect segments into curves and draw with dashing
    const epsilon = 1e-6;
    const used = new Set();
    
    function pointsClose(p1, p2) {
        return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
    }

    for (let i = 0; i < segments.length; i++) {
        if (used.has(i)) continue;

        // Start a new curve
        ctx.beginPath();
        const curve = segments[i];
        ctx.moveTo(canvasX(curve[0].x), canvasY(curve[0].y));
        ctx.lineTo(canvasX(curve[1].x), canvasY(curve[1].y));
        used.add(i);

        // Try to extend curve by connecting adjacent segments
        let currentEnd = curve[1];
        let found = true;

        while (found) {
            found = false;
            for (let j = 0; j < segments.length; j++) {
                if (used.has(j)) continue;

                const seg = segments[j];
                if (pointsClose(currentEnd, seg[0])) {
                    ctx.lineTo(canvasX(seg[1].x), canvasY(seg[1].y));
                    currentEnd = seg[1];
                    used.add(j);
                    found = true;
                    break;
                } else if (pointsClose(currentEnd, seg[1])) {
                    ctx.lineTo(canvasX(seg[0].x), canvasY(seg[0].y));
                    currentEnd = seg[0];
                    used.add(j);
                    found = true;
                    break;
                }
            }
        }

        ctx.stroke();
    }
}

// get click coordinates relative to canvas
function getClickCoordinates(event) {
    // get canvas position
    const rect = canvas.getBoundingClientRect();

    // calculate mouse coordinates relative to canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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
