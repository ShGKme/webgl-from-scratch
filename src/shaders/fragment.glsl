precision highp float;

// Матрица трансформации V
uniform mat4 u_V;

// Позиция, цвет и нормаль веришны из вершинного шейдера
varying vec4 v_position;
varying vec4 v_color;
varying vec3 v_normal;
varying vec2 v_uv;
varying vec3 v_ray; // Ray from light inversed
varying vec3 v_eye;

// Параметры освещения
uniform vec3 u_light_color;
uniform vec3 u_specular_color;
uniform vec3 u_ambient_color;
uniform vec3 u_light_position;
uniform float u_hardness;

// Прочие параметры
uniform int u_useAmbient;
uniform int u_useSpecular;
uniform int u_useDiffuse;
uniform int u_useWorldLight;

uniform vec4 u_color;

// Положение камеры
uniform vec3 u_camera_position;

uniform sampler2D u_texture_diffuse;
uniform sampler2D u_texture_specular;
uniform sampler2D u_texture_normal;

void main() {
    // Нормированная нормаль
    // vec3 normal = normalize(v_normal);
    vec3 normal = texture2D(u_texture_normal, v_uv).rgb;
    normal = normalize(normal * 2.0 - 1.0); // TODO ???
    // Положение источника света с учётом трансформации просмотра
//    vec3 light_position = (u_useWorldLight == 1) ? (u_V * vec4(u_light_position, 1)).xyz : u_light_position.xyz;
    // Положение камеры с учётом трансформации просмотра
//    vec3 camera_position = (u_V * vec4(u_camera_position, 1)).xyz;
//    light_position = camera_position;
    // Нормированный вектор от источника света к точке на поверхности
//     vec3 lightToPos = normalize(light_position - v_position.xyz);
    vec3 lightToPos = -v_ray; // l
    // Нормированный вектор отражения света от поверхности
    vec3 reflectedLight = reflect(lightToPos, normal); // r
    // Нормированный вектор от поверхности к камере
    // vec3 posToCamera = normalize(v_position.xyz - camera_position);
    vec3 posToCamera = normalize(v_eye); // e

    // Устанавливаем цвет
//     gl_FragColor = u_color;
    gl_FragColor = texture2D(u_texture_diffuse, v_uv);
    if (u_useDiffuse == 1) {
        vec3 diffuse = max(u_light_color * dot(-lightToPos, normal), 0.1);
        gl_FragColor.rgb += diffuse * gl_FragColor.rgb;
    }
    if (u_useSpecular == 1) {
        vec3 specular = u_specular_color * pow(max(dot(reflectedLight, posToCamera), 0.0), u_hardness);
        gl_FragColor.rgb += specular * texture2D(u_texture_specular, v_uv).rgb;
//        gl_FragColor.rgb += specular * vec3(1.0, 1.0, 1.0);
    }
    if (u_useAmbient == 1) {
        vec3 ambient = u_ambient_color;
        gl_FragColor.rgb += ambient;
    }
}