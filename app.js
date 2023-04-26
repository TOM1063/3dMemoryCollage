import { FBXLoader } from "https://unpkg.com/three@0.126.1/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "https://unpkg.com/three@0.130.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
// import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js';

import { generateMediaMat } from "./mediaMat.js";
import { update_freeCamera } from "./freeCam.js";

let model_urls = ["./pointcloud_mesh_covered.fbx", "./structure_mesh.fbx"]; //"./structure.fbx", "./pointclouds.fbx"

let videoTextures = [];
let video_mats = {};
let img_mats = {};
let fbx_model = [];
let fbx_models = [];

let dataLoadingPromises = [];

let objects = [];
let focused_object;

let ishit = false;
let selected_page;

let frame = 0;

let activate_mouse = false;

const TEXTURE_NUM = 9;
const IMAGE_NUM = 6;
const VIDEO_NUM = TEXTURE_NUM - IMAGE_NUM;
const CAMERA_CONTROL = 1;
let IS_SMARTPHONE = false;

//DOM定義
const overlay = document.getElementById("overlay");
const loading = document.getElementById("loading");
const title = document.getElementById("title");
const canvas = document.getElementById("myCanvas");
const startButton = document.getElementById("startButton");

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let mouse = new THREE.Vector2(0, -0.1);
let mouse_prev = new THREE.Vector2(0, 0);

let camera_util = {
  pos: new THREE.Vector3(0, 0, 0),
  rot: new THREE.Vector3(0, 0, 0),
  head_rot: new THREE.Vector3(0, 0, 0),
  body_rot: new THREE.Vector3(0, 0, 0),
  dir: new THREE.Vector3(0, 0, 0),
  look: new THREE.Vector3(0, 0, 0),
};

let key_state = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, size.width / size.height);
const controls = new OrbitControls(camera, canvas);
//const camera = new THREE.OrthographicCamera(size.width/-2,size.width/2,size.height/2,size.height/-2,1,10);

if (
  window.matchMedia &&
  (window.matchMedia("(max-device-width: 640px)").matches ||
    window.matchMedia("(max-device-height: 640px)").matches)
) {
  IS_SMARTPHONE = true;
} else {
  IS_SMARTPHONE = false;
}
console.log("IS_SMARTPHONE : " + String(IS_SMARTPHONE));

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
const target = new THREE.Vector3(-2, 0, 0);

const imageLoader = new THREE.TextureLoader();

const raycaster = new THREE.Raycaster();
const point = new THREE.Vector2(0, 0);

