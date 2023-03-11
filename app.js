
import { FBXLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'https://unpkg.com/three@0.130.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
// import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js';




const VIDEONUM = 3;

//DOM定義
const overlay = document.getElementById( 'overlay' );
const canvas = document.getElementById('myCanvas');
const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', init );

const size = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, size.width / size.height);
const controls = new OrbitControls(camera, canvas);
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
    });

const listener = new THREE.AudioListener();
camera.add( listener );
const sounds = [];

const imageLoader = new THREE.TextureLoader();
const videoTextures = [];

let boundings = [];

const raycaster = new THREE.Raycaster();
const point = new THREE.Vector2(0,0);

const objects = [];
let fbx_model;
let focused_object;

let ishit = false;


let frame = 0;

function init() {
	overlay.remove();

    // シーンを作成
    camera.far = 20000;
    camera.aspect = size.width / size.height;
    camera.position.set(500, 0, 500);

    controls.enableDamping = true;
    controls.target.set(-2, 0, 0);
    controls.zoomSpeed = 0.5;
    controls.panSpeed = 0.5;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(size.width, size.height);
    const bg_color  = new THREE.Color(0.9,0.9,0.9);
    renderer.setClearColor(bg_color,1);
    
    // const texture = imagLoader.load('./shader/imgs/test0.JPG' );
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


    for(let i = 0; i < VIDEONUM; i ++) {
        const video = document.getElementById('video' + String(i));
        video.src = "shader/imgs/testvideo" + String(i) + ".mp4";
        video.muted = true;
        video.play();
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.needsUpdate = true;
        videoTextures.push(videoTexture);

        const sound = new THREE.PositionalAudio( listener );
        video.muted = false;
        sound.setMediaElementSource( video );
        sound.setRefDistance( 20 );
        sound.setVolume(1.5);
        sound.setDistanceModel("liner");
        //songElement.play();
        sound.hasPlaybackControl = true;
        sound.play();
        sounds.push(sound);


    }


    const mats = [];

    for (let i = 0; i < 8; i ++) {
        let texture;
        if(i >= 5) {
            texture = videoTextures[i - 5];
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            console.log(texture);
        }
        else {
            let url = './shader/imgs/test' + String(i) + '.JPG'
            texture = imageLoader.load(url);
        }
        let mat = generateMediaMat(texture,size);
        mats.push(mat);
    }

    
    //fbxをロード
    const loader = new FBXLoader();
    loader.load('./warehouse2.fbx', ( object )=> {
        object.scale.set(0.05,0.05,0.05);
        //object.material = new THREE.MeshLambertMaterial({transparent:true,opacity:0.6,});
        let index = 0;
        object.traverse((child)=>{
            if(child.isMesh){
                let mat = new THREE.MeshLambertMaterial( {
                    color : child.material.emissive,
                    emissive : child.material.color,
                    transparent: true,
                    opacity: 0.7,
                    depthTest:false,
                //wireframe: true,
                });
                if(index%6 == 0 || index%2 == 0) {
                    let mat_ref_index = (index + 1)%8;
                    mat = mats[mat_ref_index];
                    
                    //cfeate boundings
                    let boundingbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
                    boundingbox.setFromObject(child);
                    boundings.push(boundingbox);
                    objects.push(child);


                    if(mat_ref_index > 4) {
                        let sound = sounds[mat_ref_index - 5];
                        sound.play();
                        child.add(sound);
                    }
                    
                }
                mat.depthTest = true;
                child.name = index;
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = mat;
            }
            //create local data from fbx children index
            const add_data = {object_index: index, memory_text:"", image_url:""};
            //local_json.push(add_data);

            index += 1;
        });
        object.traverse((child)=>{
            if(child.isMesh){
                //console.log(child);
                child.position.x = Math.random()*30000 - 15000;
                child.position.y = Math.random()*30000 - 15000;
                child.position.z = Math.random()*30000 - 15000;
                // var helper = new THREE.EdgesHelper(child, 0xffffff );
                // helper.material.linewidth = 2;
                // child.add( helper );
            }
        });
        fbx_model = object;
        scene.add(fbx_model);
        const num_childs = index;
        console.log(num_childs);
        onStart();
        var exporter = new THREE.OBJExporter();
        exporter.parse(object);
    },)
    tick();
    
}

