const filename = process.argv[2];

try {
	const source = require('fs').readFileSync(filename).toString('utf-8');
	const wasmModule = require('wabt').parseWat(filename, source);
	wasmModule.resolveNames();
	wasmModule.validate();
	const { buffer, log } = wasmModule.toBinary({ log: true });
	console.log(log);
	require('fs').writeFileSync(filename.replace(/\.[^.]*$/, '') + '.wasm', buffer);
} catch (e) {
	console.error(e.message);
	process.exitCode = process.exitCode || 1;
}
