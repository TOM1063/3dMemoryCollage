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
                  opacity = (abs(vDotProduct)*2.0 - 1.0);
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

                vec3 texture_color;

                vec2 screenUVs = vec2(((gl_FragCoord.x/uPixRatio) / uWindowSizeX) * repeatx + offsetx, ((gl_FragCoord.y/uPixRatio)/uWindowSizeY)*repeaty + offsety);


                float time_factor = 0.015;
                float dist_factor = (1.0 - cos(uColorFactor*3.14/2.0))*0.2;

                int index;

                float mobile_factor = floor(windowAspect); // 0.0 if mobile

                float thresh = 0.66 * mobile_factor + 0.5 * (1.0 - mobile_factor) ;
                float v_section_factor = step(screenUVs.t,thresh);

                float mov_height = windowSize.y * thresh;
                float mov_width = mov_height * textureAspect;
                float margin_left = (windowSize.x - mov_width)/2.0;

                vec3 bg_color = vec3(1.0);


                //---------------mov-------------------
                vec2 mov_section_uv;
                mov_section_uv.s = clamp((screenUVs.s - margin_left/windowSize.x) * (windowSize.x/mov_width),0.0,1.0);
                mov_section_uv.t = clamp(screenUVs.t * (1.0/thresh),0.0,1.0);
                //vec3 mov_section = vec3(mov_section_uv.s,mov_section_uv.t,0.0);
                vec3 mov_section_pc = texture2D(uVidTex[0],mov_section_uv.st).rgb;


                vec2 mov_section_mobile_uv;
                mov_section_mobile_uv.s = clamp((screenUVs.s + margin_left/windowSize.x) * (windowSize.x/mov_width),0.0,1.0);
                mov_section_mobile_uv.t = clamp(screenUVs.t * (1.0/thresh),0.0,1.0);

                vec3 mov_section_mobile = texture2D(uVidTex[0],vec2(mov_section_mobile_uv.s,mov_section_mobile_uv.t)).rgb;

                vec3 mov_section = mov_section_mobile*(1.0 - mobile_factor) + mov_section_pc*mobile_factor;

                float mov_gradient = clamp(2.0 * sin(screenUVs.s*3.141592),0.0,1.0);








                mov_section = vec3(mov_section.r + 0.3,mov_section.g + 0.35,mov_section.b + 0.35);

                mov_section = mov_section*mov_gradient + bg_color*(1.0 - mov_gradient);


                //---------------imgs-------------------
                vec2 imgs_section_uv;

                imgs_section_uv.t = clamp((screenUVs.t - thresh) *(1.0/(1.0 - thresh)),0.0,1.0);
                imgs_section_uv.s = fract(screenUVs.s* 3.0 + uTime*time_factor + dist_factor);
                //imgs_section_uv.s = clamp(imgs_section_uv.s*1.2,0.0,1.0);
                index = int(floor(mod(screenUVs.s*3.0 + uTime*time_factor + dist_factor,3.0)));
   
                vec3 imgs_section;

                if(index == 0) {
                  imgs_section = texture2D(uImgTex[0],imgs_section_uv.st).rgb;
                }
                else if(index == 1) {
                  imgs_section = texture2D(uImgTex[1],imgs_section_uv.st).rgb;
                }
                else if(index == 2) {
                  imgs_section = texture2D(uImgTex[2],imgs_section_uv.st).rgb;
                }

                //float gradient = 1.0 * sin(fract(screenUVs.s* 3.0 + uTime*time_factor + dist_factor)*3.14159265);
                float gradient = 1.0;
                imgs_section = bg_color*(1.0 - gradient) + imgs_section*gradient;

                //imgs_section = vec3(imgs_section.r + 0.2,imgs_section.g + 0.2,imgs_section.b + 0.2);



                

                //----------------color-----------------
                texture_color = mov_section*v_section_factor + imgs_section*(1.0 - v_section_factor);

                gl_FragColor = vec4(texture_color,opacity);
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
                float opacity = 0.5 + (abs(vDotProduct))*0.7;
                //float opacity = 3.0;

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
                //vec3 color = vec3(texture_color.b, texture_color.b, 1.0);
                //vec3 color = vec3(0.9, 1.2 - texture_color.r*1.2, 1.2 - texture_color.r*1.2);
                vec3 color = vec3(texture_color.r + 0.2,texture_color.g + 0.2,texture_color.b + 0.2);

                // if (screenUVs.x < 0.0 || screenUVs.x > 1.0 || screenUVs.y < 0.0 || screenUVs.y > 1.0) {
                //   color = vec3(1.0, 1.0, 1.0, 1.0);
                // }

                float gradient = clamp(sin(screenUVs.s * 3.1415),0.0,1.0);
                gl_FragColor = vec4(color.rgb,opacity*gradient);
              }
              `,
  });

  //let debug_mat = new THREE.MeshLambertMaterial();
  return glsl_mat;
};
