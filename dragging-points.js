(function() {/* constants */
	const canvas = document.getElementById("dragging-points");
	const ctx = canvas.getContext("2d");

	const halfWidth = canvas.width / 2;
	const halfHeight = canvas.height / 2;
	const backgroundColor = "rgb(215 225 230)";

	const scale = {
		x: 50,
		y: 50,
	};

	const pointPrototype = {
		x: 0,
		y: 0,
		dragging: false,

		color: "red",
		radius: 6,
		crownRadius: 8,

		draw() {
			ctx.save();
			ctx.fillStyle = this.color;
			ctx.strokeStyle = this.color;

			ctx.beginPath();
			ctx.arc(this.x * scale.x, this.y * scale.y, this.radius, 0, 2 * Math.PI);
			ctx.fill();

			if (!this.dragging) {
				ctx.beginPath();
				ctx.arc(this.x * scale.x, this.y * scale.y, this.crownRadius, 0, 2 * Math.PI);
				ctx.stroke();
			}

			ctx.restore();
		},

		/* this method works in non-scaled coordinates */
		contains(x, y) {
			const dist = (x - this.x * scale.y) * (x - this.x * scale.y) + (y - this.y * scale.y) * (y - this.y * scale.y);
			return dist < this.crownRadius * this.crownRadius;
		},
	};

	let points = [];

	/* create a new point */
	function makeNewPoint(x, y) {
		let p = Object.create(pointPrototype);
		p.x = x;
		p.y = y;
		points.push(p);
	}

	/* events */
	canvas.addEventListener('mousedown', (e) => {
		const x = e.offsetX - halfWidth;
		const y = halfHeight - e.offsetY;

		/* set the first point hit to dragged mode */
		for (p of points) {
			if (p.contains(x, y)) {
				p.dragging = true;
				break;
			}
		}

		// console.log(points);
	});

	canvas.addEventListener('mouseup', (e) => {
		points.forEach((p) => {
			if (p.dragging) p.dragging = false;
		});

		// console.log(points);
	});

	canvas.addEventListener('mousemove', (e) => {
		const x = (e.offsetX - halfWidth) / scale.x;
		const y = (halfHeight - e.offsetY) / scale.y;

		points.forEach((p) => {
			if (p.dragging) {
				p.x = x;
				p.y = y;

				// console.log(points);
			}
		});

		draw();
	});

	/* main function */
	function draw() {
		/* set background */
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.restore();

		/* draw all points */
		points.forEach((p) => p.draw());

		/* draw some lines */
		ctx.save()
		ctx.strokeStyle = pointPrototype.color;
		ctx.beginPath();
		for (let i = 0; i < points.length; i++) {
			if (i == 0) {
				ctx.moveTo(points[i].x * scale.x, points[i].y * scale.y);
			} else {
				ctx.lineTo(points[i].x * scale.x, points[i].y * scale.y);
			}
		}
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	function init() {
		/* human coordinates */
		ctx.translate(halfWidth, halfHeight);
		ctx.scale(1.0, -1.0);

		/* setup some points */
		makeNewPoint(1, 0);
		makeNewPoint(0, 1);
		makeNewPoint(-1, 0);
		makeNewPoint(0, -1);

		/* let the show begin */
		draw();
	}

	/* start it all */
	init();
})();
