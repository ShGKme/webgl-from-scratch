precision highp float;

attribute vec4 a_position;
uniform mat4 u_MVP;


void main() {
    gl_Position = u_MVP * a_position;
}