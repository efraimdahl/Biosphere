import glsl from "babel-plugin-glsl/macro";
import * as THREE from "three";
import { extend} from "@react-three/fiber";


class WaveShaderMaterial extends THREE.ShaderMaterial {
    //Uniform
    constructor() {
      super({
        defines: { ITERATIONS: '20', OCTIVES: '3' },
        uniforms: {
          color: new THREE.Color(0.0, 0.0, 0.0),
          time: { type: 'f', value: 0.0 },
          tex: {type:'t',value:0.0}
        },
        
        vertexShader: glsl`
                precision mediump float;
                varying vec2 vUv;
                varying float vWave;
                uniform float time;
                #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
                void main() {
                  vUv = uv;
                  vec3 pos = position;
                  float noiseFreq = 1.0;
                  float noiseAmp = 0.16;
                  //float rannum = fract(sin(dot(vec2(10,200), vec2(12.9898, 78.233))) * 43758.5453);
                  vec3 noisePos = vec3(pos.x, pos.y* noiseFreq *time, pos.z);
                  pos.z += snoise3(noisePos) * noiseAmp;
                  vWave = pos.z;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);  
                }`,
        //Fragment Shader
        fragmentShader: glsl`
            precision mediump float;
            varying vec2 vUv;
            uniform float time;
            void main() {
              vec2 uv = vUv;
              vec3 col = vec4(uv,0.5+0.5*sin(time),1.0).xyz;
              vec3 texcol;
              vec2 center = vec2(0.5,0.5);
              vec2 go = vec2((center.x-uv.x),(center.y-uv.y) * 0.5);
              //float r = -sqrt(x*x + y*y); //uncoment this line to symmetric ripples
              float r = -(go.x + go.y);
              float z = 1.0 + 0.5*sin((r+time*0.4)/0.013);
              texcol.x = z;
              texcol.y = z;
              texcol.z = z;
	            gl_FragColor = vec4(col*texcol,1.0);
            }`,
      })
    }
  }
  


  
  extend({ WaveShaderMaterial })
      
  class FireMaterial extends THREE.ShaderMaterial {
    constructor() {
      super({
        defines: { ITERATIONS: '20', OCTIVES: '3' },
        uniforms: {
          fireTex: { type: 't', value: null },
          color: { type: 'c', value: null },
          time: { type: 'f', value: 0.0 },
          seed: { type: 'f', value: 0.0 },
          invModelMatrix: { type: 'm4', value: null },
          scale: { type: 'v3', value: null },
          noiseScale: { type: 'v4', value: new THREE.Vector4(1, 2, 1, 0.3) },
          magnitude: { type: 'f', value: 2.5 },
          lacunarity: { type: 'f', value: 3.0 },
          gain: { type: 'f', value: 0.6 }
        },
        vertexShader: `
          varying vec3 vWorldPos;
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          }`,
        fragmentShader: glsl`
          #pragma glslify: snoise = require(glsl-noise/simplex/3d.glsl) 
  
          uniform vec3 color;
          uniform float time;
          uniform float seed;
          uniform mat4 invModelMatrix;
          uniform vec3 scale;
          uniform vec4 noiseScale;
          uniform float magnitude;
          uniform float lacunarity;
          uniform float gain;
          uniform sampler2D fireTex;
          varying vec3 vWorldPos;              
  
          float turbulence(vec3 p) {
            float sum = 0.0;
            float freq = 1.0;
            float amp = 1.0;
            for(int i = 0; i < OCTIVES; i++) {
              sum += abs(snoise(p * freq)) * amp;
              freq *= lacunarity;
              amp *= gain;
            }
            return sum;
          }
  
          vec4 samplerFire (vec3 p, vec4 scale) {
            vec2 st = vec2(sqrt(dot(p.xz, p.xz)), p.y);
            if(st.x <= 0.0 || st.x >= 1.0 || st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);
            p.y -= (seed + time) * scale.w;
            p *= scale.xyz;
            st.y += sqrt(st.y) * magnitude * turbulence(p);
            if(st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);
            return texture2D(fireTex, st);
          }
  
          vec3 localize(vec3 p) {
            return (invModelMatrix * vec4(p, 1.0)).xyz;
          }
  
          void main() {
            vec3 rayPos = vWorldPos;
            vec3 rayDir = normalize(rayPos - cameraPosition);
            float rayLen = 0.0288 * length(scale.xyz);
            vec4 col = vec4(0.0);
            for(int i = 0; i < ITERATIONS; i++) {
              rayPos += rayDir * rayLen;
              vec3 lp = localize(rayPos);
              lp.y += 0.5;
              lp.xz *= 2.0;
              col += samplerFire(lp, noiseScale);
            }
            col.a = col.r;
            gl_FragColor = col;
          }`
      })
    }
  }
  
  extend({ FireMaterial })