function init() {
  console.log("start");
  console.log("window_size:", size);
  overlay.remove();

  // シーンを作成
  camera.far = 20000;
  camera.aspect = size.width / size.height;
  camera.position.set(100, 0, 100);

  if (IS_SMARTPHONE) {
    controls.enableDamping = true;
    controls.target.set(target.x, target.y, target.z);
    controls.zoomSpeed = 0.5;
    controls.panSpeed = 0.5;
  } else {
    camera_util.body_rot.set(3.14 + 3.14 / 5, -3.14 / 20, -3.14 / 20);
    camera_util.head_rot.set(3.14 + 3.14 / 5, -3.14 / 20, -3.14 / 20);
    //camera_util.rot.set(3.14 / 5, -3.14 / 3, 0);
    camera_util.pos.set(-130, 110, 200);
    // camera_util.dir.set(-10, -600, -100);
  }
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(size.width, size.height);
  //const bg_color = new THREE.Color(0, 0, 255);
  const bg_color = new THREE.Color(0.9, 0.9, 0.9);
  renderer.setClearColor(bg_color, 1);

  // preload video textures
  for (let i = 0; i < VIDEO_NUM; i++) {
    const video = document.getElementById("video" + String(i));
    video.src = "shader/imgs/testvideo" + String(i) + ".mp4";
    video.muted = true;
    video.play();
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.needsUpdate = true;
    videoTextures.push(videoTexture);
  }

  //generate loading promises
  for (let i = 0; i < TEXTURE_NUM; i++) {
    if (i >= VIDEO_NUM) {
      let url = "./shader/imgs/test" + String(i - VIDEO_NUM) + ".jpg";
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
  loading.remove();
  const manager = new THREE.LoadingManager();
  manager.onLoad = function () {
    console.log("all items loaded");
  };

  let index = 0;
  for (let i = 0; i < fbx_models.length; i++) {
    fbx_models[i].traverse((child) => {
      if (child.isMesh) {
        let mat = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          transparent: true,
          opacity: 0.2,
          //depthTest: false,
          //wireframe: true,
        });

        if (child.groupName == "steel") {
          if (index % 1 == 0) {
            mat = img_mats[String(5)];
          }
          // else {
          //   mat = img_mats[String(10)];
          // }
        }
        if (child.groupName == "concrete") {
          mat = img_mats[String(1)];
        }
        if (child.groupName == "roof") {
          mat = img_mats[String(2)];
        }
        if (child.groupName == "tesuri") {
          mat = img_mats[String(3)];
        }
        if (child.groupName == "Aluminum") {
          mat = img_mats[String(3)];
        }

        if (child.groupName == "panel") {
          mat = img_mats[String(4)];
        }

        // if (child.groupName == "bluesheet") {
        //   mat = new THREE.MeshLambertMaterial({
        //     color: 0xffffff,
        //     // emissive: child.material.color,
        //     // transparent: true,
        //     // opacity: 0.7,
        //     depthTest: false,
        //     //wireframe: true,
        //   });
        // }
        if (child.groupName == "scan_object") {
          let mat_ref_index = (index - 1) % 3;
          mat = video_mats[mat_ref_index];
          mat.uniforms.uNormalFactor.value = 1.0;
          mat.uniforms.uColorFactor.value = 0.0;
          objects.push(child);
        }

        // mat.depthTest = true;
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
  }

  onStart();
  tick();
}

let prev_point;
let tracks_archive = [];
let tracks = [];
let indic_tracks = [];

let enter_point;
let enter_points = [];
let indic_enter_point;

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
indic_mat.opacity = 0.2;
let indic_point_mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
indic_point_mat.transparent = true;
indic_point_mat.blending = THREE.AdditiveBlending;
indic_point_mat.opacity = 1;

let box = new THREE.SphereGeometry(3, 8, 8);
indic_enter_point = new THREE.Mesh(box, indic_point_mat);
indic_enter_point.position.set(10000, 10000, 10000);
scene.add(indic_enter_point);

let title_typed = true;

function tick() {
  frame += 1;

  if (true) {
    if (frame % 12 == 0) {
      let camera_pos = new THREE.Vector3(
        camera.position.x,
        camera.position.y,
        camera.position.z
      );

      if (prev_point && ishit == false) {
        let vel = camera_pos.sub(prev_point);

        let box = new THREE.SphereGeometry(0.3, 8, 8);
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
        points.push(prev_point);
        points.push(camera_pos);
        //console.log(points);

        //let line_mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        // const geometry = new THREE.BufferGeometry().setFromPoints(points);
        // const line = new THREE.Line(geometry, line_mat);
        // line.name = frame;
        // scene.add(line);
        // tracks.push(line);

        prev_point = camera_pos;
      } else {
        prev_point = camera_pos;
      }
    }
  }

  const linkThresh = 1;

  if (IS_SMARTPHONE) {
    controls.update();
  } else {
    update_freeCamera(camera, camera_util, mouse, key_state);
  }

  renderer.render(scene, camera); // レンダリング
  TWEEN.update();

  //detect hit!!//
  raycaster.setFromCamera(point, camera);
  const intersects = raycaster.intersectObjects(objects);

  //on lock on
  if (intersects[0]) {
    console.log("rock on!");
    let dist = Math.abs(intersects[0].distance);

    let colorThresh;
    if (IS_SMARTPHONE) {
      colorThresh = 100;
    } else {
      colorThresh = 50;
    }
    focused_object = intersects[0].object;

    //on get close
    if (dist < colorThresh) {
      let colorFactor = dist / colorThresh;

      //const bg_color = new THREE.Color(0, 0, 255);
      const bg_color = new THREE.Color(0.9, 0.9, 0.9);
      scene.background = NaN;
      renderer.setClearColor(bg_color, 1);

      intersects[0].object.material.uniforms.uColorFactor.value =
        1.0 - colorFactor;

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

      // indicate enter point
      indic_enter_point.position.set(
        camera_util.pos.x,
        camera_util.pos.y,
        camera_util.pos.z
      );

      //change background texture
      let new_texture = intersects[0].object.material.uniforms.uTex.value;
      let textureAspect = new_texture.image.width / new_texture.image.height;
      let aspect = size.width / size.height;

      if (aspect < textureAspect) {
        new_texture.repeat.x = aspect / textureAspect;
        new_texture.offset.x = (1 - new_texture.repeat.x) / 2;
      } else {
        new_texture.repeat.y = textureAspect / aspect;
        new_texture.offset.y = (1 - new_texture.repeat.y) / 2;
      }

      scene.background = new_texture;
      let random_theta = Math.random() * 360;
      console.log(random_theta);
      if (IS_SMARTPHONE) {
        camera.position.set(-10, 200, 200);
      } else {
        camera_util.body_rot.set(3.14, -3.14 / 4, 0);
        camera_util.head_rot.set(0, 0, 0);
        camera_util.rot.set(3.14, -3.14 / 4, 0);
        camera_util.pos.set(-10, 200, 200);
        camera_util.dir.set(-10, -200, -200);
      }
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
      focused_object.material.uniforms.uColorFactor.value = 0.0;
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
          .onComplete(tweenComplete)
          .easing(TWEEN.Easing.Elastic.In)
          .start();
      }
    });
  }
  new TWEEN.Tween(camera_util.pos)
    .to({ x: 100, y: 15, z: 100 }, 6000)
    .easing(TWEEN.Easing.Exponential.In)
    .start();
  new TWEEN.Tween(camera_util.body_rot)
    .to({ x: 3.14 - 3.14 / 5, y: 3.14 / 4, z: 0 }, 6000)
    .easing(TWEEN.Easing.Exponential.In)
    .start();
}

startButton.addEventListener("click", init);

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

window.addEventListener("mousemove", function (e) {
  if (activate_mouse) {
    mouse_prev = mouse;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }
});

window.addEventListener(
  "keydown",
  function (e) {
    console.log("key_down : " + String(e.code));
    switch (e.code) {
      case "KeyW": // w
        console.log("move forwerd");
        key_state.moveForward = true;
        break;
      case "KeyD": // a
        key_state.moveLeft = true;
        break;
      case "KeyS": // s
        key_state.moveBackward = true;
        break;
      case "KeyA": // d
        key_state.moveRight = true;
        break;
    }
  },
  false
);

window.addEventListener(
  "keyup",
  function (e) {
    switch (e.code) {
      case "KeyW": // w
        key_state.moveForward = false;
        break;
      case "KeyD": // a
        key_state.moveLeft = false;
        break;
      case "KeyS": // s
        key_state.moveBackward = false;
        break;
      case "KeyA": // d
        key_state.moveRight = false;
        break;
    }
  },
  false
);

function tweenComplete() {
  activate_mouse = true;
}
