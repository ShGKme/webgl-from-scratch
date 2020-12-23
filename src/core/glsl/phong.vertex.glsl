precision highp float;

// ---Attributes---
// Vertex position
attribute vec4 a_position;
// Vertex normal
attribute vec3 a_normal;
// Vertex UV texture coordinate
attribute vec2 a_uv;

// ---Main matrices---
uniform mat4 u_MVP;
uniform mat4 u_MV;
// Normal matrix
uniform mat4 u_MV1T;

uniform vec3 u_light_position;
uniform vec3 u_camera_position;

// ---Outs to fragment glsl---
varying vec4 v_position;
varying vec3 v_normal;
varying vec2 v_uv;

void main() {
    v_position = u_MV * a_position;
    v_normal = mat3(u_MV1T) * a_normal;
    v_uv = a_uv;

    gl_Position = u_MVP * a_position;
}