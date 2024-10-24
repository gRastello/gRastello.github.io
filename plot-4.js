(function() {/* constants */
	const canvas = document.getElementById("plot-4");
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
		defaultX: 100,
		defaultY: 100,

		minX: 20,
		minY: 20,

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
		y: 1,
	};

	let minX = 0;
	let minY = 0;
	let maxX = 0;
	let maxY = 0;

	let parameterA = 1;

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
			scale.x += 10;
			scale.y += 10;

			if (scale.x > scaleOptions.maxX) scale.x = scaleOptions.maxX;
			if (scale.y > scaleOptions.maxY) scale.y = scaleOptions.maxY;
		}

		if (e.deltaY < 0) {
			scale.x -= 10;
			scale.y -= 10;

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
		drawFunction((x) => {return Math.exp(-1 * x * x);}, "orange");
		drawFunction((x) => {return parameterA * Math.exp(-1 * x * x);}, "brown");

		// ctx.save();
		// ctx.beginPath();
		// ctx.fillStyle = "blue";
		// ctx.arc(0 * scale.x, 0 * scale.y, 5, 0, 2 * Math.PI);
		// ctx.fill();
		// ctx.restore();

		/* draw the slider */
		drawSlider();
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

	/* slider */
	const sliderCanvas = document.getElementById("slider-1");
	const sliderCtx = sliderCanvas.getContext("2d");
	const paragraph = document.getElementById("f-dilatazione");
	
	const barPaddingX = 20;
	const barLength = sliderCanvas.width - 2 * barPaddingX;

	const barRadius = 7;

	function drawSlider() {
		sliderCtx.save();

		sliderCtx.fillStyle = "rgb(215 225 230)";
		sliderCtx.fillRect(0, 0, sliderCanvas.width, sliderCanvas.height);

		/* draw the slider and the ball */
		sliderCtx.translate(barPaddingX, sliderCanvas.height / 2);
		sliderCtx.strokeStyle = "white";

		sliderCtx.beginPath();
		sliderCtx.moveTo(0, 0);
		sliderCtx.lineTo(barLength, 0);
		sliderCtx.stroke();

		sliderCtx.fillStyle = "white";
		sliderCtx.beginPath();
		// const percent = (scale.x - scaleOptions.minX) / (scaleOptions.maxX - scaleOptions.minX);
		const percent = parameterA / 5;
		sliderCtx.arc(percent * barLength, 0, barRadius, 0, 2 * Math.PI);
		sliderCtx.fill();

		sliderCtx.restore();

		/* update the writing on the wall. */
		let content = parameterA.toFixed(2);
		paragraph.textContent = content;
	}

	let sliderDrag = false;

	sliderCanvas.addEventListener('mousemove', (e) => {
		if (sliderDrag) {
			let clickX = e.offsetX;
			if (barPaddingX < clickX && clickX < barPaddingX + barLength) {
				const percent = (clickX - barPaddingX) / barLength;
				// scale.x = scaleOptions.minX + percent * (scaleOptions.maxX - scaleOptions.minX);
				parameterA = percent * 5;
			}

			draw();
		}
	})

	sliderCanvas.addEventListener('mouseup', (e) => {
		sliderDrag = false;
	});

	sliderCanvas.addEventListener('mousedown', (e) => {
		sliderDrag = true;
	})

	/* start it all */
	init();
})();
