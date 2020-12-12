precision highp float;

// Матрица трансформации V
uniform mat4 u_V;

// Позиция, цвет и нормаль веришны из вершинного шейдера
varying vec4 v_position;
varying vec3 v_normal;
varying vec2 v_uv;

// Параметры освещения
uniform vec3 u_diffuse_color;
uniform vec3 u_specular_color;
uniform vec3 u_ambient_color;
uniform vec3 u_light_position;
uniform float u_hardness;

// Прочие параметры
uniform int u_use_specular_texture;
uniform int u_use_diffuse_texture;

// Положение камеры
uniform vec3 u_camera_position;

uniform sampler2D u_texture_diffuse;
uniform sampler2D u_texture_specular;

void main() {
    // Нормированная нормаль
    vec3 normal = normalize(v_normal);
    // Положение источника света с учётом трансформации просмотра
    vec3 light_position = (u_V * vec4(u_light_position, 1)).xyz;
    // Положение камеры с учётом трансформации просмотра
    vec3 camera_position = (u_V * vec4(u_camera_position, 1)).xyz;
    //light_position = camera_position;
    vec3 lightToPos = normalize(light_position - v_position.xyz);
    vec3 reflectedLight = reflect(lightToPos, normal);
    vec3 posToCamera = normalize(v_position.xyz - camera_position);

    vec3 diffuse = max(vec3(1.0, 1.0, 1.0) * dot(lightToPos, normal), 0.1);
    if (u_use_diffuse_texture == 1) {
        gl_FragColor.rgb += diffuse * texture2D(u_texture_diffuse, v_uv).rgb;
    } else {
        gl_FragColor.rgb += diffuse * u_diffuse_color;
    }


    float specular = pow(max(dot(reflectedLight, posToCamera), 0.0), u_hardness);
    if (u_use_specular_texture == 1) {
        gl_FragColor.rgb += specular * texture2D(u_texture_specular, v_uv).rgb;
    } else {
        gl_FragColor.rgb += specular * u_specular_color;
    }

    gl_FragColor.rgb += u_ambient_color;
}