function tick() {
    frame += 1;
    console.log('tick!');
    if(fbx_model) {
        fbx_model.traverse((child)=>{
            if(child.isMesh) {
                if(child.focused){
                    child.position.y += 1;
                    child.position.x += 0.01;
                    child.position.z += 0.01;
                }
            }
        });
    }




    const linkThresh = 10;

    controls.update();
    renderer.render(scene, camera); // レンダリング
    TWEEN.update();

    //detect hit!!//
    raycaster.setFromCamera( point, camera );
    const intersects = raycaster.intersectObjects( objects );
    if(intersects[0]) {
        // console.log("rock on!");
        // console.log(intersects);
        let dist = Math.abs(intersects[0].distance);
        // console.log("dist: ",dist);
        if(dist < linkThresh ) {
            if(!ishit) {
                console.log("hit!");
                ishit = true;
                controls.enableZoom = false;
                controls.enablePan = false;
                controls.enableRotate = false;
                controls.enableDamping = false;
                focused_object = intersects[0].object;

                let page = document.getElementById("page4");
        
                page.setAttribute('style','visibility:visible');
                //page.setAttribute('style', 'opacity:1');
                page.classList.remove('scroll-out');
                page.classList.add('scroll-in');

                page.classList.remove('hidden_page_minimize');
                page.classList.add('hidden_page_extend');

                let hiddenButton = document.getElementById('hiddenButton');
                hiddenButton.addEventListener( 'click', returnTo3D );
            }
        }
        else {
            ishit = false;
        }
    }
    requestAnimationFrame(tick);
}





function generateMediaMat(texture,windowSize) {
    console.log(texture);
    let glsl_mat = new THREE.ShaderMaterial({
        transparent:true,
        uniforms: {
            uTex: { type:"t",value: texture },// テスクチャを uTex として渡す
            uWindowSizeX: {value: windowSize.width},
            uWindowSizeY: {value: windowSize.height},
            uTexSizeX: {value: texture.width},
            uTexSizeY: {value: texture.height}
        },
        vertexShader:
            `
            void main() {
                vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                vec4 mvPosition =  viewMatrix * worldPosition;
                gl_Position = projectionMatrix * mvPosition;
            }
            `,
        fragmentShader:
            `
            precision mediump float;
            uniform sampler2D uTex;
            uniform float uWindowSizeX;
            uniform float uWindowSizeY;
            uniform float uTexSizeX;
            uniform float uTexSizeY;
            void main() {
                vec2 textureSize = vec2(uTexSizeX,uTexSizeY);
                vec2 screenUVs = vec2(gl_FragCoord.x / uWindowSizeX*0.5, gl_FragCoord.y/ (uWindowSizeY*2.0));
                if(uWindowSizeX > uWindowSizeY) {
                    screenUVs = vec2(gl_FragCoord.x / (uWindowSizeX*2.0), (gl_FragCoord.y)/ (uWindowSizeX*1.3));
                }
                vec3 color = texture2D( uTex,  screenUVs ).rgb;
                gl_FragColor = vec4(color, 0.85 );
            }
            `
    });

    return glsl_mat;

}


function returnTo3D() {
    console.log("returned");
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableDamping = true;
    let page = document.getElementById("page4");
    page.setAttribute('style','visibility:hidden');
    page.classList.remove('scroll-in');
    page.classList.add('scroll-out');
    // camera.position.set(0, 0, +1000);
    focused_object.focused = true;

    const targetDOMRect = page.getBoundingClientRect();
    const targetTop = targetDOMRect.top + window.pageYOffset;
    window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
    });
    
    tick();
}


function onStart() {
    console.log("onstart");
    //TWEEN.removeAll();
    // for (child in fbx_model) {
    //     if(child.isMesh) {
    //         console.log("update_pos");
    //         new TWEEN.Tween(child.position)
    //         .to({x: 0, y: 0, z: 0},1000)
    //         .easing(TWEEN.Easing.Exponential.InOut)
    //         .start();
    //     }
    // }
    fbx_model.traverse((child)=>{
        if(child.isMesh){
            console.log("update_pos");
            new TWEEN.Tween(child.position)
            .to({x: 2000, y: 0, z: 2000},6000)
            .easing(TWEEN.Easing.Elastic.In)
            .start();
        }
    });
}


window.addEventListener("resize", () => {
    (size.width = window.innerWidth), (size.height = window.innerHeight);
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);

    fbx_model.traverse((child)=>{
        if(child.isMesh){
            child.material.uWindowSizeX = size.width;
            child.material.uWindowSizeY = size.height;
        }
    });
});