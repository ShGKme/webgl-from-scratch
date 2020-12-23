precision highp float;

uniform vec3 u_diffuse_color;
uniform samplerCube u_texture_diffuse;

varying vec3 v_uv;

void main() {
    gl_FragColor = textureCube(u_texture_diffuse, v_uv);
}