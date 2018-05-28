// ╔════╤════╤════╤════╦════╤════╤════╤════╦══┄
// ║  X │  Y │ dX │ dY ║  X │  Y │ dX │ dY ║  ...
// ╚════╧════╧════╧════╩════╧════╧════╧════╩══┄
// ├────┤
// float32

const PARTICLES_COUNT = 20000;

async function initState() {
	const f32a = new Float32Array(PARTICLES_COUNT * 4);

	function fire(x, y) {
		const len = PARTICLES_COUNT * 4;
		for (let ptr = 0; ptr < len; ptr += 4) {
			f32a[ptr] = x;
			f32a[ptr + 1] = y;
			// f32a[ptr + 2] = Math.random() * 40 - 20;
			// f32a[ptr + 3] = Math.random() * 40 - 20;
			const amplitude = Math.sqrt(Math.random()) * 20;
			const angle = Math.random() * Math.PI * 2;
			f32a[ptr + 2] = Math.cos(angle) * amplitude;
			f32a[ptr + 3] = Math.sin(angle) * amplitude;
		}
	}

	function physics() {
		const len = PARTICLES_COUNT * 4;
		for (let ptr = 0; ptr < len; ptr += 4) {
			f32a[ptr] += f32a[ptr + 2];
			f32a[ptr + 1] += f32a[ptr + 3];
			f32a[ptr + 3] += 0.25;
		}
	}

	function buffer() {
		return f32a;
	}

	return { fire, physics, buffer };
};

async function initView(canvas) {
	const ctx = canvas.getContext('2d')

	function render(f32a) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#ffffff';
		ctx.save();
		ctx.translate(canvas.width / 2, canvas.height / 2);

		const len = PARTICLES_COUNT * 4;
		for (let ptr = 0; ptr < len; ptr += 4) {
			ctx.fillRect(
				f32a[ptr], f32a[ptr + 1],
				2, 2
			)
		}

		ctx.restore();
	}

	function resize(width, height) {
		canvas.width = width;
		canvas.height = height;
	}

	return { render, resize }
}

async function main() {
	const canvas = document.body.appendChild(document.createElement('canvas'));
	const [ state, view ] = await Promise.all([
		initState(),
		initView(canvas),
	]);

	function onresize() {
		view.resize(canvas.clientWidth, canvas.clientHeight);
	}

	function onclick(e) {
		state.fire(
			e.offsetX - canvas.clientWidth / 2,
			e.offsetY - canvas.clientHeight / 2
		);
	}

	canvas.addEventListener('click', onclick);
	window.addEventListener('resize', onresize);
	onresize();

	(function frame() {
		state.physics();
		view.render(state.buffer());
		requestAnimationFrame(frame);
	})();
}

main();
