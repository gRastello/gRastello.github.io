(function() {/* constants */
	const canvas = document.getElementById("plot-1");
	const ctx = canvas.getContext("2d");

	const halfWidth = canvas.width / 2;
	const halfHeight = canvas.height / 2;

	const faintLineWidth = 1.0;
	const faintLineColor = "rgb(235 240 240)";
	const thickLineWidth = 2.0;
	const thickLineColor = "white";
	const axesLineWidth = 3.0;
	const labelSize = 15;

	const scaleOptions = {
		defaultX: 40,
		defaultY: 40,

		minX: 40,
		minY: 40,

		maxX: 100,
		maxY: 100,
	};

	/* globals */
	let drag = false;

	let scale = {
		x: scaleOptions.defaultX,
		y: scaleOptions.defaultY,
	};

	let origin = {
		x: 0,
		y: 0,
	};

	let minX = 0;
	let minY = 0;
	let maxX = 0;
	let maxY = 0;

	let drawingPoints = false;
	let drawingPolygonal = false;
	let drawingTruePlot = false;

	/* draw an horizontal line at y */
	function drawHorizontal(y) {
		ctx.beginPath();
		ctx.moveTo(minX * scale.x, y * scale.y);
		ctx.lineTo(maxX * scale.x, y * scale.y);
		ctx.closePath();
		ctx.stroke();
	}

	/* draw a vertical line at x */
	function drawVertical(x) {
		ctx.beginPath();
		ctx.moveTo(x * scale.x, minY * scale.y);
		ctx.lineTo(x * scale.x, maxY * scale.y);
		ctx.closePath();
		ctx.stroke();
	}

	/* draw some text */
	function writeText(text, x, y) {
		ctx.save();
		ctx.scale(1.0, -1.0);

		let test = ctx.measureText(text);
		ctx.fillText(text, x * scale.x - test.width / 2, -1 * y * scale.y + labelSize);

		ctx.restore();
	}

	/* draw the grid over the canvas */
	function drawGrid() {
		/* draw the 5 interval marks */
		let x = 0;
		let y = 0;

		x = 0;
		while (x <= maxX) {
			x += 5;

			ctx.save();
			ctx.lineWidth = thickLineWidth;
			ctx.strokeStyle = thickLineColor;

			drawVertical(x);
			ctx.restore();
		}

		x = 0;
		while (x >= minX) {
			x -= 5;

			ctx.save();
			ctx.lineWidth = thickLineWidth;
			ctx.strokeStyle = thickLineColor;

			drawVertical(x);
			ctx.restore();
		}

		y = 0;
		while (y <= maxY) {
			y += 5;

			ctx.save();
			ctx.lineWidth = thickLineWidth;
			ctx.strokeStyle = thickLineColor;

			drawHorizontal(y);
			ctx.restore();
		}

		y = 0;
		while (y >= minY) {
			y -= 5;

			ctx.save();
			ctx.lineWidth = thickLineWidth;
			ctx.strokeStyle = thickLineColor;

			drawHorizontal(y);
			ctx.restore();
		}

		/* draw the faint 1-interval lines */
		let i = 0;
		x = 0;
		while (x <= maxX) {
			x++;
			i++;

			if (i % 5 != 0) {
				ctx.save();
				ctx.lineWidth = faintLineWidth;
				ctx.strokeStyle = faintLineColor;

				drawVertical(x);
				ctx.restore();
			}
		}

		x = 0;
		i = 0;
		while (x >= minX) {
			x--;
			i++;

			if (i % 5 != 0) {
				ctx.save();
				ctx.lineWidth = faintLineWidth;
				ctx.strokeStyle = faintLineColor;

				drawVertical(x);
				ctx.restore();
			}
		}

		y = 0;
		i = 0;
		while (y <= maxY) {
			y++;
			i++;

			if (i % 5 != 0) {
				ctx.save();
				ctx.lineWidth = faintLineWidth;
				ctx.strokeStyle = faintLineColor;

				drawHorizontal(y);
				ctx.restore();
			}
		}

		y = 0;
		i = 0;
		while (y >= minY) {
			y--;
			i++;

			if (i % 5 != 0) {
				ctx.save();
				ctx.lineWidth = faintLineWidth;
				ctx.strokeStyle = faintLineColor;

				drawHorizontal(y);
				ctx.restore();
			}
		}

		/* draw the axes */
		ctx.save();
		ctx.lineWidth = axesLineWidth;
		ctx.strokeStyle = thickLineColor;

		drawVertical(0);
		drawHorizontal(0);
		ctx.restore();
	}

	/* add labels to the grid */
	function labelGrid() {
		for (let i = 1; i <= maxX; i++) {
			if (i % 5 == 0) writeText(i, i, 0);
		}

		for (let i = 0; i >= minX; i--) {
			if (i % 5 == 0) writeText(i, i, 0);
		}

		for (let i = 1; i <= maxY; i++) {
			if (i % 5 == 0) writeText(i, 0, i);
		}

		for (let i = -1; i >= minY; i--) {
			if (i % 5 == 0) writeText(i, 0, i);
		}
	}

	/* draw the graph of a function */
	function drawFunction(f, style) {
		ctx.save();
		ctx.beginPath();

		/* aesthetics */
		ctx.strokeStyle = style;
		ctx.lineWidth = 3.0;

		/* actual drawing */
		ctx.moveTo(minX * scale.x, f(minX) * scale.y);
		let x0 = minX;
		while (x0 < maxX) {
			ctx.lineTo(x0 * scale.x, f(x0) * scale.y);
			x0 += 0.15;
		}

		ctx.stroke();
		ctx.restore();
	}

	/* draw some points of the graph of a function */
	function drawPoints(f, style) {
		ctx.save();

		/* aesthetics */
		ctx.strokeStyle = style;
		ctx.lineWidth = 3.0;
		let crossRadius = 7;

		/* drawing of the points */
		let x0 = -3;
		while (x0 <= 3) {
			let a = x0 * scale.x;
			let b = f(x0) * scale.y;

			ctx.beginPath();
			ctx.moveTo(a - crossRadius, b);
			ctx.lineTo(a + crossRadius, b);
			ctx.moveTo(a, b - crossRadius);
			ctx.lineTo(a, b + crossRadius);

			ctx.stroke();
			x0 += 1;
		}

		ctx.restore();
	}

	/* draw broken function line. */
	function drawBroken(f, style) {
		ctx.save();
		ctx.beginPath();

		/* aesthetics */
		ctx.strokeStyle = style;
		ctx.lineWidth = 2.0;

		let x0 = -3;
		ctx.moveTo(x0 * scale.x, f(x0) * scale.y);
		x0 += 1;
		while (x0 <= 3) {
			ctx.lineTo(x0 * scale.x, f(x0) * scale.y);

			x0 += 1;
		}

		ctx.stroke();
		ctx.restore();
	}

	/* scale and move origin with wheel and drag  */
	canvas.addEventListener('wheel', (e) => {
		if (e.deltaY > 0) {
			scale.x += 1;
			scale.y += 1;

			if (scale.x > scaleOptions.maxX) scale.x = scaleOptions.maxX;
			if (scale.y > scaleOptions.maxY) scale.y = scaleOptions.maxY;
		}

		if (e.deltaY < 0) {
			scale.x -= 1;
			scale.y -= 1;

			if (scale.x < scaleOptions.minX) scale.x = scaleOptions.minX;
			if (scale.y < scaleOptions.minY) scale.y = scaleOptions.minY;
		}

		updatePOV();
		draw();
		e.preventDefault();
	});

	canvas.addEventListener('mousemove', (e) => {
		if (drag) {
			updatePOV(e.movementX, -1 * e.movementY);
			draw();
		}
	});

	canvas.addEventListener('mousedown', (e) => {
		drag = true;
	})

	canvas.addEventListener('mouseup', (e) => {
		drag = false;
	})

	/* buttons */
	const buttonPoints = document.getElementById("plot-1-points");
	const buttonPolygonal = document.getElementById("plot-1-polygonal");
	const buttonTruePlot = document.getElementById("plot-1-trueplot");

	buttonPoints.addEventListener('click', (e) => {
		drawingPoints = !drawingPoints;
		draw();
	});

	buttonPolygonal.addEventListener('click', (e) => {
		drawingPolygonal = !drawingPolygonal;
		draw();
	});
	
	buttonTruePlot.addEventListener('click', (e) => {
		drawingTruePlot = !drawingTruePlot;
		draw();
	});

	/* update the Point Of View (POV) of our plot */
	function updatePOV(dx = 0, dy = 0) {
		/* set the new origin */
		origin.x -= dx / scale.x;
		origin.y -= dy / scale.y;

		/* update our bounds */
		minX = origin.x - canvas.width / scale.x;
		maxX = origin.x + canvas.width / scale.x;
		minY = origin.y - canvas.height / scale.y;
		maxY = origin.y + canvas.height / scale.y;

		/* some debugging */
		// console.log("<%f, %f> x <%f, %f>, (%f, %f)", minX, maxX, minY, maxY, origin.x, origin.y);
		// console.log("rect width: %f", maxX - minX);
		// console.log("rect height: %f", maxY - minY);

		/* set new POV */
		ctx.setTransform(1, 0, 0, -1, halfWidth - origin.x * scale.x, halfHeight + origin.y * scale.y);
	}

	/* main function */
	function draw() {
		/* set background */
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = "rgb(215 225 230)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.restore();

		/* draw backgound */
		drawGrid();
		labelGrid();

		/* draw objects of interest */
		// drawFunction((x) => {return x * x * x / 6 + x * x / 4 - x;}, "green");

		if (drawingPoints)
			drawPoints((x) => {return x * x * x / 6 + x * x / 4 - x;}, "red");

		if (drawingPolygonal)
			drawBroken((x) => {return x * x * x / 6 + x * x / 4 - x;}, "red");

		if (drawingTruePlot)
			drawFunction((x) => {return x * x * x / 6 + x * x / 4 - x;}, "orange");
	}

	function init() {
		/* setup font */
		ctx.font = labelSize + "px sans-serif";

		/* human coordinates */
		ctx.translate(halfWidth, halfHeight);
		ctx.scale(1.0, -1.0);

		/* let the show begin */

		origin.x = 0;
		origin.y = 2;
		updatePOV();
		draw();
	}

	init();
})();