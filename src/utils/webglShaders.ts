/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const VERTEX_SHADER_SOURCE = `
  precision highp float;

  attribute vec2 a_posStart;
  attribute vec2 a_posEnd;
  attribute vec4 a_colorStart;
  attribute vec4 a_colorEnd;
  attribute float a_size;
  attribute float a_intensity;
  attribute float a_index;

  uniform mat3 u_transform;      // D3 Zoom transform matrix
  uniform vec2 u_resolution;     // Canvas width and height
  uniform float u_morphProgress; // [0, 1] lerp between start and end
  uniform float u_basePointSize; // Base particle diameter
  uniform float u_hoveredIndex;  // ID of hovered point (-1 if none)
  uniform float u_jitter;        // Noise jitter magnitude
  uniform float u_time;          // Animation time

  varying vec4 v_color;
  varying float v_intensity;
  varying float v_isHovered;

  // Simple pseudo-random hash for vertex jitter
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Interpolate positions between starting preset and target preset
    vec2 pos = mix(a_posStart, a_posEnd, u_morphProgress);

    // Apply procedural subtle jitter if enabled
    if (u_jitter > 0.001) {
      float h1 = hash(vec2(a_index, 1.0)) * 2.0 - 1.0;
      float h2 = hash(vec2(a_index, 2.0)) * 2.0 - 1.0;
      float freq = u_time * 2.0 + a_index * 0.05;
      pos.x += (sin(freq) * 0.7 + h1) * u_jitter * 2.5;
      pos.y += (cos(freq) * 0.7 + h2) * u_jitter * 2.5;
    }

    // Apply 2D D3 transform: [x, y, 1] * transform matrix
    vec3 transformed = u_transform * vec3(pos, 1.0);

    // Convert from screen pixel space [0, resolution] to WebGL clip space [-1, 1]
    vec2 clipSpace = (transformed.xy / u_resolution) * 2.0 - 1.0;
    // Flip Y to match standard Cartesian coordinates
    gl_Position = vec4(clipSpace.x, clipSpace.y, 0.0, 1.0);

    // Interpolate colors
    vec4 col = mix(a_colorStart, a_colorEnd, u_morphProgress);
    v_color = col;
    v_intensity = a_intensity;

    // Check if this point is currently hovered
    float isHover = abs(a_index - u_hoveredIndex) < 0.5 ? 1.0 : 0.0;
    v_isHovered = isHover;

    // Calculate screen point size with zoom scaling and hover emphasis
    float scaleFactor = u_transform[0][0]; // k zoom scale
    // Dampen zoom scaling so points don't explode when zoomed into 50x
    float clampedScale = pow(scaleFactor, 0.35);
    float pSize = u_basePointSize * a_size * clampedScale;

    if (isHover > 0.5) {
      pSize = max(pSize * 2.4, 20.0);
    }

    // Clamp point size to avoid hardware rendering anomalies
    gl_PointSize = clamp(pSize, 1.5, 64.0);
  }
`;

