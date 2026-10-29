import { AdditiveBlending, Color, ShaderMaterial } from 'three'

export const SHAPE_COUNT = 5
/** Morph-target attribute names for shapes 1..n (shape 0 is `position`). */
export const SHAPE_ATTRIBUTES = Array.from({ length: SHAPE_COUNT - 1 }, (_, i) => `aShape${i + 1}`)

const POINT_SIZE = 42
const COLOR_A = '#22d3ee'
const COLOR_B = '#a78bfa'
const COLOR_PULSE = '#f0f9ff'

const blend = SHAPE_ATTRIBUTES.map((name, i) => ` + ${name} * uWeights[${i + 1}]`).join('')

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWeights[${SHAPE_COUNT}];
  uniform float uSize;
  uniform float uPixelRatio;
  ${SHAPE_ATTRIBUTES.map((name) => `attribute vec3 ${name};`).join('\n  ')}
  attribute float aLayer;
  attribute float aRandom;
  varying float vPulse;
  varying float vRandom;

  void main() {
    vec3 p = position * uWeights[0]${blend};

    // Slow per-particle drift keeps every shape feeling alive.
    float seed = aRandom * 40.0;
    p += 0.03 * vec3(sin(uTime * 0.8 + seed), cos(uTime * 0.7 + seed * 0.7), sin(uTime * 0.6 + seed * 0.5));

    // Activation wave travelling through the network layers (only visible in the network shape).
    float wave = mod(uTime * 1.6, 6.5) - 0.75;
    vPulse = exp(-pow(aLayer - wave, 2.0) * 3.0) * uWeights[0];
    vRandom = aRandom;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.5 + aRandom * 0.8 + vPulse * 1.4) / -mv.z;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorPulse;
  varying float vPulse;
  varying float vRandom;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    vec3 color = mix(mix(uColorA, uColorB, vRandom), uColorPulse, clamp(vPulse, 0.0, 1.0));
    gl_FragColor = vec4(color, glow * (0.5 + vPulse * 0.5));
  }
`

export function createParticleMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uWeights: { value: [1, ...Array<number>(SHAPE_COUNT - 1).fill(0)] },
      uSize: { value: POINT_SIZE },
      uPixelRatio: { value: 1 },
      uColorA: { value: new Color(COLOR_A) },
      uColorB: { value: new Color(COLOR_B) },
      uColorPulse: { value: new Color(COLOR_PULSE) },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
}
