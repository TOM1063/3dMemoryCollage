import * as THREE from "https://unpkg.com/three@0.130.1/build/three.module.js";

export const generateMediaMat = (
  video_texture,
  image_texture,
  textureSize,
  windowSize,
  pix_ratio
) => {
  console.log(windowSize);
  console.log(textureSize);
  let glsl_mat = new THREE.ShaderMaterial({
    lights: {
      value: true,
    },
    transparent: true,
    uniforms: {
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

                vec2 screenUVs = vec2(((gl_FragCoord.x/uPixRatio) / uWindowSizeX) * repeatx + offsetx, ((gl_FragCoord.y/uPixRatio)/uWindowSizeY))*repeaty + offsety;
                //screenUVs = vec2(clamp(screenUVs.x, 0.0, 1.0),clamp(screenUVs.y, 0.0, 1.0));
                
                vec3 texture_color = texture2D( uVidTex[0],  screenUVs).rgb;
                vec3 img_texture_color = texture2D( uImgTex[0],  screenUVs).rgb;
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
  pix_ratio
) => {
  console.log(windowSize);
  console.log(textureSize);
  let glsl_mat = new THREE.ShaderMaterial({
    lights: {
      value: true,
    },
    transparent: true,
    uniforms: {
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
