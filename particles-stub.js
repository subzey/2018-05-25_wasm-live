// ╔════╤════╤════╤════╦════╤════╤════╤════╦══┄
// ║  X │  Y │ dX │ dY ║  X │  Y │ dX │ dY ║  ...
// ╚════╧════╧════╧════╩════╧════╧════╧════╩══┄
// ├────┤
// float32

const PARTICLES_COUNT = 1000;

async function initState() {
	function fire(x, y) {
	}

	function physics() {
	}

	function buffer() {
	}

	return { fire, physics, buffer };
};

async function initView(canvas) {
	function render(f32a) {
	}

	function resize(width, height) {
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
