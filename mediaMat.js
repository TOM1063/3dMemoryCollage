import * as THREE from "https://unpkg.com/three@0.130.1/build/three.module.js";

// export const generateMediaMat = (
//   video_texture,
//   image_texture,
//   textureSize,
//   windowSize,
//   pix_ratio,
//   time
// ) => {
//   console.log(windowSize);
//   console.log(textureSize);
//   let glsl_mat = new THREE.ShaderMaterial({
//     lights: {
//       value: true,
//     },
//     transparent: true,
//     uniforms: {
//       uTime: { value: time },
//       uVidTex: { type: "t", value: video_texture },
//       uImgTex: { type: "t", value: image_texture }, // テスクチャを uTex として渡す
//       uWindowSizeX: { value: windowSize.width },
//       uWindowSizeY: { value: windowSize.height },
//       uTexSizeX: { value: textureSize.width },
//       uTexSizeY: { value: textureSize.height },
//       uColorFactor: { value: 1.0 },
//       uNormalFactor: { value: 0.0 },
//       uPixRatio: { value: pix_ratio },
//     },
//     vertexShader: `
//               varying float vDotProduct;

//               void main() {
//                   vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
//                   vec3 norm = normalize(normalMatrix * normal);
//                   vDotProduct = dot(norm, normalize(- viewPosition.xyz));
//                   vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
//                   vec4 mvPosition =  viewMatrix * worldPosition;
//                   gl_Position = projectionMatrix * mvPosition;
//               }
//               `,
//     fragmentShader: `
//               varying float vDotProduct;

//               #include <common>
//               #include <lights_pars_begin>

//               // precision mediump float;
//               uniform sampler2D uVidTex[1];
//               uniform sampler2D uImgTex[4];
//               uniform float uWindowSizeX;
//               uniform float uWindowSizeY;
//               uniform float uTexSizeX;
//               uniform float uTexSizeY;
//               uniform float uColorFactor;
//               uniform float uNormalFactor;
//               uniform float uPixRatio;
//               uniform float uTime;

//               float random (in vec2 st) {
//                 return fract(sin(dot(st.xy,vec2(12.9898,78.233)))* 43758.5453123);
//               }

//               float noise (in vec2 st) {
//                 vec2 i = floor(st);
//                 vec2 f = fract(st);

//                 // Four corners in 2D of a tile
//                 float a = random(i);
//                 float b = random(i + vec2(1.0, 0.0));
//                 float c = random(i + vec2(0.0, 1.0));
//                 float d = random(i + vec2(1.0, 1.0));

//                 // Smooth Interpolation

//                 // Cubic Hermine Curve.  Same as SmoothStep()
//                 vec2 u = f*f*(3.0-2.0*f);
//                 // u = smoothstep(0.,1.,f);

//                 // Mix 4 coorners percentages
//                 return mix(a, b, u.x) +
//                         (c - a)* u.y * (1.0 - u.x) +
//                         (d - b) * u.x * u.y;
//               }

//               void main() {
//                 // float opacity = (1.0 - abs(vDotProduct))*4.0;
//                 float opacity = 1.0;
//                 if(uNormalFactor == 1.0) {
//                   opacity = (abs(vDotProduct)*2.0 - 1.0)*(1.0 - uColorFactor) + uColorFactor;
//                 }
//                 vec2 textureSize = vec2(uTexSizeX,uTexSizeY);
//                 vec2 windowSize = vec2(uWindowSizeX, uWindowSizeY);
//                 float textureAspect = textureSize.x / textureSize.y;
//                 float windowAspect = windowSize.x / windowSize.y;

//                 float repeatx = 1.0;
//                 float repeaty = 1.0;
//                 float offsetx = 0.0;
//                 float offsety = 0.0;

