precision highp float;

// ---Attributes---
// Vertex position
attribute vec3 a_position;

// ---Main matrices---
uniform mat4 u_MVP;

// ---Outs to fragment shaders---
varying vec4 v_position;
varying vec3 v_uv;

void main() {
    //v_color = u_color;
    v_uv = vec3(-a_position.x, a_position.y, a_position.z);
    v_position = u_MVP * vec4(a_position, 1.0);
    gl_Position = u_MVP * vec4(a_position, 1.0);
}