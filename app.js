//-------------------------------------//import//---------------------------------------//

import { FBXLoader } from "https://unpkg.com/three@0.126.1/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "https://unpkg.com/three@0.130.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
// import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js';

import { generateMediaMat, generateMediaMat_building } from "./mediaMat.js";
import { update_freeCamera } from "./freeCam.js";
import { setting_db } from "./texture_setting.js";
//-------------------------------------//import//---------------------------------------//

//-------------------------------------//setting//---------------------------------------//
let TEX_PATH = "shader/imgs/";
let MEMORY_PATH = "shader/imgs/memories";
let MODEL_PATH = "fbx/";

let CONTROLL_SPEED = 1.2;

var SETTING_DB = setting_db;
//-------------------------------------//setting//---------------------------------------//

//-------------------------------------//def//---------------------------------------//

//get models url
let model_urls = []; //"./structure.fbx", "./pointclouds.fbx"
for (let i = 0; i < SETTING_DB.buildings.length; i++) {
  let building = SETTING_DB.buildings[i];
  model_urls.push(String(MODEL_PATH + building.model));
}
console.log(model_urls);

let sounds = [];
let videoTextures = [];
let memoryTextures = [];

let building_mats = [];
let memory_mats = [];

let fbx_model = [];
let fbx_models = [];

let objects = [];
let focused_object;

let ishit = false;
let selected_page;
let prev_page_name;

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

let size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let pix_ratio = window.devicePixelRatio;
console.log("pix ratio : ", pix_ratio);

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
camera.far = 200;
const controls = new OrbitControls(camera, canvas);
let listener;

let material = new THREE.MeshBasicMaterial({
  color: 0xf0f0f0,
  side: THREE.DoubleSide,
});
const background = new THREE.Mesh(
  new THREE.SphereGeometry(1000.0, 8, 8),
  material
);
background.renderOrder = -1;
scene.add(background);
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

// renderer.setPixelRatio(window.devicePixelRatio);

const target = new THREE.Vector3(-2, 0, 0);

const imageLoader = new THREE.TextureLoader();

const raycaster = new THREE.Raycaster();
const point = new THREE.Vector2(0, 0);

//-------------------------------------//def//---------------------------------------//

//-------------------------------------//def//---------------------------------------//

//make building mats
let building_tex_load_promises = [];
let building_tex_num = SETTING_DB.building_tex.length;

function building_tex_load() {
  console.log("building_tex_load_promise start");
  for (let i = 0; i < building_tex_num; i++) {
    const promise = new Promise((resolve) => {
      let building_tex = SETTING_DB.building_tex[i];
      let class_name = building_tex.class_name;
      let url = TEX_PATH + building_tex.texture;
      let mat;
      imageLoader.load(url, function (image) {
        let building_image = image;
        building_image.needsUpdate = true;
        let textureSize = {
          width: building_image.image.width,
          height: building_image.image.height,
        };
        console.log("building_image:" + building_image);
        mat = generateMediaMat_building(
          building_image,
          textureSize,
          size,
          pix_ratio,
          frame
        );
        let new_building_tex_data = { class_name: class_name, mat: mat };
        building_mats.push(new_building_tex_data);
        resolve();
      });
    });
    building_tex_load_promises.push(promise);
  }
}

const memories_num = SETTING_DB.memories_tex.length;
let video_tex_load_promises = [];

function video_tex_load() {
  console.log("video_tex_load_promise start");
  for (let i = 0; i < memories_num; i++) {
    const promise = new Promise((resolve) => {
      console.log("loading memory video");
      let memory = SETTING_DB.memories_tex[i];
      let vide_file_name = memory.video;
      let class_name = memory.class_name;
      const video = document.getElementById(vide_file_name);
      video.src = TEX_PATH + vide_file_name;
      video.play();

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.needsUpdate = true;
      let new_data = { class_name: class_name, texture: videoTexture };
      videoTextures.push(new_data);

      const video_sound = new THREE.Audio(listener);
      // video.muted = false;
      video_sound.autoplay = true;
      video_sound.setMediaElementSource(video);
      video_sound.setLoop(true);
      video_sound.hasPlaybackControl = true;
      video_sound.play();
      video_sound.setVolume(0.0);
      console.log("make sound of : ", class_name);
      let sound_data = { class_name: class_name, sound: video_sound };
      sounds.push(sound_data);

      resolve();
    });
    video_tex_load_promises.push(promise);
  }
}

