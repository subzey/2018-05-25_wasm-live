// ╔════╤════╤════╤════╦════╤════╤════╤════╦══┄
// ║  X │  Y │ dX │ dY ║  X │  Y │ dX │ dY ║  ...
// ╚════╧════╧════╧════╩════╧════╧════╧════╩══┄
// ├────┤
// float32

const PARTICLES_COUNT = 200000;

async function initState() {
	const res = await WebAssembly.instantiateStreaming(
		fetch('physics.wasm'),
		{
			Math,
			conf: { count: PARTICLES_COUNT }
		}
	);
	const exports = res.instance.exports;
	console.groupCollapsed('wasm');
	console.log(res);
	console.groupEnd();
	return {
		fire: exports.fire,
		physics: exports.physics,
		buffer: () => exports.mem.buffer,
	};
};


async function _getShader(url, gl, flavor) {
	const resp = await fetch(url);
	const source = await resp.text();
	const shader = gl.createShader(flavor);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	console.groupCollapsed(url);
	console.log(source);
	console.log(gl.getShaderInfoLog(shader));
	console.groupEnd();
	return shader;
}

async function initView(canvas) {
	const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.clearColor(0, 0, 0, 1);

	const [vert, frag] = await Promise.all([
		_getShader('vert.glsl', gl, gl.VERTEX_SHADER),
		_getShader('frag.glsl', gl, gl.FRAGMENT_SHADER),
	]);

	const program = gl.createProgram();
	gl.attachShader(program, vert);
	gl.attachShader(program, frag);
	gl.linkProgram(program);

	function render(buffer) {
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(program);
		{
			const attribLocation = gl.getAttribLocation(program, 'scale');
			gl.disableVertexAttribArray(attribLocation);
			gl.vertexAttrib2f(attribLocation, 2 / canvas.width, -2 / canvas.height);
		}
		{
			const attribLocation = gl.getAttribLocation(program, 'coord');
			gl.enableVertexAttribArray(attribLocation);
			gl.vertexAttribPointer(
				attribLocation, // index
				2, // size (X and Y)
				gl.FLOAT, // float32 each
				false, // normalized. Has no effect on float
				16, // stride
				0 // start index
			);
		}
		gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.POINTS, 0, PARTICLES_COUNT);
	}

	function resize(width, height) {
		canvas.width = width;
		canvas.height = height;
		gl.viewport(0, 0, width, height);
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
		state.fire(e.offsetX - canvas.clientWidth / 2, e.offsetY - canvas.clientHeight / 2);
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
