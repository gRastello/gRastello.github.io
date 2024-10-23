(function() {/* constants */
	const canvas = document.getElementById("plot-2");
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

	/* transformations */
	let tTranslationX = 0.0;
	let tTranslationY = 0.0;
	let tStretchX = 1.0;
	let tStretchY = 1.0;

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

	/* the function */
	function fun(x) {
		const x0 = tStretchX * x + tTranslationX;
		const y0 = x0 * x0 * x0 / 6 + x0 * x0 / 4 - x0;
		return tStretchY * y0 + tTranslationY;
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

	const button11 = document.getElementById("plot-2-11");
	button11.addEventListener('click', (e) => {
		if (tTranslationY == 0) {
			tTranslationY = 2;
			button11.classList.add('on');
			
			draw();
			return;
		}

		if (tTranslationY == 2) {
			tTranslationY = 0;
			button11.classList.remove('on');
			
			draw();
			return;
		}
	});

	const button12 = document.getElementById("plot-2-12");
	button12.addEventListener('click', (e) => {
		if (tTranslationY == 0) {
			tTranslationY = -2;
			button12.classList.add('on');
			
			draw();
			return;
		}

		if (tTranslationY == -2) {
			tTranslationY = 0;
			button12.classList.remove('on');
			
			draw();
			return;
		}
	});

	const button21 = document.getElementById("plot-2-21");
	button21.addEventListener('click', (e) => {
		if (tStretchY == 1) {
			tStretchY = 2;
			button21.classList.add('on');
			
			draw();
			return;
		}

		if (tStretchY == 2) {
			tStretchY = 1;
			button21.classList.remove('on');
			
			draw();
			return;
		}
	});

	const button22 = document.getElementById("plot-2-22");
	button22.addEventListener('click', (e) => {
		if (tStretchY == 1) {
			tStretchY = .5;
			button22.classList.add('on');
			
			draw();
			return;
		}

		if (tStretchY == .5) {
			tStretchY = 1;
			button22.classList.remove('on');
			
			draw();
			return;
		}
	});

	const button31 = document.getElementById("plot-2-31");
	button31.addEventListener('click', (e) => {
		if (tTranslationX == 0) {
			tTranslationX = 1;
			button31.classList.add('on');
			
			draw();
			return;
		}

		if (tTranslationX == 1) {
			tTranslationX = 0;
			button31.classList.remove('on');
			
			draw();
			return;
		}
	});

	const button32 = document.getElementById("plot-2-32");
	button32.addEventListener('click', (e) => {
		if (tTranslationX == 0) {
			tTranslationX = -1;
			button32.classList.add('on');
			
			draw();
			return;
		}

		if (tTranslationX == -1) {
			tTranslationX = 0;
			button32.classList.remove('on');
			
			draw();
			return;
		}
	});

	const button41 = document.getElementById("plot-2-41");
	button41.addEventListener('click', (e) => {
		if (tStretchX == 1) {
			tStretchX = 2;
			button41.classList.add('on');
			
			draw();
			return;
		}

		if (tStretchX == 2) {
			tStretchX = 1;
			button41.classList.remove('on');
			
			draw();
			return;
		}
	});

	const button42 = document.getElementById("plot-2-42");
	button42.addEventListener('click', (e) => {
		if (tStretchX == 1) {
			tStretchX = .5;
			button42.classList.add('on');
			
			draw();
			return;
		}

		if (tStretchX == .5) {
			tStretchX = 1;
			button42.classList.remove('on');
			
			draw();
			return;
		}
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
		let f = (x) => {return x * x * x / 6 + x * x / 4 - x;};

		/* leave the function */
		drawFunction((x) => {return x * x * x / 6 + x * x / 4 - x;}, "orange");

		/* draw the transformed function */
		drawFunction(fun, "brown");

		// drawFunction((x) => {return f(2 * x);}, "brown");
		// drawFunction((x) => {return f(x / 2);}, "brown");
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
