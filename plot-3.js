(function() {/* constants */
	const canvas = document.getElementById("plot-3");
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
		defaultX: 15,
		defaultY: 15,

		minX: 5,
		minY: 5,

		maxX: 25,
		maxY: 25,
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

	let fieldA = 0;
	let fieldB = 0;

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
		ctx.lineWidth = 2.0;

		/* actual drawing */
		ctx.moveTo(minX * scale.x, f(minX) * scale.y);
		let x0 = minX;
		while (x0 < maxX) {
			ctx.lineTo(x0 * scale.x, f(x0) * scale.y);
			x0 += 0.1;
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
	});

	canvas.addEventListener('mouseup', (e) => {
		drag = false;
	});

	const field1 = document.getElementById("field-1");
	const field2 = document.getElementById("field-2");

	field1.addEventListener('input', (e) => {
		fieldA = parseFloat(e.target.value);
		draw();
	});

	field2.addEventListener('input', (e) => {
		fieldB = parseFloat(e.target.value);
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

	function drawArrow(f, style) {
		ctx.save();
		ctx.strokeStyle = style;
		ctx.fillStyle = style;
		ctx.lineWidth = 3.0;

		ctx.beginPath();
		ctx.moveTo(0, f(0) * scale.y);
		ctx.lineTo(fieldA * scale.x, (f(0) + fieldB) * scale.y);
		ctx.stroke();

		const N = Math.sqrt(fieldA * fieldA + fieldB * fieldB);

		/* we draw a triangle */
		ctx.save();
		ctx.translate(fieldA * scale.x, (f(0) + fieldB) * scale.y);
		// ctx.rotate(Math.atan(fieldB / fieldA));
		if (fieldA >= 0) {
			ctx.rotate(Math.PI / 2 + Math.atan(fieldB / fieldA));
		} else {
			ctx.rotate(Math.PI / 2 + Math.atan(fieldB / fieldA) + Math.PI);
		}
		
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(.1 * N * Math.sqrt(3) / 2 * scale.x, .1 * N * scale.y);
		ctx.lineTo(-.1 * N * Math.sqrt(3) / 2 * scale.x, .1 * N * scale.y);
		ctx.lineTo(0, 0);

		ctx.fill();
		ctx.restore();
		ctx.restore();
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
		const f = (x) => {
			x = (x + 10)/6;
			return x*x*x - 4*x*x + x - 2;
		};

		drawFunction(f, "orange");
		drawFunction((x) => {
			let y = f(x - fieldA) + fieldB;
			return y;
		}, "brown");
		drawArrow(f, "green");
	}

	function init() {
		/* setup font */
		ctx.font = labelSize + "px sans-serif";

		/* human coordinates */
		ctx.translate(halfWidth, halfHeight);
		ctx.scale(1.0, -1.0);

		/* let the show begin */
		updatePOV();
		draw();
	}

	init();
})();
