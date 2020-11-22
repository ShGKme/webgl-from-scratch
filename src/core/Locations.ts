export type Locations =
  | 'a_position'
  | 'a_uv'
  | 'a_normal'
  | 'a_tangent'
  | 'u_color'
  | 'u_M'
  | 'u_V'
  | 'u_P'
  | 'u_MV'
  | 'u_MVP'
  | 'u_MV1T'
  | 'u_light_position'
  | 'u_light_color'
  | 'u_specular_color'
  | 'u_ambient_color'
  | 'u_camera_position'
  | 'u_useAmbient'
  | 'u_useSpecular'
  | 'u_useDiffuse'
  | 'u_useWorldLight'
  | 'u_hardness'
  | 'u_texture_diffuse'
  | 'u_texture_specular'
  | 'u_texture_normal';

export type LocationsMap = { [P in Locations]?: number };