precision lowp float;

attribute vec2 coord;
attribute vec2 scale;

void main() {
	gl_Position = vec4(
		coord.x * scale.x,
		coord.y * scale.y,
		0,
		1
	);
	gl_PointSize = 2.0;
}
