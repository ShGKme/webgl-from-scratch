precision highp float;

attribute vec4 a_position;

uniform mat4 u_MVP;

varying vec3 v_uv;

void main() {
    v_uv = vec3(-a_position.x, a_position.y, a_position.z);
    gl_Position = u_MVP * a_position, 1.0;
}