//                 if(windowAspect < textureAspect) {
//                     repeatx = windowAspect / textureAspect;
//                     offsetx = (1.0 - repeatx) / 2.0;
//                 }
//                 else {
//                     repeaty = textureAspect / windowAspect;
//                     offsety = (1.0 - repeaty) / 2.0;
//                 }

//                 if(false) {
//                   repeatx *= 2.0/3.0;
//                   repeaty *= 2.0/3.0;

//                 }

//                 // offsety += noise(vec2(1.0,uTime));
//                 // offsetx += noise(vec2(10.0,uTime));

//                 vec2 screenUVs = vec2(((gl_FragCoord.x/uPixRatio) / uWindowSizeX) * repeatx + offsetx, ((gl_FragCoord.y/uPixRatio)/uWindowSizeY)*repeaty + offsety);
//                 //screenUVs = vec2(clamp(screenUVs.x, 0.0, 1.0),clamp(screenUVs.y, 0.0, 1.0));

//                 vec3 texture_color = texture2D( uVidTex[0],  screenUVs).rgb;
//                 vec3 img_texture_color = texture2D( uImgTex[0],  screenUVs).rgb;
//                 //texture_color += img_texture_color;

//                 vec3 color = vec3(texture_color.b, texture_color.b, 1.0);
//                 //vec3 color = vec3(1.0, texture_color.r, texture_color.r);
//                 if(uNormalFactor == 1.0) {
//                   color = vec3(texture_color.b * (1.0 - uColorFactor)  + texture_color.r* uColorFactor, texture_color.b * (1.0 - uColorFactor)  + texture_color.g* uColorFactor, 1.0 * (1.0 - uColorFactor)  + texture_color.b* uColorFactor);
//                   //color = vec3( 1.0 * (1.0 - uColorFactor)  + texture_color.r* uColorFactor ,(1.0 - texture_color.r) * (1.0 - uColorFactor)  + texture_color.g* uColorFactor, (1.0 - texture_color.r) * (1.0 - uColorFactor)  + texture_color.b* uColorFactor);
//                 }

//                 // if (screenUVs.x < 0.0 || screenUVs.x > 1.0 || screenUVs.y < 0.0 || screenUVs.y > 1.0) {
//                 //   color = vec3(1.0, 1.0, 1.0);
//                 // }

//                 gl_FragColor = vec4(color.rgb,opacity);
//               }
//               `,
//   });

//   //let debug_mat = new THREE.MeshLambertMaterial();
//   return glsl_mat;
// };

