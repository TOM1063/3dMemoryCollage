import { FBXLoader } from "https://unpkg.com/three@0.126.1/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "https://unpkg.com/three@0.130.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
// import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js';

let videoTextures = [];
let video_mats = {};
let img_mats = {};
let fbx_model = [];
let fbx_models = [];
let model_urls = ["./point_binary_reduced.fbx"]; //"./structure.fbx", "./pointclouds.fbx"

let dataLoadingPromises = [];

const TEXTURE_NUM = 14;
const IMAGE_NUM = 11;
const VIDEO_NUM = TEXTURE_NUM - IMAGE_NUM;

//DOM定義
const overlay = document.getElementById("overlay");
const title = document.getElementById("title");
const canvas = document.getElementById("myCanvas");
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, size.width / size.height);
//const camera = new THREE.OrthographicCamera(size.width/-2,size.width/2,size.height/2,size.height/-2,1,10);
const controls = new OrbitControls(camera, canvas);
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
const target = new THREE.Vector3(-2, 0, 0);

const listener = new THREE.AudioListener();
camera.add(listener);
const sounds = [];

const imageLoader = new THREE.TextureLoader();

let boundings = [];

const raycaster = new THREE.Raycaster();
const point = new THREE.Vector2(0, 0);

let objects = [];
let focused_object;

let ishit = false;
let selected_page;

let frame = 0;

var arr = [];

