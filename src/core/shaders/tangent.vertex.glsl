precision highp float;

// ---Attributes---
// Vertex position
attribute vec4 a_position;
// Vertex normal
attribute vec3 a_normal;
// Vertex UV texture coordinate
attribute vec2 a_uv;
// Vertex tangent coordinate
attribute vec3 a_tangent;

// ---Main matrices---
uniform mat4 u_MVP;
uniform mat4 u_MV;
uniform mat4 u_M;
uniform mat4 u_V;
uniform mat4 u_P;
// Normal matrix
uniform mat4 u_MV1T;

uniform vec3 u_light_position;
uniform vec3 u_camera_position;

varying vec4 v_position;
varying vec3 v_normal;
varying vec2 v_uv;

varying vec3 v_ray;
varying vec3 v_eye;

mat3 inverse(mat3 m) {
    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

    float b01 = a22 * a11 - a12 * a21;
    float b11 = -a22 * a10 + a12 * a20;
    float b21 = a21 * a10 - a11 * a20;

    float det = a00 * b01 + a01 * b11 + a02 * b21;

    return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
    b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
    b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
}

mat3 transpose(mat3 m) {
    return mat3(m[0][0], m[1][0], m[2][0],
    m[0][1], m[1][1], m[2][1],
    m[0][2], m[1][2], m[2][2]);
}

void main() {
    v_uv = a_uv;

    v_normal = mat3(u_MV1T) * a_normal;

    v_position = u_MV * a_position;

    mat3 n_mat = transpose(inverse(mat3(u_M)));

    vec4 pos = vec4(vec3(a_position), 1.0);
    vec3 binormal = normalize(cross(a_normal, a_tangent));
    mat3 intbn = inverse(mat3(u_MV1T) * mat3(a_tangent, binormal, a_normal));
    vec3 vPos = intbn * (u_MV * pos).xyz;
    v_ray = normalize(intbn * vec4(u_light_position, 1.0).xyz - vPos);
    v_eye = normalize(intbn * vec4(u_camera_position, 1.0).xyz - vPos);

    gl_Position = u_MVP * a_position;
}