export const FRAGMENT_SHADER_SOURCE = `
  precision highp float;

  varying vec4 v_color;
  varying float v_intensity;
  varying float v_isHovered;

  uniform int u_colorMapMode; // 0=Original, 1=Viridis, 2=Plasma, 3=Turbo, 4=Spectral, 5=LaserCyan, 6=CyberAmber
  uniform int u_pointShape;   // 0=Circle, 1=Glow, 2=Disc, 3=Diamond, 4=Ring
  uniform float u_opacity;
  uniform float u_time;
  uniform float u_dimUnselected; // Dim points if lasso active

  // Polynomial Viridis colormap approximation
  vec3 colormapViridis(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c0 = vec3(0.2777, 0.0054, 0.3340);
    vec3 c1 = vec3(0.1050, 1.4046, 1.3845);
    vec3 c2 = vec3(-0.3308, 0.2148, 0.0950);
    vec3 c3 = vec3(-4.6342, -5.7291, -5.7708);
    vec3 c4 = vec3(6.2282, 5.0964, 5.4836);
    return c0 + t * (c1 + t * (c2 + t * (c3 + t * c4)));
  }

  // Plasma colormap
  vec3 colormapPlasma(float t) {
    t = clamp(t, 0.0, 1.0);
    return vec3(
      0.05 + 0.95 * sin(t * 3.14159 * 0.7 + 0.1),
      clamp(sin((t - 0.25) * 3.14159), 0.0, 0.95),
      0.55 + 0.45 * cos(t * 3.14159 * 0.9)
    );
  }

  // Turbo colormap approximation
  vec3 colormapTurbo(float x) {
    const vec4 kRedVec4 = vec4(0.13572138, 4.61539260, -42.66032258, 132.13108234);
    const vec4 kGreenVec4 = vec4(0.09140261, 2.19418839, 4.84296658, -14.18503333);
    const vec4 kBlueVec4 = vec4(0.10667330, 12.64194608, -60.58204836, 110.36276771);
    const vec2 kRedVec2 = vec2(-152.94239396, 59.28637943);
    const vec2 kGreenVec2 = vec2(4.27729857, 2.82956604);
    const vec2 kBlueVec2 = vec2(-89.90310912, 27.34824973);

    x = clamp(x, 0.0, 1.0);
    vec4 v4 = vec4(1.0, x, x * x, x * x * x);
    vec2 v2 = v4.zw * v4.z;

    return vec3(
      dot(v4, kRedVec4) + dot(v2, kRedVec2),
      dot(v4, kGreenVec4) + dot(v2, kGreenVec2),
      dot(v4, kBlueVec4) + dot(v2, kBlueVec2)
    );
  }

  // Spectral diverging colormap
  vec3 colormapSpectral(float t) {
    t = clamp(t, 0.0, 1.0);
    return vec3(
      clamp(1.5 - abs(4.0 * t - 3.0), 0.0, 1.0),
      clamp(1.5 - abs(4.0 * t - 2.0), 0.0, 1.0),
      clamp(1.5 - abs(4.0 * t - 1.0), 0.0, 1.0)
    );
  }

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    float alpha = 1.0;

    // Hovered point targeting animation
    if (v_isHovered > 0.5) {
      // Draw double pulse targeting ring around hovered point
      float ring = abs(dist - 0.38);
      float ringAlpha = smoothstep(0.08, 0.0, ring);
      float core = smoothstep(0.18, 0.05, dist);
      alpha = max(core, ringAlpha);
      vec3 highlightColor = vec3(1.0, 1.0, 0.9) + 0.3 * sin(u_time * 8.0);
      gl_FragColor = vec4(highlightColor, alpha * 0.98);
      return;
    }

    // Standard Point Shapes
    if (u_pointShape == 0) {
      // 0: Smooth Antialiased Circle
      if (dist > 0.5) discard;
      alpha = smoothstep(0.5, 0.38, dist);
    } else if (u_pointShape == 1) {
      // 1: Soft Radiant Glow Halo
      if (dist > 0.5) discard;
      alpha = exp(-dist * 5.2) * 1.25;
    } else if (u_pointShape == 2) {
      // 2: Sharp Crisp Disc
      if (dist > 0.5) discard;
      alpha = 1.0;
    } else if (u_pointShape == 3) {
      // 3: Diamond (Manhattan distance)
      float manhattan = abs(coord.x) + abs(coord.y);
      if (manhattan > 0.5) discard;
      alpha = smoothstep(0.5, 0.4, manhattan);
    } else if (u_pointShape == 4) {
      // 4: Holographic Ring
      if (dist > 0.5) discard;
      float ringDist = abs(dist - 0.32);
      alpha = smoothstep(0.12, 0.0, ringDist);
    }

    // Color mapping
    vec3 baseCol = v_color.rgb;
    if (u_colorMapMode == 1) {
      baseCol = colormapViridis(v_intensity);
    } else if (u_colorMapMode == 2) {
      baseCol = colormapPlasma(v_intensity);
    } else if (u_colorMapMode == 3) {
      baseCol = colormapTurbo(v_intensity);
    } else if (u_colorMapMode == 4) {
      baseCol = colormapSpectral(v_intensity);
    } else if (u_colorMapMode == 5) {
      // Laser Cyan Phosphor
      baseCol = vec3(0.05, 0.75 + v_intensity * 0.25, 0.95);
    } else if (u_colorMapMode == 6) {
      // Cyber Amber Telemetry
      baseCol = vec3(0.98, 0.62 + v_intensity * 0.35, 0.12);
    }

    float finalAlpha = alpha * u_opacity * v_color.a;
    if (u_dimUnselected > 0.5) {
      finalAlpha *= 0.15;
    }

    gl_FragColor = vec4(baseCol, finalAlpha);
  }
`;

/**
 * Compiles a GLSL shader with error check
 */
export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Links vertex and fragment shader into a program
 */
export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}