function init() {
  console.log("start");
  console.log("window_size:", size);
  overlay.remove();

  // シーンを作成
  camera.far = 20000;
  camera.aspect = size.width / size.height;
  camera.position.set(100, 0, 100);

  controls.enableDamping = true;
  controls.target.set(target.x, target.y, target.z);
  controls.zoomSpeed = 0.5;
  controls.panSpeed = 0.5;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(size.width, size.height);
  //const bg_color = new THREE.Color(0, 0, 255);
  const bg_color = new THREE.Color(0.0, 0.0, 1.0);
  renderer.setClearColor(bg_color, 1);

  // const texture = imageLoader.load('./shader/imgs/test10.JPG' );
  // scene.background = texture;

  // create light
  const lightColor = 0xffff00;
  const ambientLight = new THREE.AmbientLight(lightColor, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(lightColor, 1);
  directionalLight.position.set(10, 10, 10);
  directionalLight.target.position.set(-5, 0, 0);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // preload video textures
  for (let i = 0; i < VIDEO_NUM; i++) {
    const video = document.getElementById("video" + String(i));
    video.src = "shader/imgs/testvideo" + String(i) + ".mp4";
    video.muted = true;
    video.play();
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.needsUpdate = true;
    videoTextures.push(videoTexture);

    const sound = new THREE.PositionalAudio(listener);
    video.muted = false;
    sound.setMediaElementSource(video);
    sound.setRefDistance(20);
    sound.setVolume(1.5);
    sound.setDistanceModel("liner");
    //songElement.play();
    sound.hasPlaybackControl = true;
    sound.play();
    sounds.push(sound);
  }

  //generate loading promises
  for (let i = 0; i < TEXTURE_NUM; i++) {
    if (i >= VIDEO_NUM) {
      let url = "./shader/imgs/test" + String(i - VIDEO_NUM) + ".JPG";
      const promise = new Promise((resolve, reject) => {
        imageLoader.load(
          url,
          function (image) {
            let texture = image;
            texture.needsUpdate = true;
            let textureSize = {
              width: texture.image.width,
              height: texture.image.height,
            };
            let mat = generateMediaMat(texture, textureSize, size);
            img_mats[String(i - VIDEO_NUM)] = mat;
            resolve();
          },
          undefined,
          reject
        );
      });
      dataLoadingPromises.push(promise);
    } else {
      let texture = videoTextures[i];
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      let textureSize = {
        width: texture.image.width,
        height: texture.image.height,
      };
      let mat = generateMediaMat(texture, textureSize, size);
      mat.index = i;
      video_mats[String(i)] = mat;
    }
  }

  //--------------fbx loader------------------

  const fbxLoader = new FBXLoader();

  for (let i = 0; i < model_urls.length; i++) {
    const fbx_load_pormise = new Promise((resolve, reject) => {
      fbxLoader.load(
        model_urls[i],
        (object) => {
          object.scale.set(0.01, 0.01, 0.01);
          object.traverse((child) => {
            if (child.isGroup) {
              let group_name = child.name;
              if (child.children) {
                let sub_models = child.children;
                sub_models.forEach((elem) => {
                  if (elem.isMesh) {
                    elem.groupName = group_name;
                  }
                });
              }
            }
          });
          fbx_models.push(object);
          resolve();
        },
        undefined,
        reject
      );
    });
    dataLoadingPromises.push(fbx_load_pormise);

    //promises done
    Promise.all(dataLoadingPromises).then((results) => {
      postProcess();
    });
  }
}

function postProcess() {
  const manager = new THREE.LoadingManager();
  manager.onLoad = function () {
    console.log("all items loaded");
  };

  let index = 0;
  for (let i = 0; i < fbx_models.length; i++) {
    fbx_models[i].traverse((child) => {
      if (child.isMesh) {
        let mat = new THREE.MeshLambertMaterial({
          color: child.material.emissive,
          emissive: child.material.color,
          // transparent: true,
          // opacity: 0.7,
          depthTest: false,
          //wireframe: true,
        });

        if (child.groupName == "steel") {
          if (index % 2 == 0) {
            mat = img_mats[String(5)];
          } else {
            mat = img_mats[String(10)];
          }
        }
        if (child.groupName == "concrete") {
          mat = img_mats[String(6)];
        }

        if (child.groupName == "roof") {
          mat = img_mats[String(7)];
        }
        if (child.groupName == "tesuri") {
          mat = img_mats[String(8)];
        }
        if (child.groupName == "panel") {
          mat = img_mats[String(9)];
        }
        if (child.groupName == "scan_object") {
          let mat_ref_index = index % 3;
          mat = video_mats[mat_ref_index];
          objects.push(child);
        }

        mat.depthTest = true;
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = mat;
      }

      index += 1;
    });

    fbx_models[i].traverse((child) => {
      if (child.isMesh) {
        //console.log(child);
        child.position.x = Math.random() * 30000 - 15000;
        child.position.y = Math.random() * 30000 - 15000;
        child.position.z = Math.random() * 30000 - 15000;
        // var helper = new THREE.EdgesHelper(child, 0xffffff );
        // helper.material.linewidth = 2;
        // child.add( helper );
      }
    });
    scene.add(fbx_models[i]);
    const num_childs = index;
  }
  onStart();

  tick();
}

let prev_point;
let tracks_archive = [];
let tracks = [];
let indic_tracks = [];

let track_material = new THREE.MeshBasicMaterial({ color: 0xffffff });
track_material.transparent = true;
track_material.blending = THREE.AdditiveBlending;
// track_material.blending =THREE.CustomBlending;
// track_material.blendEquation = THREE.ReverseSubtractEquation;
// track_material.blendSrc = THREE.OneMinusSrcSaturationFactor; //default
// track_material.blendDst = THREE.OneMinusSrcSaturationFactor; //default
track_material.opacity = 0.2;

let indic_mat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
indic_mat.transparent = true;
indic_mat.blending = THREE.AdditiveBlending;
indic_mat.opacity = 1;

const track_thresh = 700;

let title_typed = true;

function tick() {
  frame += 1;

  let dist_from_point = Math.sqrt(
    (camera.position.x - target.x) * (camera.position.x - target.x) +
      (camera.position.y - target.y) * (camera.position.y - target.y) +
      (camera.position.z - target.z) * (camera.position.z - target.z)
  );

  if (true) {
    if (frame % 1 == 0) {
      let camera_pos = new THREE.Vector3(
        camera.position.x,
        camera.position.y,
        camera.position.z
      );

      if (prev_point && ishit == false) {
        let vel = camera_pos.sub(prev_point);
        let vel_mag = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
        let box = new THREE.SphereGeometry(vel_mag / 7, 8, 8);
        let track = new THREE.Mesh(box, track_material);
        track.position.set(prev_point.x, prev_point.y, prev_point.z);
        track.name = frame;

        tracks.push(track);
        scene.add(track);

        let points = [];
        camera_pos = new THREE.Vector3(
          camera.position.x,
          camera.position.y,
          camera.position.z
        );
        // points.push(prev_point);
        // points.push(camera_pos);
        // console.log(points);
        // const geometry = new THREE.BufferGeometry().setFromPoints( points );
        // const line = new THREE.Line( geometry, material );
        // scene.add( line );

        prev_point = camera_pos;
      } else {
        prev_point = camera_pos;
      }
    }
  }

  const linkThresh = 3;
  controls.update();
  renderer.render(scene, camera); // レンダリング
  TWEEN.update();

  //detect hit!!//
  raycaster.setFromCamera(point, camera);
  const intersects = raycaster.intersectObjects(objects);

  //on lock on
  if (intersects[0]) {
    console.log("rock on!");
    let dist = Math.abs(intersects[0].distance);

    let colorThresh = 100;
    focused_object = intersects[0].object;

    //on get close
    if (dist < colorThresh) {
      let colorFactor = dist / colorThresh;

      //const bg_color = new THREE.Color(0, 0, 255);
      const bg_color = new THREE.Color(0, 0, 0);
      scene.background = NaN;
      renderer.setClearColor(bg_color, 1);

      //   intersects[0].object.material.uniforms.uColorFactor.value =
      //     1.0 - colorFactor;

      //hide previous page
      if (selected_page) {
        let prev_page = selected_page;

        prev_page.classList.remove("fade-out");
        prev_page.classList.add("fade-in");
        prev_page.classList.remove("scroll-in");
        prev_page.classList.add("scroll-out");
        //prev_page.setAttribute('style','visibility:hidden');
      }

      title.classList.remove("fade-in");
      title.classList.add("fade-out");
      title.classList.remove("scroll-out");
      title.classList.add("scroll-in");

      if (title_typed == false) {
        console.log("animate");
        TypingAnime(); /* アニメーション用の関数を呼ぶ*/
        title_typed = true;
      }
    } else {
      //intersects[0].object.material.uniforms.uColorFactor.value = 0.0;
    }

    //on touch
    if (dist < linkThresh) {
      title.classList.remove("fade-out");
      title.classList.add("fade-in");
      title.classList.remove("scroll-in");
      title.classList.add("scroll-out");
      title.setAttribute("style", "visibility:visible");

      //initialize page
      if (selected_page) {
        selected_page.classList.remove("fade-in");
        selected_page.classList.add("fade-out");
      }

      //show page
      let page_name = "page" + String(intersects[0].object.material.index);
      let page = document.getElementById(page_name);
      page.classList.remove("scroll-out");
      page.classList.add("scroll-in");
      page.setAttribute("style", "visibility:visible");

      //change background texture
      var newBackground = intersects[0].object.material.uniforms.uTex.value;
      scene.background = newBackground;
      let random_theta = Math.random() * 360;
      console.log(random_theta);
      camera.position.set(
        1000 * Math.sin(random_theta),
        500,
        1000 * Math.cos(random_theta)
      );
      selected_page = page;

      //archive tracks
      for (let i = 0; i < indic_tracks.length; i++) {
        //archive and show all tracks
        let archived_track = indic_tracks[i].clone();
        archived_track.material = track_material;
        scene.add(archived_track);

        //remove previous track
        scene.remove(indic_tracks[i]);
      }

      //initialize indication tracks
      indic_tracks = [];
      indic_tracks = tracks.concat();
      tracks = [];
      for (let i = 0; i < indic_tracks.length; i++) {
        indic_tracks[i].material = indic_mat;

        scene.add(indic_tracks[i]);
      }

      ishit = true;
      TypingInit();
      title_typed = false;
    } else {
      ishit = false;
    }
  } else {
    if (focused_object) {
      //focused_object.material.uniforms.uColorFactor.value = 0.0;
      focused_object = "";
    }
  }

  requestAnimationFrame(tick);
}

function onStart() {
  console.log("onstart");
  for (let i = 0; i < fbx_models.length; i++) {
    fbx_models[i].traverse((child) => {
      if (child.isMesh) {
        console.log("update_pos");
        new TWEEN.Tween(child.position)
          .to({ x: 2000, y: 0, z: 2000 }, 6000)
          .easing(TWEEN.Easing.Elastic.In)
          .start();
      }
    });
  }
}

function generateMediaMat(texture, textureSize, windowSize) {
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

            void main() {
              float opacity = (vDotProduct);
          
              vec2 textureSize = vec2(uTexSizeX,uTexSizeY);
              vec2 screenUVs = vec2(gl_FragCoord.x*0.5 / uWindowSizeX, gl_FragCoord.y*0.5/uWindowSizeY);
              vec3 texture_color = texture2D( uTex,  screenUVs).rgb;
              vec3 color = vec3(texture_color.r*uColorFactor + texture_color.b*(1.0-uColorFactor),texture_color.g*uColorFactor + texture_color.b*(1.0-uColorFactor),texture_color.b );
              gl_FragColor = vec4(color.rgb,opacity);
            }
            `,
  });

  let debug_mat = new THREE.MeshLambertMaterial();
  return glsl_mat;
}

window.addEventListener("resize", () => {
  (size.width = window.innerWidth), (size.height = window.innerHeight);
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);

  fbx_model.traverse((child) => {
    if (child.isMesh) {
      child.material.uWindowSizeX = size.width;
      child.material.uWindowSizeY = size.height;
    }
  });
});

// 画面が読み込まれたらすぐに動かしたい場合の記述
$(window).on("load", function () {
  TypingInit(); //初期設定
  TypingAnime(); /* アニメーション用の関数を呼ぶ*/
}); // ここまで画面が読み込まれたらすぐに動かしたい場合の記述
