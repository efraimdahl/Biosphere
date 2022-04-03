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
            vec4 NC0=vec4(0.0,157.0,113.0,270.0);
              vec4 NC1=vec4(1.0,158.0,114.0,271.0);
              //vec4 WS=vec4(10.25,32.25,15.25,3.25);
              vec4 WS=vec4(0.25,0.25,0.25,0.25);

              // mix noise for alive animation, full source
              vec4 hash4( vec4 n ) { return fract(sin(n)*1399763.5453123); }
              vec3 hash3( vec3 n ) { return fract(sin(n)*1399763.5453123); }
              vec3 hpos( vec3 n ) { return hash3(vec3(dot(n,vec3(157.0,113.0,271.0)),dot(n,vec3(271.0,157.0,113.0)),dot(n,vec3(113.0,271.0,157.0)))); }
              //vec4 hash4( vec4 n ) { return fract(n*fract(n*0.5453123)); }
              //vec4 hash4( vec4 n ) { n*=1.987654321; return fract(n*fract(n)); }
              float noise4q(vec4 x)
              {
                vec4 n3 = vec4(0,0.25,0.5,0.75);
                vec4 p2 = floor(x.wwww+n3);
                vec4 b = floor(x.xxxx+n3) + floor(x.yyyy+n3)*157.0 + floor(x.zzzz +n3)*113.0;
                vec4 p1 = b + fract(p2*0.00390625)*vec4(164352.0, -164352.0, 163840.0, -163840.0);
                p2 = b + fract((p2+1.0)*0.00390625)*vec4(164352.0, -164352.0, 163840.0, -163840.0);
                vec4 f1 = fract(x.xxxx+n3);
                vec4 f2 = fract(x.yyyy+n3);
                f1=f1*f1*(3.0-2.0*f1);
                f2=f2*f2*(3.0-2.0*f2);
                vec4 n1 = vec4(0,1.0,157.0,158.0);
                vec4 n2 = vec4(113.0,114.0,270.0,271.0);	
                vec4 vs1 = mix(hash4(p1), hash4(n1.yyyy+p1), f1);
                vec4 vs2 = mix(hash4(n1.zzzz+p1), hash4(n1.wwww+p1), f1);
                vec4 vs3 = mix(hash4(p2), hash4(n1.yyyy+p2), f1);
                vec4 vs4 = mix(hash4(n1.zzzz+p2), hash4(n1.wwww+p2), f1);	
                vs1 = mix(vs1, vs2, f2);
                vs3 = mix(vs3, vs4, f2);
                vs2 = mix(hash4(n2.xxxx+p1), hash4(n2.yyyy+p1), f1);
                vs4 = mix(hash4(n2.zzzz+p1), hash4(n2.wwww+p1), f1);
                vs2 = mix(vs2, vs4, f2);
                vs4 = mix(hash4(n2.xxxx+p2), hash4(n2.yyyy+p2), f1);
                vec4 vs5 = mix(hash4(n2.zzzz+p2), hash4(n2.wwww+p2), f1);
                vs4 = mix(vs4, vs5, f2);
                f1 = fract(x.zzzz+n3);
                f2 = fract(x.wwww+n3);
                f1=f1*f1*(3.0-2.0*f1);
                f2=f2*f2*(3.0-2.0*f2);
                vs1 = mix(vs1, vs2, f1);
                vs3 = mix(vs3, vs4, f1);
                vs1 = mix(vs1, vs3, f2);
                float r=dot(vs1,vec4(0.25));
                //r=r*r*(3.0-2.0*r);
                return r*r*(3.0-2.0*r);
              }

              // body of a star
              float noiseSpere(vec3 ray,vec3 pos,float r,mat3 mr,float zoom,vec3 subnoise,float anim)
              {
                  float b = dot(ray,pos);
                  float c = dot(pos,pos) - b*b;
                  
                  vec3 r1=vec3(0.0);
                  
                  float s=0.0;
                  float d=0.03125;
                  float d2=zoom/(d*d); 
                  float ar=5.0;
                
                  for (int i=0;i<3;i++) {
                  float rq=r*r;
                      if(c <rq)
                      {
                          float l1=sqrt(rq-c);
                          r1= ray*(b-l1)-pos;
                          r1=r1*mr;
                          s+=abs(noise4q(vec4(r1*d2+subnoise*ar,anim*ar))*d);
                      }
                      ar-=2.0;
                      d*=4.0;
                      d2*=0.0625;
                      r=r-r*0.02;
                  }
                  return s;
              }

              // glow ring
              float ring(vec3 ray,vec3 pos,float r,float size)
              {
                  float b = dot(ray,pos);
                  float c = dot(pos,pos) - b*b;
                
                  float s=max(0.0,(1.0-size*abs(r-sqrt(c))));
                  
                  return s;
              }

              // rays of a star
              float ringRayNoise(vec3 ray,vec3 pos,float r,float size,mat3 mr,float anim)
              {
                  float b = dot(ray,pos);
                  vec3 pr=ray*b-pos;
                    
                  float c=length(pr);

                  pr*=mr;
                  
                  pr=normalize(pr);
                  
                  float s=max(0.0,(1.0-size*abs(r-c)));
                  
                  float nd=noise4q(vec4(pr*1.0,-anim+c))*2.0;
                  nd=pow(nd,2.0);
                  float n=0.4;
                  float ns=1.0;
                  if (c>r) {
                      n=noise4q(vec4(pr*10.0,-anim+c));
                      ns=noise4q(vec4(pr*50.0,-anim*2.5+c*2.0))*2.0;
                  }
                  n=n*n*nd*ns;
                  
                  return pow(s,4.0)+s*s*n;
              }

              vec4 noiseSpace(vec3 ray,vec3 pos,float r,mat3 mr,float zoom,vec3 subnoise,float anim)
              {
                  float b = dot(ray,pos);
                  float c = dot(pos,pos) - b*b;
                  
                  vec3 r1=vec3(0.0);
                  
                  float s=0.0;
                  float d=0.0625*1.5;
                  float d2=zoom/d;

                float rq=r*r;
                  float l1=sqrt(abs(rq-c));
                  r1= (ray*(b-l1)-pos)*mr;

                  r1*=d2;
                  s+=abs(noise4q(vec4(r1+subnoise,anim))*d);
                  s+=abs(noise4q(vec4(r1*0.5+subnoise,anim))*d*2.0);
                  s+=abs(noise4q(vec4(r1*0.25+subnoise,anim))*d*4.0);
                  //return s;
                  return vec4(s*2.0,abs(noise4q(vec4(r1*0.1+subnoise,anim))),abs(noise4q(vec4(r1*0.1+subnoise*6.0,anim))),abs(noise4q(vec4(r1*0.1+subnoise*13.0,anim))));
              }

              float sphereZero(vec3 ray,vec3 pos,float r)
              {
                  float b = dot(ray,pos);
                  float c = dot(pos,pos) - b*b;
                  float s=1.0;
                  if (c<r*r) s=0.0;
                  return s;
              }

            void main() {
              vec2 p = vUv;
                vec4 fragColor;
                vec2 rotate = vec2(10,10);
                vec2 sins=sin(rotate);
                vec2 coss=cos(rotate);
                mat3 mr=mat3(vec3(coss.x,0.0,sins.x),vec3(0.0,1.0,0.0),vec3(-sins.x,0.0,coss.x));
                mr=mat3(vec3(1.0,0.0,0.0),vec3(0.0,coss.y,sins.y),vec3(0.0,-sins.y,coss.y))*mr;    
            
                mat3 imr=mat3(vec3(coss.x,0.0,-sins.x),vec3(0.0,1.0,0.0),vec3(sins.x,0.0,coss.x));
                imr=imr*mat3(vec3(1.0,0.0,0.0),vec3(0.0,coss.y,-sins.y),vec3(0.0,sins.y,coss.y));
              
                vec3 ray = normalize(vec3(p,2.0));
                vec3 pos = vec3(0.0,0.0,3.0);
                
                float s1=noiseSpere(ray,pos,1.0,mr,0.5,vec3(0.0),time);
                s1=pow(min(1.0,s1*2.4),2.0);
                float s2=noiseSpere(ray,pos,1.0,mr,4.0,vec3(83.23,34.34,67.453),time);
                s2=min(1.0,s2*2.2);
                fragColor = vec4( mix(vec3(1.0,1.0,0.0),vec3(1.0),pow(s1,60.0))*s1, 1.0 );
                fragColor += vec4( mix(mix(vec3(1.0,0.0,0.0),vec3(1.0,0.0,1.0),pow(s2,2.0)),vec3(1.0),pow(s2,10.0))*s2, 1.0 );
              
                fragColor.xyz -= vec3(ring(ray,pos,1.03,11.0))*2.0;
                fragColor = max( vec4(0.0), fragColor );
                
                float s3=ringRayNoise(ray,pos,0.96,1.0,mr,time);
                fragColor.xyz += mix(vec3(1.0,0.6,0.1),vec3(1.0,0.95,1.0),pow(s3,3.0))*s3;
            
                float zero=sphereZero(ray,pos,0.9);
                if (zero>0.0) {
                  vec4 s4=noiseSpace(ray,pos,100.0,mr,0.05,vec3(1.0,2.0,4.0),0.0);
                  s4.x=pow(s4.x,3.0);
                  fragColor.xyz += mix(mix(vec3(1.0,0.0,0.0),vec3(0.0,0.0,1.0),s4.y*1.9),vec3(0.9,1.0,0.1),s4.w*0.75)*s4.x*pow(s4.z*2.5,3.0)*0.2*zero;
                }
                
              fragColor = max( vec4(0.0), fragColor );
              fragColor = min( vec4(1.0), fragColor );
              gl_FragColor = fragColor;
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