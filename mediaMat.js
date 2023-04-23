import * as THREE from "https://unpkg.com/three@0.130.1/build/three.module.js";

export const generateMediaMat = (texture, textureSize, windowSize) => {
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
      uColorFactor: { value: 1.0 },
      uNormalFactor: { value: 0.0 },
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
              uniform float uColorFactor;
              uniform float uNormalFactor;
  
              void main() {
                // float opacity = (1.0 - vDotProduct)*4.0;
                float opacity = 1.0;
                if(uNormalFactor == 1.0) {
                  opacity = ((vDotProduct)*2.0 - 1.0)*(1.0 - uColorFactor) + uColorFactor;
                }
                vec2 textureSize = vec2(uTexSizeX,uTexSizeY);
                vec2 screenUVs = vec2(gl_FragCoord.x*0.5 / uWindowSizeX, gl_FragCoord.y*0.5/uWindowSizeY);
                vec3 texture_color = texture2D( uTex,  screenUVs).rgb;
                vec3 color = vec3(texture_color.b, texture_color.b, 1.0);
                if(uNormalFactor == 1.0) {
                  color = vec3(texture_color.b * (1.0 - uColorFactor)  + texture_color.r* uColorFactor, texture_color.b * (1.0 - uColorFactor)  + texture_color.g* uColorFactor, 1.0 * (1.0 - uColorFactor)  + texture_color.b* uColorFactor);
                }
                gl_FragColor = vec4(color.rgb,opacity);
              }
              `,
  });

  let debug_mat = new THREE.MeshLambertMaterial();
  return glsl_mat;
};
