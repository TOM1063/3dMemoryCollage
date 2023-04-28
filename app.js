import { FBXLoader } from "https://unpkg.com/three@0.126.1/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "https://unpkg.com/three@0.130.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
// import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js';

import { generateMediaMat } from "./mediaMat.js";
import { update_freeCamera } from "./freeCam.js";

var SETTING_DB = {
  buildings: [
    { name: "structure", model: "structure_mesh.fbx" },
    { name: "pointcloud", model: "memory.fbx" },
  ],
  building_tex: [
    { class_name: "steel", texture: "test0.jpg" },
    { class_name: "concrete", texture: "test1.jpg" },
    { class_name: "tesuri", texture: "test3.jpg" },
    { class_name: "panel", texture: "test4.jpg" },
    { class_name: "roof", texture: "test2.jpg" },
    { class_name: "Aluminum", texture: "test3.jpg" },
  ],
  memories_tex: [
    {
      class_name: "欠けた壁",
      video: "testvideo0.mp4",
      texture: [],
    },
    {
      class_name: "敷かれたブルーシートとブロック",
      video: "testvideo1.mp4",
      texture: [],
    },
    {
      class_name: "穴の開いた壁_南",
      video: "testvideo2.mp4",
      texture: [],
    },
    {
      class_name: "穴の開いた壁_西",
      video: "testvideo0.mp4",
      texture: [],
    },
    {
      class_name: "歪んだ庇",
      video: "testvideo1.mp4",
      texture: [],
    },
    {
      class_name: "くぼんだ地面",
      video: "testvideo2.mp4",
      texture: [],
    },
  ],
};

let TEX_PATH = "shader/imgs/";
let MODEL_PATH = "";

//get models url
let model_urls = []; //"./structure.fbx", "./pointclouds.fbx"
for (let i = 0; i < SETTING_DB.buildings.length; i++) {
  let building = SETTING_DB.buildings[i];
  model_urls.push(String(MODEL_PATH + building.model));
}
console.log(model_urls);

let videoTextures = [];

let video_mats = [];
let img_mats = [];
let building_mats = [];

let fbx_model = [];
let fbx_models = [];

let dataLoadingPromises = [];

let objects = [];
let focused_object;

let ishit = false;
let selected_page;

let frame = 0;

let activate_mouse = false;

const TEXTURE_NUM = 10;
const IMAGE_NUM = 7;
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

  //make building mats
  let building_tex_num = SETTING_DB.building_tex.length;
  for (let i = 0; i < building_tex_num; i++) {
    let building_tex = SETTING_DB.building_tex[i];
    let class_name = building_tex.class_name;
    let url = TEX_PATH + building_tex.texture;
    let mat;
    const building_tex_load_promise = new Promise((resolve, reject) => {
      imageLoader.load(
        url,
        function (image) {
          let texture = image;
          texture.needsUpdate = true;
          let textureSize = {
            width: texture.image.width,
            height: texture.image.height,
          };
          mat = generateMediaMat(texture, textureSize, size);
          let new_building_tex_data = { class_name: class_name, mat: mat };
          building_mats.push(new_building_tex_data);
          resolve();
        },
        undefined,
        reject
      );
    });
    dataLoadingPromises.push(building_tex_load_promise);
  }

  // preload video textures
  const memories_num = SETTING_DB.memories_tex.length;
  for (let i = 0; i < memories_num; i++) {
    let memory = SETTING_DB.memories_tex[i];
    let vide0_file_name = memory.video;
    let class_name = memory.class_name;
    const promise = new Promise((resolve, reject) => {
      const video = document.getElementById(vide0_file_name);
      video.src = TEX_PATH + vide0_file_name;
      video.muted = true;
      video.play();
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.needsUpdate = true;
      let new_data = { class_name: class_name, texture: videoTexture };
      videoTextures.push(new_data);
      resolve();
    });
  }

  // make memory mats
  for (let i = 0; i < memories_num; i++) {
    let memory = SETTING_DB.memories_tex[i];
    let video_texture = videoTextures[i].texture;
    let class_name = memory.class_name;
    video_texture.magFilter = THREE.LinearFilter;
    video_texture.minFilter = THREE.LinearFilter;
    let video_textureSize = {
      width: video_texture.image.width,
      height: video_texture.image.height,
    };
    let mat = generateMediaMat(video_texture, video_textureSize, size);
    mat.index = i;
    let new_video_tex_data = { class_name: class_name, mat: mat };
    video_mats.push(new_video_tex_data);

    let mats = [];
    for (let i = 0; i < memory.texture.length; i++) {
      let tex_file = memory.texture[i];
      let url = TEX_PATH + tex_file;
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
            mats[i] = mat;
            let new_img_tex_data = { class_name: class_name, mats: mats };
            img_mats.push(new_img_tex_data);
            resolve();
          },
          undefined,
          reject
        );
      });
      dataLoadingPromises.push(promise);
    }
  }

  //laod fbx model
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
  }

  //promises done
  Promise.all(dataLoadingPromises).then((results) => {
    postProcess();
    onStart();
    tick();
  });
}

function postProcess() {
  console.log("buildingmat:" + building_mats);
  console.log("videomat:" + video_mats);
  console.log("imgmat:" + img_mats);

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

        let class_name_ = child.groupName;
        if (class_name_.includes("memory_")) {
          console.log(class_name_.split("memory_")[1]);
          mat = video_mats[i % 3].mat;
          mat.uniforms.uNormalFactor.value = 1.0;
          mat.uniforms.uColorFactor.value = 0.0;
          mat.side = THREE.DoubleSide;
          child.material = mat;
          objects.push(child);
        } else {
          console.log(class_name_);
          let mat_object = building_mats.find(
            ({ class_name }) => class_name === class_name_
          );
          //console.log(mat_object);
          mat = mat_object.mat;
          child.material = mat;
        }
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