let memory_tex_load_promises = [];
function memory_tex_load() {
  for (let i = 0; i < memories_num; i++) {
    let memory = SETTING_DB.memories_tex[i];
    let class_name = memory.class_name;
    for (let j = 0; j < memory.texture.length; j++) {
      const promise = new Promise((resolve) => {
        let tex_file = memory.texture[j];
        let url = TEX_PATH + tex_file;
        imageLoader.load(url, function (image) {
          console.log("loading_memory texture");
          let texture = image;
          texture.needsUpdate = true;
          if (j == 0) {
            let new_data = { class_name: class_name, textures: [texture] };
            memoryTextures.push(new_data);
          } else if (j > 0) {
            memoryTextures[i].textures.push(texture);
          }
          resolve();
        });
      });
      memory_tex_load_promises.push(promise);
    }
  }
}

//laod fbx model
let fbx_load_promises = [];
function fbx_load() {
  const fbxLoader = new FBXLoader();
  for (let i = 0; i < model_urls.length; i++) {
    const promise = new Promise((resolve) => {
      fbxLoader.load(model_urls[i], (object) => {
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
      });
    });
    fbx_load_promises.push(promise);
  }
}

function make_memory_mat() {
  // make memory mats
  for (let i = 0; i < memories_num; i++) {
    let video_texs = [];
    let img_texs = [];
    let memory = SETTING_DB.memories_tex[i];
    console.log("memory_class_name : " + memory.class_name);
    let class_name_ = memory.class_name;
    let video_tex_object = videoTextures.find(
      ({ class_name }) => class_name === class_name_
    );
    let video_texture = video_tex_object["texture"];
    video_texture.magFilter = THREE.LinearFilter;
    video_texture.minFilter = THREE.LinearFilter;
    let video_textureSize = {
      width: video_texture.image.width,
      height: video_texture.image.height,
    };
    video_texs.push(video_texture);

    if (memory.texture.length > 0) {
      let memory_texs_object = memoryTextures.find(
        ({ class_name }) => class_name === class_name_
      );
      for (let j = 0; j < memory_texs_object.textures.length; j++) {
        let img_textures = memory_texs_object["textures"];
        img_texs.push(img_textures[j]);
      }
    }

    let textureSize = {
      width: video_texture.image.width,
      height: video_texture.image.height,
    };
    let video_tex_len = parseFloat(video_texs.length);
    console.log("video_tex_len : ", video_tex_len);
    console.log("video_texs : ", video_texs);
    let img_tex_len = parseFloat(img_texs.length);
    console.log("img_tex_len : ", img_tex_len);
    console.log("img_texs : ", img_texs);
    let mat = generateMediaMat(
      video_texs,
      img_texs,
      video_textureSize,
      size,
      pix_ratio,
      frame
    );
    let new_memory_tex_data = { class_name: class_name_, mat: mat };
    memory_mats.push(new_memory_tex_data);
  }
}

//-------------------------------------//def//---------------------------------------//

//-------------------------------------//init//---------------------------------------//
function init() {
  console.log("start");
  console.log("window_size:", size);
  overlay.remove();

  // シーンを作成
  camera.far = 20000;
  camera.aspect = size.width / size.height;
  camera.position.set(100, 0, 100);
  listener = new THREE.AudioListener();
  camera.add(listener);

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

  // const bg_color = new THREE.Color(0.9, 0.9, 0.9);
  // renderer.setClearColor(bg_color, 1);

  building_tex_load();
  Promise.all(building_tex_load_promises).then(() => {
    console.log("building tex loaded");
    video_tex_load();
    Promise.all(video_tex_load_promises).then(() => {
      console.log("video tex loaded");
      memory_tex_load();
      Promise.all(memory_tex_load_promises).then(() => {
        console.log("memory tex loaded");
        fbx_load();
        Promise.all(fbx_load_promises).then(() => {
          console.log("fbx loaded");
          make_memory_mat();
          postProcess();
        });
      });
    });
  });
}
//-------------------------------------//init//---------------------------------------//

//-------------------------------------//init//---------------------------------------//