export const generateMediaMat = (
  video_texture,
  image_texture,
  textureSize,
  windowSize,
  pix_ratio,
  time
) => {
  console.log(windowSize);
  console.log(textureSize);
  let glsl_mat = new THREE.ShaderMaterial({
    lights: {
      value: true,
    },
    transparent: true,
    uniforms: {
      uTime: { value: time },
      uVidTex: { type: "t", value: video_texture },
      uImgTex: { type: "t", value: image_texture }, // テスクチャを uTex として渡す
      uWindowSizeX: { value: windowSize.width },
      uWindowSizeY: { value: windowSize.height },
      uTexSizeX: { value: textureSize.width },
      uTexSizeY: { value: textureSize.height },
      uColorFactor: { value: 1.0 },
      uNormalFactor: { value: 0.0 },
      uPixRatio: { value: pix_ratio },
    },
    vertexShader: `
              varying float vDotProduct;
  
              void main() {
                  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
                  vec3 norm = normalize(normalMatrix * normal);
                  vDotProduct = dot(norm, normalize(- viewPosition.xyz));
                  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                  vec4 mvPosition =  viewMatrix * worldPosition;
                  gl_Position = projectionMatrix * mvPosition;
              }
              `,
    fragmentShader: `
              varying float vDotProduct;
  
              #include <common>
              #include <lights_pars_begin>
  
              // precision mediump float;
              uniform sampler2D uVidTex[1];
              uniform sampler2D uImgTex[4];
              uniform float uWindowSizeX;
              uniform float uWindowSizeY;
              uniform float uTexSizeX;
              uniform float uTexSizeY;
              uniform float uColorFactor;
              uniform float uNormalFactor;
              uniform float uPixRatio;
              uniform float uTime;

              float random (in vec2 st) {
                return fract(sin(dot(st.xy,vec2(12.9898,78.233)))* 43758.5453123);
              }

              float noise (in vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
            
                // Four corners in 2D of a tile
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
            
                // Smooth Interpolation
            
                // Cubic Hermine Curve.  Same as SmoothStep()
                vec2 u = f*f*(3.0-2.0*f);
                // u = smoothstep(0.,1.,f);
            
                // Mix 4 coorners percentages
                return mix(a, b, u.x) +
                        (c - a)* u.y * (1.0 - u.x) +
                        (d - b) * u.x * u.y;
              }
  
              void main() {
                // float opacity = (1.0 - abs(vDotProduct))*4.0;
                float opacity = 1.0;
                if(uNormalFactor == 1.0) {
                  opacity = (abs(vDotProduct)*2.0 - 1.0)*(1.0 - uColorFactor) + uColorFactor;
                }
                vec2 textureSize = vec2(uTexSizeX,uTexSizeY);
                vec2 windowSize = vec2(uWindowSizeX, uWindowSizeY);
                float textureAspect = textureSize.x / textureSize.y;
                float windowAspect = windowSize.x / windowSize.y;

                float repeatx = 1.0;
                float repeaty = 1.0;
                float offsetx = 0.0;
                float offsety = 0.0;

                if(windowAspect < textureAspect) {
                    repeatx = windowAspect / textureAspect;
                    offsetx = (1.0 - repeatx) / 2.0;
                }
                else {
                    repeaty = textureAspect / windowAspect;
                    offsety = (1.0 - repeaty) / 2.0;
                }

                if(false) {
                  repeatx *= 2.0/3.0;
                  repeaty *= 2.0/3.0;
                }

                // offsety += noise(vec2(1.0,uTime));
                // offsetx += noise(vec2(10.0,uTime));

                vec3 texture_color;

                vec2 screenUVs = vec2(((gl_FragCoord.x/uPixRatio) / uWindowSizeX) * repeatx + offsetx, ((gl_FragCoord.y/uPixRatio)/uWindowSizeY)*repeaty + offsety);
                //screenUVs = vec2(clamp(screenUVs.x, 0.0, 1.0),clamp(screenUVs.y, 0.0, 1.0));

                float time_factor = 0.2;
                float a1 =  fract(uTime*time_factor);
                float b1 = fract(uTime*time_factor + 0.5);

                float a2 =  1.0 - fract(uTime);
                float b2 = 1.0 - fract(uTime + 0.5);


                vec2 refUV;

                refUV.t = fract(screenUVs.t*2.0);
                refUV.s = fract(screenUVs.s* 2.0 + (1.0 - 2.0 * floor(screenUVs.t*2.0)) * uTime*0.05);

                texture_color = texture2D(uImgTex[0],refUV).rgb;


                // //下の段
                // if(screenUVs.y < 0.5) {
                //   if(b1 > a1) {
                //     if(a1 < 0.0) {
                //       texture_color = texture2D(uImgTex[0], screenUVs*2.0 - vec2(a1 - 0.5, 0.0)*2.0).rgb;
                //     }
                //     else if(0.0 < a1 && b1 < 1.0) {
                //       if(screenUVs.x < a1 && screenUVs.x > 0.0) {
                //         texture_color = texture2D(uImgTex[1], screenUVs*2.0 - vec2(a1 - 0.5, 0.0)*2.0).rgb;
                //       }
                //       else if(screenUVs.x > a1 && screenUVs.x < b1) {
                //         texture_color = texture2D(uImgTex[0], screenUVs*2.0 - vec2(a1, 0.0)*2.0).rgb;
                //       }
                //       else if(screenUVs.x > b1 && screenUVs.x < 1.0) {
                //         texture_color = texture2D(uImgTex[1], screenUVs*2.0 - vec2(b1, 0.0)*2.0).rgb;
                //       }
                //     }
                //     if(1.0 < b1) {

                //     }
                //   }

                //   if(a1 > b1) {
                //     if(screenUVs.x < b1 && screenUVs.x > 0.0) {
                //       texture_color = texture2D(uImgTex[0], screenUVs*2.0 - vec2(b1 - 0.5, 0.0)*2.0).rgb;
                //     }
                //     else if(screenUVs.x > b1 && screenUVs.x < b1) {
                //       texture_color = texture2D(uImgTex[1], screenUVs*2.0 - vec2(b1, 0.0)*2.0).rgb;
                //     }
                //     else if(screenUVs.x > a1 && screenUVs.x < 1.0) {
                //       texture_color = texture2D(uImgTex[0], screenUVs*2.0 - vec2(a1, 0.0)*2.0).rgb;
                //     }
                //   }
                // }

                // //上の段
                // if(screenUVs.y > 0.5) {
                //   if(b2 > a2) {
                //   }
                //   if(a2 > b2) {

                //   }

                //   if (screenUVs.x < 0.5 && screenUVs.x > 0.0 && screenUVs.y < 1.0 && screenUVs.y > 0.5) {
                //     texture_color = texture2D( uImgTex[1],  screenUVs*2.0 - vec2(0.0,1.0)).rgb;
                //   }
                //   if (screenUVs.x < 1.0 && screenUVs.x > 0.5 && screenUVs.y < 1.5 && screenUVs.y > 0.5) {
                //     texture_color = texture2D( uImgTex[0],  screenUVs*2.0 - vec2(1.0,1.0)).rgb;
                //   }
                // }





                // if (screenUVs.x < 0.5 && screenUVs.x > 0.0 && screenUVs.y < 0.5 && screenUVs.y > 0.0) {
                //    texture_color = texture2D( uVidTex[0],  screenUVs*2.0).rgb;
                // }
                // if (screenUVs.x < 1.0 && screenUVs.x > 0.5 && screenUVs.y < 0.5 && screenUVs.y > 0.0) {
                //   texture_color = texture2D( uImgTex[1],  screenUVs*2.0 - vec2(1.0,0.0)).rgb;
                // }
                // if (screenUVs.x < 0.5 && screenUVs.x > 0.0 && screenUVs.y < 1.0 && screenUVs.y > 0.5) {
                //   texture_color = texture2D( uImgTex[1],  screenUVs*2.0 - vec2(0.0,1.0)).rgb;
                // }
                // if (screenUVs.x < 1.0 && screenUVs.x > 0.5 && screenUVs.y < 1.5 && screenUVs.y > 0.5) {
                //   texture_color = texture2D( uImgTex[0],  screenUVs*2.0 - vec2(1.0,1.0)).rgb;
                // }
                
                //vec3 texture_color = texture2D( uVidTex[0],  screenUVs).rgb;
                //vec3 img_texture_color = texture2D( uImgTex[0],  screenUVs).rgb;
                //texture_color += img_texture_color;

                vec3 color = vec3(texture_color.b, texture_color.b, 1.0);
                //vec3 color = vec3(1.0, texture_color.r, texture_color.r);
                if(uNormalFactor == 1.0) {
                  color = vec3(texture_color.b * (1.0 - uColorFactor)  + texture_color.r* uColorFactor, texture_color.b * (1.0 - uColorFactor)  + texture_color.g* uColorFactor, 1.0 * (1.0 - uColorFactor)  + texture_color.b* uColorFactor);
                  //color = vec3( 1.0 * (1.0 - uColorFactor)  + texture_color.r* uColorFactor ,(1.0 - texture_color.r) * (1.0 - uColorFactor)  + texture_color.g* uColorFactor, (1.0 - texture_color.r) * (1.0 - uColorFactor)  + texture_color.b* uColorFactor);
                }

                // if (screenUVs.x < 0.0 || screenUVs.x > 1.0 || screenUVs.y < 0.0 || screenUVs.y > 1.0) {
                //   color = vec3(1.0, 1.0, 1.0);
                // }

                gl_FragColor = vec4(color.rgb,opacity);
              }
              `,
  });

  //let debug_mat = new THREE.MeshLambertMaterial();
  return glsl_mat;
};

