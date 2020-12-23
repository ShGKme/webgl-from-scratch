precision highp float;

uniform mat4 u_V;

varying vec4 v_position;
varying vec4 v_color;
varying vec3 v_normal;
varying vec2 v_uv;
varying vec3 v_ray;
varying vec3 v_eye;

uniform vec3 u_diffuse_color;
uniform vec3 u_specular_color;
uniform vec3 u_ambient_color;
uniform vec3 u_light_position;
uniform float u_hardness;

uniform int u_use_specular_texture;
uniform int u_use_diffuse_texture;

uniform vec3 u_camera_position;

uniform sampler2D u_texture_diffuse;
uniform sampler2D u_texture_specular;
uniform sampler2D u_texture_normal;

void main() {
    vec3 normal = texture2D(u_texture_normal, v_uv).rgb;
    normal = normalize(normal * 2.0 - 1.0);

    vec3 lightToPos = -v_ray; // l
    vec3 reflectedLight = reflect(lightToPos, normal); // r
    vec3 posToCamera = normalize(v_eye); // e


    gl_FragColor = texture2D(u_texture_diffuse, v_uv);
    if (u_use_diffuse_texture == 1) {
        vec3 diffuse = max(u_diffuse_color * dot(lightToPos, normal), 0.1);
        gl_FragColor.rgb += diffuse * gl_FragColor.rgb;
    }
    if (u_use_specular_texture == 1) {
        vec3 specular = u_specular_color * pow(max(dot(reflectedLight, posToCamera), 0.0), u_hardness);
        gl_FragColor.rgb += specular * texture2D(u_texture_specular, v_uv).rgb;
    }

    vec3 ambient = u_ambient_color;
    gl_FragColor.rgb += ambient;
}