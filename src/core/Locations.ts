export type Locations =
  | 'a_position'
  | 'a_uv'
  | 'a_normal'
  | 'a_tangent'
  | 'u_M'
  | 'u_V'
  | 'u_P'
  | 'u_MV'
  | 'u_MVP'
  | 'u_MV1T'
  | 'u_light_position'
  | 'u_diffuse_color'
  | 'u_specular_color'
  | 'u_ambient_color'
  | 'u_camera_position'
  | 'u_use_specular_texture'
  | 'u_use_diffuse_texture'
  | 'u_hardness'
  | 'u_texture_diffuse'
  | 'u_texture_specular'
  | 'u_texture_normal';

export type LocationsMap = { [P in Locations]?: number };