function postProcess() {
  console.log("---------post process-------");
  console.log("video_textures_num:" + videoTextures.length);
  console.log("memory_textures_num:" + memoryTextures.length);
  console.log("buildingmat:" + building_mats);
  console.log("imemorymat:" + memory_mats);

  loading.remove();

  let index = 0;

  for (let i = 0; i < fbx_models.length; i++) {
    fbx_models[i].traverse((child) => {
      if (child.isMesh) {
        // let mat = new THREE.MeshLambertMaterial({
        //   color: 0xffffff,
        //   emissive: 0xffffff,
        //   transparent: true,
        //   opacity: 0.2,
        //   //depthTest: false,
        //   //wireframe: true,
        // });

        let class_name_ = child.groupName;
        if (class_name_.includes("memory_")) {
          //memory part
          class_name_ = class_name_.split("memory_")[1];
          console.log(class_name_);
          let mat_object = memory_mats.find(
            ({ class_name }) => class_name === class_name_
          );
          let memory_mat = mat_object.mat;
          memory_mat.uniforms.uNormalFactor.value = 1.0;
          memory_mat.uniforms.uColorFactor.value = 0.0;
          memory_mat.side = THREE.DoubleSide;
          memory_mat.index = index;
          index += 1;
          child.material = memory_mat;
          child.memory_name = class_name_;
          objects.push(child);
        } else {
          //fundational building part
          console.log(class_name_);
          let mat_object = building_mats.find(
            ({ class_name }) => class_name === class_name_
          );
          let building_mat = mat_object.mat;
          child.material = building_mat;
        }
      }
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

  console.log("post proccess done");
  onStart();
}

//-------------------------------------//init//---------------------------------------//

//-------------------------------------//def//---------------------------------------//

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

//-------------------------------------//def//---------------------------------------//

//-------------------------------------//update//---------------------------------------//

function tick() {
  console.log("tick!");
  frame += 1;

  for (let i = 0; i < fbx_models.length; i++) {
    fbx_models[i].traverse((child) => {
      if (child.isMesh) {
        child.material.uniforms.uTime.value = frame / 100;
      }
    });
  }

  if (background.material.isShaderMaterial) {
    background.material.uniforms.uTime.value = frame / 100;
  }

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
      let page_name = String(intersects[0].object.memory_name);
      console.log(page_name);
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

      let sound_object = sounds.find(
        ({ class_name }) => class_name === page_name
      );

      sound_object.sound.setVolume(1.0);
      console.log("sound object : ", sound_object);

      if (prev_page_name) {
        let prev_sound_object = sounds.find(
          ({ class_name }) => class_name === prev_page_name
        );
        prev_sound_object.sound.setVolume(0.0);
      }

      prev_page_name = page_name;

      //change background texture
      //let new_texture = intersects[0].object.material.uniforms.uTex.value;
      let new_material = intersects[0].object.material.clone();
      new_material.depthTest = false;
      // let textureAspect = new_texture.image.width / new_texture.image.height;
      // let aspect = size.width / size.height;

      // if (aspect < textureAspect) {
      //   new_texture.repeat.x = aspect / textureAspect;
      //   new_texture.offset.x = (1 - new_texture.repeat.x) / 2;
      // } else {
      //   new_texture.repeat.y = textureAspect / aspect;
      //   new_texture.offset.y = (1 - new_texture.repeat.y) / 2;
      // }

      //scene.background = new_texture;
      background.material = new_material;

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

  console.log("on start done");
  tick();
}
//-------------------------------------//update//---------------------------------------//

//-------------------------------------//event//---------------------------------------//

startButton.addEventListener("click", init);

window.addEventListener("resize", () => {
  (size.width = window.innerWidth), (size.height = window.innerHeight);
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);

  // fbx_model.traverse((child) => {
  //   if (child.isMesh) {
  //     child.material.uWindowSizeX = size.width;
  //     child.material.uWindowSizeY = size.height;
  //   }
  // });
});

// 画面が読み込まれたらすぐに動かしたい場合の記述
$(window).on("load", function () {
  TypingInit(); //初期設定
  TypingAnime(); /* アニメーション用の関数を呼ぶ*/
}); // ここまで画面が読み込まれたらすぐに動かしたい場合の記述

$(window).on("resize", function () {
  size = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
});

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

//-------------------------------------//event//---------------------------------------//
