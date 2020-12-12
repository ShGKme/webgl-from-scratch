precision highp float;

uniform vec3 u_diffuse_color;

void main() {
    gl_FragColor.rgb = u_diffuse_color;
}