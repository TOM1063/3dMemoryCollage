
import { FBXLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
//import { Tween } from 'https://unpkg.com/@tweenjs/tween.js@18.6.4/dist/tween.cjs.js';




//DOM定義



const canvas = document.getElementById('myCanvas');
const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', init );

const imageLoader = new THREE.TextureLoader();

const video = document.getElementById('video');


function init() {
    const overlay = document.getElementById( 'overlay' );
	overlay.remove();

    video.src = "shader/imgs/test5.mp4";
    video.play();
    video.muted = true;
    // video.setAttribute(display,"none");
    const videoTexture = new THREE.VideoTexture(video);
    //set
    const size = {
        width: window.innerWidth,
        height: window.innerHeight,
    };


    // シーンを作成
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, size.width / size.height);
    camera.far = 2000;
    camera.aspect = size.width / size.height;
    camera.position.set(0, 0, +1000);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.target.set(-2, 0, 0);

    const renderer = new THREE.WebGLRenderer({
    canvas: canvas
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(size.width, size.height);
    const bg_color  = new THREE.Color(0,0,255);
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


    //const mat = generateMediaMat('./shader/imgs/test5.JPG');


    const mats = [];

    for (let i = 0; i < 6; i ++) {
        let texture;
        if(i == 5) {
            texture = videoTexture;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            console.log(texture);
        }
        else {
            let url = './shader/imgs/test' + String(i) + '.JPG'
            texture = imageLoader.load(url);
        }
        let mat = generateMediaMat(texture);
        mats.push(mat);
    }
    //fbxをロード
    const loader = new FBXLoader();
    const objects = [];
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
                    opacity: 0.6,
                    depthTest:false,
                //wireframe: true,
                });
                if(index%3 == 0 || index%5 == 0) {
                    mat = mats[index%6];
                }
                mat.depthTest = true;
                //mat.wireframe = true;
                child.name = index;
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = mat;
                console.log(index);
                objects.push(child);
            }
            //create local data from fbx children index
            const add_data = {object_index: index, memory_text:"", image_url:""};
            //local_json.push(add_data);

            index += 1;
        });
        scene.add(object);
        const num_childs = index;
        console.log(num_childs);
    },)

    tick();

    function tick() {
        controls.update();
        renderer.render(scene, camera); // レンダリング
        videoTexture.needsUpdate = true;
    
        requestAnimationFrame(tick);
    }
    
}





function generateMediaMat(texture) {

    let glsl_mat = new THREE.ShaderMaterial({
        uniforms: {
            uTex: { type:"t",value: texture }// テスクチャを uTex として渡す
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
            void main() {
                vec2 screenUVs = vec2(gl_FragCoord.x / 3840.0, gl_FragCoord.y / 2160.0);
                vec3 color = texture2D( uTex,  screenUVs ).rgb;
                gl_FragColor = vec4(color, 1.0 );
            }
            `
    });

    return glsl_mat;

}