/*
function Fire({ color, ...props }) {
    const ref = useRef()
    const texture = useLoader(THREE.TextureLoader, fireImg)
    useFrame((state) => {
      const invModelMatrix = ref.current.material.uniforms.invModelMatrix.value
      ref.current.updateMatrixWorld()
      invModelMatrix.copy(ref.current.matrixWorld).invert()
      ref.current.material.uniforms.time.value = state.clock.elapsedTime
      ref.current.material.uniforms.invModelMatrix.value = invModelMatrix
      ref.current.material.uniforms.scale.value = ref.current.scale
    })
    useLayoutEffect(() => {
      texture.magFilter = texture.minFilter = THREE.LinearFilter
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
      ref.current.material.uniforms.fireTex.value = texture
      ref.current.material.uniforms.color.value = color || new THREE.Color(0xeeeeee)
      ref.current.material.uniforms.invModelMatrix.value = new THREE.Matrix4()
      ref.current.material.uniforms.scale.value = new THREE.Vector3(1, 1, 1)
      ref.current.material.uniforms.seed.value = Math.random() * 19.19
    }, [])
    return (
      <mesh ref={ref} {...props}>
        <boxGeometry />
        <fireMaterial transparent depthWrite={false} depthTest={false} />
      </mesh>
    )
  }

  class WaveShaderMaterial extends THREE.ShaderMaterial {
    //Uniform
    constructor() {
      super({
        defines: { ITERATIONS: '20', OCTIVES: '3' },
        uniforms: {
          color: new THREE.Color(0.0, 0.0, 0.0),
          time: { type: 'f', value: 0.0 },
        },
        vertexShader: glsl`
                precision mediump float;
                varying vec2 vUv;
                varying float vWave;
                uniform float time;
                #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
                void main() {
                  vUv = uv;
                  vec3 pos = position;
                  float noiseFreq = 2.0;
                  float noiseAmp = 0.4;
                  //float rannum = fract(sin(dot(vec2(10,200), vec2(12.9898, 78.233))) * 43758.5453);
                  vec3 noisePos = vec3(pos.x * noiseFreq *time, pos.y, pos.z);
                  pos.z += snoise3(noisePos) * noiseAmp;
                  vWave = pos.z;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);  
                }`,
        //Fragment Shader
        fragmentShader: glsl`
            precision mediump float;
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            void main(){
              //vec3 pos = position;
              vec3 colors = vec3(1,0,0)*(sin(time)+1.0);
              gl_FragColor = vec4(colors,1.0);
            }`,
      })
    }
  }
  
  fragmentShader: glsl`
            precision mediump float;
            varying vec2 vUv;
            uniform float time;
            void main() {
              vec2 uv = vUv;
              float cb = floor((uv.x + time) * 40.);
              vec3 color = vec3(0.0,0.0,1.0);
              vec2 cp = -1.0 + 2.0 * uv.xy;
              float cl = length(cp);
              vec2 change = uv + (cp / cl) * cos(cl * 12.0 - time * 4.0) * 0.02;
              color.x += change.x;
              color.y += change.y;  
              gl_FragColor = vec4(color,1.);
            }`,
  */
    

  export default {WaveShaderMaterial,FireMaterial}