export const generateMediaMat_building = (
  texture,
  textureSize,
  windowSize,
  pix_ratio,
  time
) => {
  console.log(windowSize);
  console.log(textureSize);
  let glsl_mat = new THREE.ShaderMaterial({
    lights: {
      value: true,
    },
    transparent: true,
    uniforms: {
      uTime: { value: time },
      uTex: { type: "t", value: texture }, // テスクチャを uTex として渡す
      uWindowSizeX: { value: windowSize.width },
      uWindowSizeY: { value: windowSize.height },
      uTexSizeX: { value: textureSize.width },
      uTexSizeY: { value: textureSize.height },
      uPixRatio: { value: pix_ratio },
    },
    vertexShader: `
              varying float vDotProduct;
  
              void main() {
                  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
                  vec3 norm = normalize(normalMatrix * normal);
                  vDotProduct = dot(norm, normalize(- viewPosition.xyz));
                  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                  vec4 mvPosition =  viewMatrix * worldPosition;
                  gl_Position = projectionMatrix * mvPosition;
              }
              `,
    fragmentShader: `
              varying float vDotProduct;
  
              #include <common>
              #include <lights_pars_begin>
  
              // precision mediump float;
              uniform sampler2D uTex;
              uniform float uWindowSizeX;
              uniform float uWindowSizeY;
              uniform float uTexSizeX;
              uniform float uTexSizeY;
              uniform float uPixRatio;
  
              void main() {
                // float opacity = (1.0 - abs(vDotProduct))*4.0;
                float opacity = 1.0;

                vec2 textureSize = vec2(uTexSizeX,uTexSizeY);
                vec2 windowSize = vec2(uWindowSizeX, uWindowSizeY);
                float textureAspect = textureSize.x / textureSize.y;
                float windowAspect = windowSize.x / windowSize.y;

                float repeatx = 1.0;
                float repeaty = 1.0;
                float offsetx = 0.0;
                float offsety = 0.0;

                if(windowAspect < textureAspect) {
                    repeatx = windowAspect / textureAspect;
                    offsetx = (1.0 - repeatx) / 2.0;
                }
                else {
                    repeaty = textureAspect / windowAspect;
                    offsety = (1.0 - repeaty) / 2.0;
                }

                if(false) {
                  repeatx *= 2.0/3.0;
                  repeaty *= 2.0/3.0;
                  
                }

                vec2 screenUVs = vec2(((gl_FragCoord.x/uPixRatio) / uWindowSizeX) * repeatx + offsetx, ((gl_FragCoord.y/uPixRatio)/uWindowSizeY))*repeaty + offsety;
                //screenUVs = vec2(clamp(screenUVs.x, 0.0, 1.0),clamp(screenUVs.y, 0.0, 1.0));
                
                vec3 texture_color = texture2D( uTex,  screenUVs).rgb;
                vec3 color = vec3(texture_color.b, texture_color.b, 1.0);
                //vec3 color = vec3(1.0, texture_color.r, texture_color.r);

                // if (screenUVs.x < 0.0 || screenUVs.x > 1.0 || screenUVs.y < 0.0 || screenUVs.y > 1.0) {
                //   color = vec3(1.0, 1.0, 1.0, 1.0);
                // }

                gl_FragColor = vec4(color.rgb,opacity);
              }
              `,
  });

  //let debug_mat = new THREE.MeshLambertMaterial();
  return glsl_mat;
};
