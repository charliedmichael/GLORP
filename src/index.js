import _ from 'lodash';
import './style.css';
import './AdditiveBlendShader.js';
import xanaduJSON from'./MSDF Xanadu/Xanadu-Regular.json';
import xanaduPNG from'./MSDF Xanadu/Xanadu-Regular.png';
import spacePZ from './images/starfield/pz.png';
import spaceNZ from './images/starfield/nz.png';
import spacePY from './images/starfield/py.png';
import spaceNY from './images/starfield/ny.png';
import spacePX from './images/starfield/px.png';
import spaceNX from './images/starfield/nx.png';
import eyeSprite from './images/eyeball-sprite2.png';
import theStar from './images/star-3.png';
import sandImage from './images/sand.png';

import theHorse from './models/Horse.glb';
import thePalm from './models/VP_Phoenix Palm_v2-no pot.glb';
import wallsAndRoof from './models/wallsandroof-33.glb';
import theRug from './models/rug.glb';
import theCouch from './models/couch-3.glb';
import theChair from './models/chair.glb';
import theSpeaker from './models/speakers.glb';
import thePlayer from './models/record_player.glb';
import slurp1 from './models/SLURP-1.glb';
import soban1 from './models/soban-15.glb';
import thesisbook1 from './models/thesisbook1-2.glb';
import recordstack1 from './models/record stack-1.glb';

import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { CopyShader } from '../node_modules/three/examples/jsm/shaders/CopyShader.js';
import { FXAAShader } from '../node_modules/three/examples/jsm/shaders/FXAAShader.js';
import { RGBShiftShader } from '../node_modules/three/examples/jsm/shaders/RGBShiftShader.js';
import { UnrealBloomPass } from '../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { PlainAnimator } from '../node_modules/three-plain-animator/lib/plain-animator.js';
import { SAOPass } from '../node_modules/three/examples/jsm/postprocessing/SAOPass.js'
import { GLTFExporter } from '../node_modules/three/examples/jsm/exporters/GLTFExporter.js'
import { UniformsUtils } from '../node_modules/three/src/renderers/shaders/UniformsUtils.js'
import { UniformsLib } from '../node_modules/three/src/renderers/shaders/UniformsLib.js'
import customShader from './customShader.js'
import { PointerLockControls } from '../node_modules/three/examples/jsm/controls/PointerLockControls.js';

// import { ObjectLoader } from './node_modules/three/src/loaders/ObjectLoader.js';



var camera, scene, renderer;
let cameraHeight;
var scene2, scene3;
let cubeCamera, reflectionCubeCam;
var geometry, material, mesh;
let controls;
var composer, composer2, composer3, bloomComposer;

let rtTexture;
let cubeRenderTarget1, cubeRenderTarget2;
let floorView;

let testBoxMat;
let count = 0;

var bloomStrength = 1.25;
var bloomRadius = 3;
var bloomThreshold = .5;

let bgCube;

let clock;

var smokeCenter, smokeLeft, smokeRight, smokeLeft2, smokeRight2;
var smoke = [];

let animator;
let eyeMesh, darkEye;
let eyeXOrbit, eyeYOrbit, eyeZOrbit;

let light1;
let light1XOrbit, light1YOrbit, light1ZOrbit;

let particleGeometry, uniforms, attributes;
let cube;

let mcEffect;

let matrix, starMesh, rMax, rMin, starCount;
let starX =[];
let starY =[];
let starZ =[];
let starPos =[];

let mixer, darkHorse, mixer2;
let prevTime = Date.now();
let horseMesh;

let palmMesh;

let bloomLayer;
let materials = {};
let ENTIRE_SCENE, BLOOM_SCENE, PORTAL;
let portalLayer;

let vColorSin;
let wallColors = [];
let wallNZGeoColors, wallNZMesh;

let sandMesh, sandScene2, sandScene3;

let vertexUniforms, wallMaterial, wallVCmat;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let crouch = false;

const cObjects = []; 

let prevCTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let raycaster;

let planarUniforms;
var projector;
let mouse = new THREE.Vector2();
let INTERSECTED;
var toolSprite;
var toolCanvas, toolContext, toolTexture;
let sceneOrtho, cameraOrtho;

let rugMesh, couchMesh, chairMesh, speakerMesh, playerMesh, slurp1Mesh, soban1Mesh, thesisbook1Mesh;
let smileyMesh, smileyHeight;
let recordstack1Mesh;

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) 
{	
	// note: texture passed by reference, will be updated by the update function.
		
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet. 
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;
		
	this.update = function( milliSec )
	{
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
		}
	};
}

function getSphere (radius, segments) {
    var geometry = new THREE.SphereGeometry(radius, segments, segments);
    
	var material = new THREE.MeshPhongMaterial({
		// color: 'rgb(20, 0, 100)', 
		// emissive: 'rgb(0, 0, 0)',
        // specular: 'rgb(85, 0, 255)',
        // reflectivity: 1.85,
		// shininess: 80,

        color: 'rgb(100, 0, 255)', 
		emissive: 'rgb(150, 0, 255)',
        specular: 'rgb(150, 0, 255)',
        reflectivity: 1.05,
		shininess: 125,

        // ambient: 'rgb(200, 0, 0)',
		roughness: .01,
		// metalness: .1,
		envMap: cubeRenderTarget1.texture,
		side: THREE.DoubleSide,
		transparent: true,
        // opacity: 0.5,
        // blending: THREE.AdditiveBlending,
    });
    
    // var material2 = new THREE.MeshPhongMaterial({
	// 	color: 'rgb(200, 0, 0)', 
	// 	emissive: 'rgb(10, 0, 255)',
    //     specular: 'rgb(255, 50, 255)',
    //     // ambient: 'rgb(200, 0, 0)',
	// 	// roughness: .01,
	// 	// metalness: .1,
	// 	shininess: 140,
	// 	// envMap: cubeRenderTarget1.texture,
	// 	side: THREE.DoubleSide,
	// 	transparent: true,
    //     // opacity: 1,
    //     reflectivity: 1,
    //     // blending: THREE.AdditiveBlending,
	// });

	material.envMap.mapping = THREE.CubeRefractionMapping;

	let sphereMesh = new THREE.Mesh(geometry, material);
	sphereMesh.castShadow = false;

	return sphereMesh;
}

function smokeLine (xStart1, yStart1, xEnd1, yEnd1, xStart2, yStart2, xEnd2, yEnd2) {
    var step = 99;
    var increment = .01;
    var startPoint1 = new THREE.Vector3(xStart1, yStart1, 0);
    var endPoint1 = new THREE.Vector3(xEnd1, yEnd1, 0);
    var startPoint2 = new THREE.Vector3(xStart2, yStart2, 0);
    var endPoint2 = new THREE.Vector3(xEnd2, yEnd2, 0);
       
    var vertices = [];

    for (let i = 0; i <= 1; i = i + increment) {
        var j = new THREE.Vector3().lerpVectors(startPoint1, endPoint1, i);
        vertices.push(j.x);
        vertices.push(j.y);
        vertices.push(j.z);
    }

    for (let i = 0; i <= 1; i = i + increment) {
        var j = new THREE.Vector3().lerpVectors(startPoint2, endPoint2, i);
        vertices.push(j.x);
        vertices.push(j.y);
        vertices.push(j.z);
    }

    var positions = Float32Array.from(vertices);

    // var theNormal = [];

    // for (i = 0; i < vertices.length; i++) {
    //     theNormal.push(0);
    //     theNormal.push(0);
    //     theNormal.push(1);
    // }

    // var normals = Float32Array.from(theNormal);

    var combo = new THREE.BufferGeometry();

    combo.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );
    // combo.setAttribute(
    //     'normal',
    //     new THREE.BufferAttribute(normals, 3)
    // );

    // combo.computeVertexNormals();

    var indices = [];

    for (let i = 0; i < step; i++) {
        indices.push(i);
        indices.push(i+step+2);
        indices.push(i+1);

        indices.push(i);
        indices.push(i+step+1);
        indices.push(i+step+2);

    }

    combo.setIndex( indices );

    var material = new THREE.MeshBasicMaterial({
        color: '#aaa', 
        // roughness: 0,
        side: THREE.DoubleSide,
        // blending: THREE.AdditiveBlending,
        // transparent: true

    });

    var mesh = new THREE.Mesh(combo, material);

    return mesh;
}

function init() {
    
    // SCENES
    scene = new THREE.Scene();
    scene2 = new THREE.Scene();
    scene3 = new THREE.Scene();

    // LAYERS
    ENTIRE_SCENE = 0, BLOOM_SCENE = 1, PORTAL = 2;

    bloomLayer = new THREE.Layers();
    bloomLayer.set( BLOOM_SCENE );

    portalLayer = new THREE.Layers();
    portalLayer.set( PORTAL );

    // BG CUBE
    let bgMaterial = [];
    let texture_ft = new THREE.TextureLoader().load( spacePZ );
    let texture_bk = new THREE.TextureLoader().load( spaceNZ );
    let texture_up = new THREE.TextureLoader().load( spacePY );
    let texture_dn = new THREE.TextureLoader().load( spaceNY );
    let texture_rt = new THREE.TextureLoader().load( spacePX );
    let texture_lf = new THREE.TextureLoader().load( spaceNX );
      
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_up }));
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
       
    for (let i = 0; i < 6; i++)
      bgMaterial[i].side = THREE.BackSide;

    let bgGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
    bgCube = new THREE.Mesh( bgGeo, bgMaterial );
    scene.add( bgCube );

    // bgCube = new THREE.Mesh(bgGeo, bgMaterial);
    // scene.add(bgCube);

    // CAMERA
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
    cameraHeight = 4;
    camera.position.set(0, cameraHeight, 4);
    // camera.rotation.z = Math.PI;
    // camera.layers.enable( ENTIRE_SCENE);
    // camera.layers.enable( BLOOM_SCENE );
    // camera.layers.enable( PORTAL );

    camera.layers.enableAll();

    // cameraOrtho = new THREE.OrthographicCamera( - window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, - window.innerHeight / 2, 1, 10 );
    // cameraOrtho.position.z = 10;
    // sceneOrtho = new THREE.Scene();

    // floorView = new THREE.PerspectiveCamera(155.5, window.innerWidth / window.innerHeight, 1, 10000);
    // floorView.position.set(0, 0, 0);
    // floorView.lookAt(0, 1, 0);

    // CUBE CAMERA
    rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget( 1024, {
        format: THREE.RGBFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        // encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
    } );    
    cubeCamera = new THREE.CubeCamera( 1, 10000, cubeRenderTarget1 );
    cubeCamera.position.set(0, 3, 0);
    // scene.add(cubeCamera);

    // cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget( 1024, {
    //     format: THREE.RGBFormat,
    //     generateMipmaps: true,
    //     minFilter: THREE.LinearMipmapLinearFilter,
    //     // encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
    // } ); 
    // reflectionCubeCam = new THREE.CubeCamera( 1, 10000, cubeRenderTarget2 );
    // reflectionCubeCam.position.set( -7, 1, 5 );
    // reflectionCubeCam.rotation.y = Math.PI;

    // CLOCK
    clock = new THREE.Clock();

    // FOG
    // scene.fog = new THREE.Fog ('black', 10, 50);

    // LIGHTS
    light1 = new THREE.PointLight('#fff', 1);
    light1.castShadow = true;
    light1.shadow.bias = -0.005; // 0.0001 creates cool lines
    light1.position.y = 16;
    scene.add(light1);
    light1.shadow.mapSize.width = Math.pow(2, 11); 
    light1.shadow.mapSize.height = Math.pow(2, 11); 
    light1.shadow.camera.near = 0.1; 
    light1.shadow.camera.far = 40; 
    // light.shadowCameraVisible = true;
    // light.shadowDarkness = .5;

    let light2 = light1.clone();
    scene3.add(light2);

    let pointLightHelper = new THREE.PointLightHelper( light1, 1 );
    scene.add( pointLightHelper );

    light1XOrbit = 15;
    light1YOrbit = 1;
    light1ZOrbit = 15;

    // var light3 = new THREE.PointLight('#fff', 1.25);
    // light3.castShadow = true;
    // light3.position.set(-2, 7, -3);
    // scene.add(light3);

    var ambientLight = new THREE.AmbientLight('#555'); 
	// ambientLight.position.set( light1.position );
    // ambientLight.layers.set( 1 );
    scene3.add(ambientLight);
    scene.add(ambientLight);

    var ambientLight2 = new THREE.AmbientLight('#111'); 
    // scene.add(ambientLight2);
    
    // var hemiLight = new THREE.HemisphereLight('#99f', '#0f6', .35);
    var hemiLight = new THREE.HemisphereLight('#ccc', '#ccc', .25);

    // scene.add(hemiLight);
    
    // TOOL TIPS
    // projector = new THREE.Raycaster(); 
    
    // function onMouseMove( event ) { 
    //   // calculate mouse position in normalized device coordinates 
    //   // (-1 to +1) for both components 
    //   mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1; 
    //   mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1; 
    // } 
    
	// document.addEventListener( 'mousemove', onMouseMove, false );

    // toolCanvas = document.createElement('canvas');
	// toolContext = toolCanvas.getContext('2d');
	// toolContext.font = "Bold 20px Arial";
	// toolContext.fillStyle = "rgba(0,0,0,0.95)";
    // toolContext.fillText('Hello, world!', 0, 20);

    // toolTexture = new THREE.Texture(toolCanvas); 
	// toolTexture.needsUpdate = true;

    // var toolMaterial = new THREE.SpriteMaterial( { 
    //     map: toolTexture, 
    //     // useScreenCoordinates: true, 
    //     // alignment: THREE.SpriteAlignment.topLeft 
    // } );
	
	// toolSprite = new THREE.Sprite( toolMaterial );
	// toolSprite.scale.set( toolMaterial.map.image.width, toolMaterial.map.image.height, 1.0 );
	// toolSprite.center.set( mouse.x, mouse.y );
	// sceneOrtho.add( toolSprite );	

    // DARK MATERIAL
    var darkMaterial = new THREE.MeshBasicMaterial({
        color: 'black',
        side: THREE.DoubleSide,
        transparent: true
    });

    var darkBack = new THREE.MeshBasicMaterial({
        color: 'black',
        side: THREE.BackSide,
        transparent: true
    });

    // PORTAL
    var sphere = getSphere(1.49, 50);
    sphere.position.set(0, 4, 0);
    sphere.scale.set(1, 1, 0.2);
    scene.add(sphere);
    sphere.layers.set( ENTIRE_SCENE );
    var darkSphere = sphere.clone();
    darkSphere.material = darkMaterial;
    scene2.add(darkSphere);
    let darkSphere2 = darkSphere.clone();
    darkSphere2.material = darkBack;
    scene3.add(darkSphere2);
    // darkSphere.layers.set( BLOOM_SCENE );

     // MSDF
     const textContainer = new ThreeMeshUI.Block({
		width: 3,
		height: 2,
		padding: 0.05,
		justifyContent: 'center',
		alignContent: 'center',
		fontFamily: xanaduJSON,
        fontTexture: xanaduPNG,
        backgroundOpacity: 0
	});

	textContainer.add(

		new ThreeMeshUI.Text({
			content: "XANADU",
			fontSize: 0.75
		}),	

    );
    
    textContainer.position.set( 0, 4, 0 );
    // scene.add( textContainer );
    scene3.add( textContainer );

    // textContainer.layers.enableAll(  );
    // textContainer.renderOrder = 999;
    // textContainer.onBeforeRender = function( renderer ) { renderer.clearDepth(); };

    // FLOOR
    var size = 21;
    var floorGeo = new THREE.PlaneGeometry(size, size, size, size);
    var scale = size*16;
	var scale2 = size*8;

	var canvas = document.createElement('canvas'),
	ctx = canvas.getContext('2d');
	canvas.width = scale;
	canvas.height = scale;
	ctx.fillStyle = "#000";
    ctx.fillRect( 0, 0, scale, scale );
    ctx.fillStyle = "#eee";
    ctx.fillRect( 0, 0, scale2, scale2 );
    ctx.fillRect( scale2, scale2, scale2, scale2 );

    var texture = new THREE.Texture(canvas);
    texture.repeat.set( 10, 10 ); // CHANGE THIS FOR CHECKER SIZE
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    var floorMat = new THREE.MeshStandardMaterial({
        // color: '#fff',
        map: texture,
        // map: texture,
        // envMap: cubeCamera.renderTarget,
        side: THREE.DoubleSide,
        // transparent: true,
        // opacity: .5,
        // blending: THREE.AdditiveBlending,
    });
    var floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = Math.PI/2;
    floorMesh.receiveShadow = true;
    floorMesh.position.set(0, -1, 6.5);
    scene.add(floorMesh);

    // floorMesh.material = floorChecker;
    floorMesh.position.y += 0.01; // COMPENSATE for overlap with wallNZ

    var lowCanvas = document.createElement('canvas'),
	ctx = lowCanvas.getContext('2d');
	lowCanvas.width = scale;
	lowCanvas.height = scale;
	ctx.fillStyle = "#000";
    ctx.fillRect( 0, 0, scale, scale );
    ctx.fillStyle = "#0c4";
    ctx.fillRect( 0, 0, scale2, scale2 );
    ctx.fillRect( scale2, scale2, scale2, scale2 );

    var lowTexture = new THREE.Texture(lowCanvas);
    lowTexture.repeat.set( 10, 10 ); // CHANGE THIS FOR CHECKER SIZE
    lowTexture.wrapS = THREE.RepeatWrapping;
    lowTexture.wrapT = THREE.RepeatWrapping;
    lowTexture.needsUpdate = true;

    var floorMatGreen = new THREE.MeshStandardMaterial({
        // color: '#fff',
        map: lowTexture,
        // map: texture,
        // envMap: cubeCamera.renderTarget,
        side: THREE.DoubleSide,
        // transparent: true,
        // opacity: .5,
        // blending: THREE.AdditiveBlending,
    });

    let lowFloor = floorMesh.clone();
    lowFloor.material = floorMatGreen;

    lowFloor.position.y -= 0.02;
    // scene.add( lowFloor );

    var darkFloor = floorMesh.clone();
    darkFloor.position.set(0, -1, 6);
    darkFloor.material = darkMaterial;
    scene2.add(darkFloor);
    let darkFloor2 = darkFloor.clone();
    scene3.add(darkFloor2);
    // darkFloor.layers.enable( BLOOM_SCENE );
    // darkFloor.layers.enable( PORTAL );
    // darkFloor.layers.disableAll();

    // WALLS AND ROOF GLTF
    let loader = new GLTFLoader();

    let wallsGLTFInit = false;

    if ( wallsGLTFInit ) {

        let wallsGLTF;
        let wallsScale = 1;
        loader.load( wallsAndRoof, function ( gltf ) {

            wallsGLTF = gltf.scene;
            wallsGLTF.traverse(function(o) {
                if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                o.layers.enable( 1 );
                

                }
            });
            wallsGLTF.scale.set(wallsScale, wallsScale, wallsScale);
            wallsGLTF.position.set(0, 0, 0);
            wallsGLTF.castShadow = true;
            wallsGLTF.receiveShadow = true;
            scene.add( gltf.scene );
            
        } );

    }    

    // WALL GEO
    let vCount;

    let vcMaterial = new THREE.MeshStandardMaterial({
        color: '#fff',
        vertexColors: true,
    });

    var wallMaterial = new THREE.MeshStandardMaterial( {
        color: '#fff',
        // map: texture,
        side: THREE.DoubleSide,
        // shininess: 100
    });

    const vShader = `
    #define LAMBERT
    varying vec3 vLightFront;
    varying vec3 vIndirectFront;
    #ifdef DOUBLE_SIDED
        varying vec3 vLightBack;
        varying vec3 vIndirectBack;
    #endif
    #include <common>
    #include <uv_pars_vertex>

    #include <displacementmap_pars_vertex>

    #include <uv2_pars_vertex>
    #include <envmap_pars_vertex>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>

    varying vec3 Normal;
    varying vec3 Position;
    varying vec3 vNormal;
    varying vec3 wNormal;

    void main() {
        vNormal = normal;
        wNormal = vec3(modelMatrix * vec4(normal, 0.0));
        Normal = normalize(normalMatrix * normal);
        Position = vec3(modelViewMatrix * vec4(position, 1.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        
        #include <uv_vertex>
        #include <uv2_vertex>
        #include <color_vertex>
        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
        #include <begin_vertex>
        #include <morphtarget_vertex>
        #include <skinning_vertex>
        #include <project_vertex>
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>
        #include <worldpos_vertex>
        #include <envmap_vertex>
        #include <lights_lambert_vertex>
        #include <shadowmap_vertex>
        #include <fog_vertex>

    }`
   
    const fShader = `
    precision highp float;


    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform float opacity;
    varying vec3 vLightFront;
    varying vec3 vIndirectFront;
    #ifdef DOUBLE_SIDED
        varying vec3 vLightBack;
        varying vec3 vIndirectBack;
    #endif

    varying vec3 vNormal;


    #include <common>
    #include <packing>
    #include <dithering_pars_fragment>
    #include <color_pars_fragment>
    #include <uv_pars_fragment>

    #include <bumpmap_pars_fragment>
    #include <normalmap_pars_fragment>    

    #include <uv2_pars_fragment>
    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <aomap_pars_fragment>
    #include <lightmap_pars_fragment>
    #include <emissivemap_pars_fragment>
    #include <envmap_common_pars_fragment>
    #include <envmap_pars_fragment>
    #include <cube_uv_reflection_fragment>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <fog_pars_fragment>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>
    #include <specularmap_pars_fragment>



    #include <logdepthbuf_pars_fragment>
    #include <clipping_planes_pars_fragment>

    varying vec3 Normal;
    varying vec3 Position;
    varying vec3 wNormal;

    uniform vec3 Ka;
    uniform vec3 Kd;
    uniform vec3 Ks;
    uniform vec4 LightPosition;
    uniform vec3 LightIntensity;
    uniform float Shininess;

    vec3 phong() {
        vec3 n = normalize(Normal);
        vec3 s = normalize(vec3(LightPosition) - Position);
        vec3 v = normalize(vec3(-Position));
        vec3 r = reflect(-s, n);

        vec3 ambient = Ka;
        vec3 diffuse = Kd * max(dot(s, n), 0.0);
        vec3 specular = Ks * pow(max(dot(r, v), 0.0), Shininess);

        return LightIntensity * (ambient + diffuse + specular);
    }

    void main() {

        #include <clipping_planes_fragment>

        vec4 diffuseColor = vec4( diffuse, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveRadiance = emissive;

        #include <logdepthbuf_fragment>

        #include <normal_fragment_begin>
        #include <normal_fragment_maps>  


        vec4 normalColor = vec4( packNormalToRGB( wNormal ), opacity );

        vec3 green = vec3( 0.0 + normalColor.y, 1.0, 0.45 );
        vec3 lavender = vec3( 0.8, 0.8, 1.0 ); 
        vec3 mixColor = mix( green, lavender, normalColor.y );

        diffuseColor = vec4( mixColor, opacity );
        // diffuseColor = normalColor;        

        #include <map_fragment>
        #include <color_fragment>
        #include <alphamap_fragment>
        #include <alphatest_fragment>
        #include <specularmap_fragment>
        #include <emissivemap_fragment>
        
        // accumulation
        
        #ifdef DOUBLE_SIDED
            reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;
        #else
            reflectedLight.indirectDiffuse += vIndirectFront;
        #endif
        #include <lightmap_fragment>
        reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );
        #ifdef DOUBLE_SIDED
            reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
        #else
            reflectedLight.directDiffuse = vLightFront;
        #endif
        reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();
        
        // modulation
        
        #include <aomap_fragment>
        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
        #include <envmap_fragment>

        gl_FragColor = vec4( outgoingLight, diffuseColor.a );
        
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
        #include <premultiplied_alpha_fragment>
        #include <dithering_fragment>

        // gl_FragColor = vec4(phong(), 1.0);
    }
    `

    let wallShader = {

        uniforms: UniformsUtils.merge( [
            UniformsLib[ 'fog' ],
            UniformsLib[ 'lights' ],
            UniformsLib[ 'shadowmap' ],
            {
                u_mouse: { value: { x: window.innerWidth / 2, y: window.innerHeight / 2 } },
                u_resolution: { value: { x: window.innerWidth, y: window.innerHeight } },
                u_time: { value: 0.0 },
                u_color: { value: new THREE.Color(0xFF0000) },
                positions: { type: "t", value: null },
                pointSize: { type: "f", value: 1 },
                color1: { type: 'c', value: ( new THREE.Color( 0x2095cc) ) },
                color2: { type: 'c', value: ( new THREE.Color( 0x20cc31) ) },
                lightPosition: { type: 'v3', value: light1.position },
            }
        ] ),
        
        vertexShader: [
            // THREE.ShaderChunk[ 'common' ],
            // THREE.ShaderChunk[ 'fog_pars_vertex' ],
            // THREE.ShaderChunk[ 'shadowmap_pars_vertex' ],
    
            // 'varying vec2 v_uv;',
        
            // 'attribute float displacement;',
            // 'varying float pos;',
        
            // 'void main() {',
            // 'pos = displacement;',
            // 'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            // THREE.ShaderChunk[ 'shadowmap_vertex' ],
            // '}'
            'attribute vec3 offset;',
            'attribute vec4 orientation;',
            'attribute vec3 color;',

            'varying vec3 pos;',
            'varying vec3 vNormal;',
            'varying vec3 vWorldPosition;',
            'varying vec3 vColor;',
            'varying vec3 vLightDir;',

            'uniform vec3 lightPosition;',

            'vec3 applyQuaternionToVector( vec4 q, vec3 v ){',
                'return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );',
            '}',

            THREE.ShaderChunk["common"],
            THREE.ShaderChunk["shadowmap_pars_vertex"],

            'void main() {',
                'vColor = color;',

                'vec3 vPosition = applyQuaternionToVector( orientation, position );',
                'pos = vPosition + offset;',

                'vNormal = normalMatrix * vec3(normal + normalize(offset) * 0.3);',

                'vec4 worldPosition = modelMatrix * vec4(pos, 1.0);',
                'vWorldPosition = worldPosition.xyz;',

                'vLightDir = mat3(viewMatrix) * (lightPosition - vWorldPosition);',

                'gl_Position = projectionMatrix * viewMatrix * worldPosition;',
                THREE.ShaderChunk["shadowmap_vertex"],
            '}'
        ].join( '\n' ),

        fragmentShader: [
            // THREE.ShaderChunk[ 'common' ],
            // THREE.ShaderChunk[ 'packing' ],
            // THREE.ShaderChunk[ 'bsdfs' ],
            // THREE.ShaderChunk[ 'lights_pars_begin' ],
            // THREE.ShaderChunk[ 'shadowmap_pars_fragment' ],
            // THREE.ShaderChunk[ 'shadowmask_pars_fragment' ],

            // 'varying vec2 v_uv;',
            // 'uniform vec2 u_mouse;',
            // 'uniform vec2 u_resolution;',
            // 'uniform vec3 u_color;',
            // 'uniform float u_time;',

            // 'uniform vec3 color1;',
            // 'uniform vec3 color2;',
            // 'varying float pos;',

            // 'void main() {',
            //     'vec3 color1 = vec3(134.0/255.0, 37.0/255.0, 25.0/255.0);',
            //     'vec3 color2 = vec3(174.0/255.0, 95.0/255.0, 57.0/255.0);',
            
            //     'vec3 outgoingLight = mix(color1, color2, smoothstep(0.9, 0.1, pos));',
            
            //     'float shadowMask = max(getShadowMask(), 0.75);',
            //     'outgoingLight *= shadowMask;',
            
            //     'gl_FragColor = vec4(outgoingLight, 1.0);',
            //     THREE.ShaderChunk[' shadowmap_fragment '],
            // '}'
            THREE.ShaderChunk['common'],
        THREE.ShaderChunk['packing'],
        'varying vec3 pos;',
        'varying vec3 vNormal;',
        'varying vec3 vWorldPosition;',
        'varying vec3 vColor;',
        'varying vec3 vLightDir;',

        THREE.ShaderChunk['shadowmap_pars_fragment'],
        'void main() {',
            'vec3 lightDirection = normalize(vLightDir);',

            'float c = max(0.0, dot(vNormal, lightDirection)) * 2.;',
            // 'gl_FragColor = vec4(vColor.r + c , vColor.g + c , vColor.b + c , 1.);',
            'gl_FragColor = vec4(.3+c , .3+c , .3+c , 1.);',
            THREE.ShaderChunk['shadowmap_fragment'],
        '}'
        ].join( '\n' )

    };  

    let wallUniforms = THREE.UniformsUtils.clone( wallShader.uniforms );

    let firstUniforms = {
        u_mouse: { value: { x: window.innerWidth / 2, y: window.innerHeight / 2 } },
        u_resolution: { value: { x: window.innerWidth, y: window.innerHeight } },
        u_time: { value: 0.0 },
        u_color: { value: new THREE.Color(0xFF0000) },
        Ka: { value: new THREE.Vector3(0.9, 0.5, 0.3) },
        Kd: { value: new THREE.Vector3(0.9, 0.5, 0.3) },
        Ks: { value: new THREE.Vector3(0.8, 0.8, 0.8) },
        LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
        LightPosition: { value: light1.position },
        Shininess: { value: 200.0 },
        
    }

    vertexUniforms = THREE.UniformsUtils.merge([ firstUniforms, 
                                                 THREE.UniformsLib.lights, 
                                                 THREE.UniformsLib.shadowmap, 
                                                 THREE.UniformsLib.ambient, 
                                                 THREE.ShaderLib.lambert.uniforms,
                                               
    ]);

    vertexUniforms.diffuse.value = new THREE.Color( 0x00ff33 );
    
    wallVCmat = new THREE.ShaderMaterial( {
        uniforms: vertexUniforms,
        vertexShader: vShader,
        fragmentShader: fShader,
        lights: true,
        side: THREE.DoubleSide,
        // blending: THREE.NoBlending

    });

    // var wallMaterial = new THREE.MeshNormalMaterial( {
    //     // color: '#fff',
    //     // map: texture,
    //     // side: THREE.DoubleSide,
    //     // shininess: 100
    //     // wireframe: true,

    // });

    let materialSlot = wallVCmat;

    // WALL NZ
    var wallNZ = new THREE.Shape();
    wallNZ.moveTo(-10, -1);
    wallNZ.lineTo(10, -1);
    wallNZ.lineTo(10, 10);
    wallNZ.lineTo(-10, 10);
    var hole = new THREE.Shape();
    hole.moveTo(-4, -1);
    hole.lineTo(4, -1);
    hole.lineTo(4, 4);
    hole.bezierCurveTo(4, 6.25, 2.25, 8, 0, 8);
    hole.bezierCurveTo(-2.25, 8, -4, 6.25, -4, 4);
    hole.lineTo(-4, -1);

    wallNZ.holes.push( hole );    

    var extrudeSettings = { 
        depth: .5, 
        curveSegments: 150,
        bevelEnabled: false, 
        bevelSegments: 2, 
        steps: 2, 
        bevelSize: 1, 
        bevelThickness: 1 
    };

    var wallNZGeo = new THREE.ExtrudeBufferGeometry( wallNZ, extrudeSettings );

    wallNZMesh = new THREE.Mesh(wallNZGeo, materialSlot);

    wallNZMesh.position.set(0, 0, -4);
    wallNZMesh.castShadow = true;
    wallNZMesh.receiveShadow = true;

    wallColors.push( wallNZMesh );

    //WALL NX
    var wallNX = new THREE.Shape();
    wallNX.moveTo(-11, -1);
    wallNX.lineTo(10, -1);
    wallNX.lineTo(10, 10);
    wallNX.lineTo(-11, 10);

    var windowX = -5;
    var windowY = 7;
    var windowR = 2;

    var holeNX = new THREE.Shape();
    holeNX.moveTo(windowX, windowY + windowR);
    holeNX.bezierCurveTo(windowX + windowR/2, windowY + windowR, windowX+windowR, windowY+windowR/2, windowX+windowR, windowY);
    holeNX.bezierCurveTo(windowX+windowR, windowY-windowR/2, windowX+windowR/2, windowY-windowR, windowX, windowY-windowR);
    holeNX.bezierCurveTo(windowX-windowR/2, windowY-windowR, windowX-windowR, windowY-windowR/2, windowX-windowR, windowY);
    holeNX.bezierCurveTo(windowX-windowR, windowY+windowR/2, windowX-windowR/2, windowY+windowR, windowX, windowY+windowR);

    wallNX.holes.push( holeNX );    

    // var extrudeSettings = { 
    //     depth: .5, 
    //     curveSegments: 100,
    //     bevelEnabled: false, 
    //     bevelSegments: 2, 
    //     steps: 2, 
    //     bevelSize: 1, 
    //     bevelThickness: 1 
    // };

    var wallNXGeo = new THREE.ExtrudeBufferGeometry( wallNX, extrudeSettings );


   

    // for ( let i = 0; i < vCount; i ++ ) {

    //     color.setHSL( ( wallNXGeoPos.getY( i ) * .005 + .825 ) / 2, 1, .75 );
    //     wallNXGeoColors.setXYZ( i, color.r, color.g, color.b );

    // }


    var wallNXMesh = new THREE.Mesh(wallNXGeo, materialSlot);

    wallNXMesh.position.set(-10.5, 0, 6);
    wallNXMesh.rotation.y = Math.PI/2;
    wallNXMesh.castShadow = true;
    wallNXMesh.receiveShadow = true;


    // WALL PZ
    var wallPZ = new THREE.Shape();
    wallPZ.moveTo(-10, -1);
    wallPZ.lineTo(10, -1);
    wallPZ.lineTo(10, 10);
    wallPZ.lineTo(-10, 10);

    windowX = 0;
    windowY = 5;
    windowR = 1;  
    var windowL = 7;   

    var holePZ = new THREE.Shape();
    holePZ.moveTo(windowX + windowL, windowY + windowR);
    holePZ.bezierCurveTo(windowX + windowL + windowR/2, windowY + windowR, windowX+windowL+windowR, windowY+windowR/2, windowX+windowL+windowR, windowY);
    holePZ.bezierCurveTo(windowX+windowL+windowR, windowY-windowR/2, windowX+windowL+windowR/2, windowY-windowR, windowX+windowL, windowY-windowR);
    holePZ.lineTo(windowX - windowL, windowY - windowR);
    holePZ.bezierCurveTo(windowX-windowL-windowR/2, windowY-windowR, windowX-windowL-windowR, windowY-windowR/2, windowX-windowL-windowR, windowY);
    holePZ.bezierCurveTo(windowX-windowL-windowR, windowY+windowR/2, windowX-windowL-windowR/2, windowY+windowR, windowX-windowL, windowY+windowR);
    // holePZ.lineTo(windowX + windowL, windowY + windowR);

    wallPZ.holes.push( holePZ );    

    extrudeSettings = { 
        depth: .5, 
        curveSegments: 150,
        bevelEnabled: false, 
        bevelSegments: 2, 
        steps: 2, 
        bevelSize: 1, 
        bevelThickness: 1 
    };

    var wallPZGeo = new THREE.ExtrudeBufferGeometry( wallPZ, extrudeSettings );

   

    // for ( let i = 0; i < vCount; i ++ ) {

    //     color.setHSL( ( wallPZGeoPos.getY( i ) * .005 + .825 ) / 2, 1, .75 );
    //     wallPZGeoColors.setXYZ( i, color.r, color.g, color.b );

    // }


    var wallPZMesh = new THREE.Mesh(wallPZGeo, materialSlot);

    wallPZMesh.position.set(0, 0, 16.5);

    wallPZMesh.castShadow = true;
    wallPZMesh.receiveShadow = true;


    //WALL PX
    var wallPX = new THREE.Shape();
    wallPX.moveTo(-11, -1);
    wallPX.lineTo(10, -1);
    wallPX.lineTo(10, 10);
    wallPX.lineTo(-11, 10);

    var windowX = 0;
    var windowY = -1;
    var windowR = 3;

    var holePX = new THREE.Shape();
    holePX.moveTo(windowX-windowR, windowY);
    holePX.bezierCurveTo(windowX-windowR, windowY+windowR/2, windowX-windowR/2, windowY+windowR, windowX, windowY+windowR);
    holePX.bezierCurveTo(windowX+windowR/2, windowY+windowR, windowX+windowR, windowY+windowR/2, windowX+windowR, windowY);
    
    wallPX.holes.push( holePX );    

    extrudeSettings = { 
        depth: .5, 
        curveSegments: 100,
        bevelEnabled: false, 
        bevelSegments: 2, 
        steps: 2, 
        bevelSize: 1, 
        bevelThickness: 1 
    };

    var wallPXGeo = new THREE.ExtrudeBufferGeometry( wallPX, extrudeSettings );

  

    // for ( let i = 0; i < vCount; i ++ ) {

    //     color.setHSL( ( wallPXGeoPos.getY( i ) * .005 + .825 ) / 2, 1, .75 );
    //     wallPXGeoColors.setXYZ( i, color.r, color.g, color.b );

    // }


    var wallPXMesh = new THREE.Mesh(wallPXGeo, materialSlot);

    wallPXMesh.position.set(10, 0, 6);
    wallPXMesh.rotation.y = Math.PI/2;

    wallPXMesh.castShadow = true;
    wallPXMesh.receiveShadow = true;

    // ROOF
    var roof = new THREE.Shape();
    roof.moveTo(-10.5, -10.5);
    roof.lineTo(10.5, -10.5);
    roof.lineTo(10.5, 10.5);
    roof.lineTo(-10.5, 10.5);

    var windowX = 0;
    var windowY = 0;
    var windowR = 7;

    var roofHole = new THREE.Shape();
    roofHole.moveTo(windowX, windowY + windowR);
    roofHole.bezierCurveTo(windowX + windowR/2, windowY + windowR, windowX+windowR, windowY+windowR/2, windowX+windowR, windowY);
    roofHole.bezierCurveTo(windowX+windowR, windowY-windowR/2, windowX+windowR/2, windowY-windowR, windowX, windowY-windowR);
    roofHole.bezierCurveTo(windowX-windowR/2, windowY-windowR, windowX-windowR, windowY-windowR/2, windowX-windowR, windowY);
    roofHole.bezierCurveTo(windowX-windowR, windowY+windowR/2, windowX-windowR/2, windowY+windowR, windowX, windowY+windowR);

    roof.holes.push( roofHole );    

    // var extrudeSettings = { 
    //     depth: .5, 
    //     curveSegments: 100,
    //     bevelEnabled: false, 
    //     bevelSegments: 2, 
    //     steps: 2, 
    //     bevelSize: 1, 
    //     bevelThickness: 1 
    // };

    var roofGeo = new THREE.ExtrudeBufferGeometry( roof, extrudeSettings );


  

    // for ( let i = 0; i < vCount; i ++ ) {

    //     color.setHSL( ( roofGeoPos.getY( i ) * .005 + .825 ) / 2, 1, .75 );
    //     roofGeoColors.setXYZ( i, color.r, color.g, color.b );

    // }
    // vHue(roofGeoPos, roofGeoColors, vCount);

    

    var roofMesh = new THREE.Mesh(roofGeo, materialSlot);

    roofMesh.position.set(0, 10, 6.5);
    roofMesh.rotation.x = Math.PI/2;
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;

    // VERTEX COLORS ASSIGNMENT
    let vcInit = false;

    let color = new THREE.Color();
    let vColorBase = 0.7;

    function vHue(geoPos, geoColors, count) {
    
        for ( let i = 0; i < count; i ++ ) {
            color.setRGB(vColorBase - ( geoPos.getZ( i ) * 0.03 ),
                        1,
                        vColorBase
                        );
            geoColors.setXYZ( i, color.r, color.g, color.b );

            }
    }

    if ( vcInit ) {

        // NZ
        vCount = wallNZGeo.attributes.position.count; 
        wallNZGeo.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( vCount * 3 ), 3 ) );
        let wallNZGeoPos = wallNZGeo.attributes.position;
        let wallNZGeoColors = wallNZGeo.attributes.color;
        vHue(wallNZGeoPos, wallNZGeoColors, vCount);

        // NX
        vCount = wallNXGeo.attributes.position.count; 
        wallNXGeo.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( vCount * 3 ), 3 ) );
        let wallNXGeoPos = wallNXGeo.attributes.position;
        let wallNXGeoColors = wallNXGeo.attributes.color;
        vHue(wallNXGeoPos, wallNXGeoColors, vCount);

        // PZ
        vCount = wallPZGeo.attributes.position.count; 
        wallPZGeo.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( vCount * 3 ), 3 ) );
        let wallPZGeoPos = wallPZGeo.attributes.position;
        let wallPZGeoColors = wallPZGeo.attributes.color;
        vHue(wallPZGeoPos, wallPZGeoColors, vCount);
        
        // PX
        vCount = wallPXGeo.attributes.position.count; 
        wallPXGeo.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( vCount * 3 ), 3 ) );
        let wallPXGeoPos = wallPXGeo.attributes.position;
        let wallPXGeoColors = wallPXGeo.attributes.color;
        vHue(wallPXGeoPos, wallPXGeoColors, vCount);

        // ROOF
        vCount = roofGeo.attributes.position.count; 
        roofGeo.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( vCount * 3 ), 3 ) );
        let roofGeoPos = roofGeo.attributes.position;
        let roofGeoColors = roofGeo.attributes.color;
        for ( let i = 0; i < vCount; i ++ ) {

            // color.setHSL( ( geoPos.getY( i ) * .005 + vColorSin ) / 2, 
            //                 .2 + ( Math.abs( geoPos.getY( i ) ) * .1 ),
            //                  .75 
            //             );
            color.setRGB(vColorBase - ( roofGeoPos.getZ( i ) * 0.03 ),
                         1,
                         vColorBase
                         );
            roofGeoColors.setXYZ( i, color.r, color.g, color.b );
    
        }

    }

    // WALL INIT
    var wallInit = true;
    if (wallInit) {

        scene.add(wallNZMesh);
        scene.add(wallNXMesh);
        scene.add(wallPZMesh);
        scene.add(wallPXMesh);
        scene.add( roofMesh );

        cObjects.push( wallNZMesh );
        cObjects.push( wallNXMesh );
        cObjects.push( wallPZMesh );
        cObjects.push( wallPXMesh );
        cObjects.push( roofMesh );

    }
    
    // GLTF EXPORTER
    let yesExport = false;
    if ( yesExport ) {
    const link = document.createElement( 'a' );
			link.style.display = 'none';
			document.body.appendChild( link ); // Firefox workaround, see #6594

    function save( blob, filename ) {

        link.href = URL.createObjectURL( blob );
        link.download = filename;
        link.click();

        // URL.revokeObjectURL( url ); breaks Firefox...

    }

    function saveString( text, filename ) {

        save( new Blob( [ text ], { type: 'text/plain' } ), filename );

    }


    function saveArrayBuffer( buffer, filename ) {

        save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

    }

    function exportGLTF( input ) {

        const gltfExporter = new GLTFExporter();

        // const options = {
        //     trs: document.getElementById( 'option_trs' ).checked,
        //     onlyVisible: document.getElementById( 'option_visible' ).checked,
        //     truncateDrawRange: document.getElementById( 'option_drawrange' ).checked,
        //     binary: document.getElementById( 'option_binary' ).checked,
        //     maxTextureSize: Number( document.getElementById( 'option_maxsize' ).value ) || Infinity // To prevent NaN value
        // };
        gltfExporter.parse( input, function ( result ) {

            if ( result instanceof ArrayBuffer ) {

                saveArrayBuffer( result, 'sceneA.glb' );

            } else {

                const output = JSON.stringify( result, null, 2 );
                console.log( output );
                saveString( output, 'sceneB.gltf' );

            }

        }, 
        // options
         );

    }

    exportGLTF( [ wallNZMesh, wallPZMesh, wallNXMesh, wallPXMesh, roofMesh ] );
    }

    // ROOM LIGHTING
    // let xGroup = [];
    // xGroup.push(floorMesh);
    // xGroup.push(wallNZMesh);
    // xGroup.push(wallPZMesh);
    // xGroup.push(wallNXMesh);
    // xGroup.push(wallPXMesh);
    // xGroup.push(roofMesh);

    // let xGroupClone = Array.from(xGroup);
    // for (let i = 0; i < xGroupClone.length; i++) {
    //     xGroupClone[i].layers.set(1);

    // }
    // scene.add(xGroupClone);


    var roomEdges = true;
    if (roomEdges) {

        var wallNZEdges = new THREE.EdgesGeometry( wallNZGeo );
        var lineMaterial = new THREE.LineBasicMaterial( { 
            color: '#000' 
        } )
        var wallNZLines = new THREE.LineSegments( wallNZEdges, lineMaterial );
        wallNZLines.position.copy( wallNZMesh.position );
        scene.add( wallNZLines );

        var wallNXEdges = new THREE.EdgesGeometry( wallNXGeo );
        var wallNXLines = new THREE.LineSegments( wallNXEdges, lineMaterial );
        wallNXLines.position.copy ( wallNXMesh.position );
        wallNXLines.rotation.y = Math.PI/2;
        scene.add( wallNXLines );

        var wallPZEdges = new THREE.EdgesGeometry( wallPZGeo );
        var wallPZLines = new THREE.LineSegments( wallPZEdges, lineMaterial );
        wallPZLines.position.copy( wallPZMesh.position );
        scene.add( wallPZLines );

        var wallPXEdges = new THREE.EdgesGeometry( wallPXGeo );
        var wallPXLines = new THREE.LineSegments( wallPXEdges, lineMaterial );
        wallPXLines.position.copy( wallPXMesh.position );
        wallPXLines.rotation.y = Math.PI/2;
        scene.add( wallPXLines );

        var roofEdges = new THREE.EdgesGeometry( roofGeo );
        var roofLines = new THREE.LineSegments( roofEdges, lineMaterial );
        roofLines.position.copy( roofMesh.position );
        roofLines.rotation.x = Math.PI/2;
        scene.add( roofLines );

    }

    let darkWalls = true;
    if ( darkWalls ) {

        var darkWallNZ = wallNZMesh.clone();
        darkWallNZ.material = darkMaterial;
        scene2.add(darkWallNZ);
        let darkWallNZ2 = darkWallNZ.clone();
        scene3.add(darkWallNZ2);
        // darkWallNZ.layers.disable( ENTIRE_SCENE );
        // darkWallNZ.layers.enable( BLOOM_SCENE );
        // darkWallNZ.layers.disableAll();

        var darkWallNX = wallNXMesh.clone();
        darkWallNX.material = darkMaterial;
        scene2.add(darkWallNX);
        let darkWallNX2 = darkWallNX.clone();
        scene3.add(darkWallNX2);
        // darkWallNX.layers.disable( ENTIRE_SCENE );
        // darkWallNX.layers.enable( BLOOM_SCENE );
        // darkWallNX.layers.disableAll();

        var darkWallPZ = wallPZMesh.clone();
        darkWallPZ.material = darkMaterial;
        scene2.add(darkWallPZ);
        let darkWallPZ2 = darkWallPZ.clone();
        scene3.add(darkWallPZ2);
        // darkWallPZ.layers.disable( ENTIRE_SCENE );
        // darkWallPZ.layers.enable( BLOOM_SCENE );
        // darkWallPZ.layers.disableAll();

        var darkWallPX = wallPXMesh.clone();
        darkWallPX.material = darkMaterial;
        scene2.add(darkWallPX);
        let darkWallPX2 = darkWallPX.clone();
        scene3.add(darkWallPX2);
        // darkWallPX.layers.disable( ENTIRE_SCENE );
        // darkWallPX.layers.enable( BLOOM_SCENE );
        // darkWallPX.layers.disableAll();

        var darkroof = roofMesh.clone();
        darkroof.material = darkMaterial;
        // darkroof.layers.disable( ENTIRE_SCENE );
        scene2.add(darkroof);
        let darkroof2 = darkroof.clone();
        scene3.add(darkroof2);
        // darkroof.layers.disableAll();
        // darkroof.layers.set( BLOOM_SCENE );


    }

    // EYEBALL
    var eyePlane = new THREE.PlaneGeometry(1, 1, 10, 10);
    var spriteTexture = new THREE.TextureLoader().load(eyeSprite);
    
    animator =  new  PlainAnimator(spriteTexture, 44, 1, 44, 15);
    let eyeTexture = animator.init();
    
    var eyeMaterial = new THREE.MeshBasicMaterial({
        map: eyeTexture,
        transparent: true,
        side: THREE.DoubleSide,

    });
    eyeMesh = new THREE.Mesh(eyePlane, eyeMaterial);
    
    eyeXOrbit = -10;
    eyeYOrbit = -3;
    eyeZOrbit = -10;
    
    eyeMesh.position.set(eyeXOrbit, eyeYOrbit, eyeZOrbit);
    eyeMesh.castShadow = true;
    eyeMesh.receiveShadow = true;

    eyeMesh.customDepthMaterial = new THREE.MeshDepthMaterial( {
        depthPacking: THREE.RGBADepthPacking,
        map: eyeTexture,
        alphaTest: 0.5
    } );

    scene.add(eyeMesh);

    // eyeMesh.layers.enableAll();

    darkEye = eyeMesh.clone();
    var darkEyeMaterial = new THREE.MeshBasicMaterial({
        map: eyeTexture,
        transparent: true,
        color: '#000',
        side: THREE.DoubleSide
    });
    darkEye.material = darkEyeMaterial;
    darkEye.customDepthMaterial = new THREE.MeshDepthMaterial( {
        depthPacking: THREE.RGBADepthPacking,
        map: eyeTexture,
        alphaTest: 0.5
    } );
    // darkEye.layers.disable( ENTIRE_SCENE );
    // darkEye.layers.set( BLOOM_SCENE );
    scene2.add(darkEye);

    let darkEye2 = darkEye.clone();
    darkEye2.material = darkEyeMaterial;
    darkEye2.customDepthMaterial = new THREE.MeshDepthMaterial( {
        depthPacking: THREE.RGBADepthPacking,
        map: eyeTexture,
        alphaTest: 0.5
    } );
    scene3.add(darkEye2);


    // TEST 1
    // var ballGeometry = new THREE.SphereGeometry( 1, 90, 90 );
	
	// var ballTexture = new THREE.ImageUtils.loadTexture('shattered lands.png');
	
	// // use "this." to create global object
	// this.customUniforms = 
	// {
	// 	baseTexture: { type: "t", value: ballTexture },
	// 	mixAmount: 	 { type: "f", value: 0.0 }
	// };
	
	// // create custom material from the shader code above
	// //   that is within specially labeled script tags
	// var customMaterial = new THREE.ShaderMaterial( 
	// {
	//     uniforms: customUniforms,
	// 	vertexShader:   document.getElementById( 'vertexShader-1'   ).textContent,
	// 	fragmentShader: document.getElementById( 'fragmentShader-1' ).textContent,
	// 	side: THREE.DoubleSide
	// }   );
	
	// var ball = new THREE.Mesh( ballGeometry, customMaterial );
	// ball.position.set(0, 5, 5);
	// ball.rotation.set(0, -Math.PI / 2, 0);
    // scene.add( ball );
    
    // TEST 2
    // particleGeometry = new THREE.BufferGeometry();
    // var test2Array = [];
	// for (var i = 0; i < 300; i++)
    //     test2Array.push( 0 );

    // var test2Array2 = Float32Array.from(test2Array);


    // particleGeometry.setAttribute(
    //     'position',
    //     new THREE.BufferAttribute(test2Array2, 3)
    // );
	
	// var discTexture = THREE.ImageUtils.loadTexture( 'disc.png' );
	
	// // properties that may vary from particle to particle. 
	// // these values can only be accessed in vertex shaders! 
	// //  (pass info to fragment shader via vColor.)
	// attributes = 
	// {
	// 	customColor:	 { type: 'c',  value: [] },
	// 	customOffset:	 { type: 'f',  value: [] },
    // };
	
	// var particleCount = particleGeometry.attributes.position.count/3;
	// for( var v = 0; v < particleCount; v++ ) 
	// {
	// 	attributes.customColor.value[ v ] = new THREE.Color().setHSL( 1 - v / particleCount, 1.0, 0.5 );
    //     attributes.customOffset.value[ v ] = 6.282 * (v / particleCount); 
    //     // not really used in shaders, move elsewhere
	// }
	
	// // values that are constant for all particles during a draw call
	// uniforms = 
	// {
	// 	time:      { type: "f", value: 1.0 },
	// 	texture:   { type: "t", value: discTexture },
	// };

	// var shaderMaterial = new THREE.ShaderMaterial( 
	// {
	// 	uniforms: 		uniforms,
	// 	attributes:     attributes,
	// 	vertexShader:   document.getElementById( 'vertexshader-2' ).textContent,
	// 	fragmentShader: document.getElementById( 'fragmentshader-2' ).textContent,
    //     transparent: true, 
    //     // blending: THREE.AdditiveBlending
    //     // alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5, 
	// 	// blending: THREE.AdditiveBlending, depthTest: false,
	// 	// I guess you don't need to do a depth test if you are alpha blending
	// 	// 
	// });

	// var particleCube = new THREE.ParticleSystem( particleGeometry, shaderMaterial );
	// particleCube.position.set(0, 25, 0);
	// particleCube.dynamic = true;
	// // in order for transparency to work correctly, we need sortParticles = true.
	// //  but this won't work if we calculate positions in vertex shader,
	// //  so positions need to be calculated in the update function,
	// //  and set in the geometry.vertices array
	// particleCube.sortParticles = true;
    // scene.add( particleCube );
    
    // MARCHING CUBES
    // var mcMaterial = new THREE.MeshNormalMaterial( {
    //     side: THREE.DoubleSide
    // });
    
    // var resolution = 28;

    // mcEffect = new MarchingCubes( resolution, mcMaterial, true, true );
    // mcEffect.position.set( 0, 0, 0 );
    // mcEffect.scale.set( 700, 700, 700 );

    // mcEffect.enableUvs = false;
    // mcEffect.enableColors = false;

    // scene.add( effect );

    // PLANAR WARRIOR
    const planarVShader =  `
        attribute float displacement;
        varying float pos;

        void main() {
            pos = displacement;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `
    const planarFShader = `
        uniform vec2 u_resolution;
        uniform float u_time;

        varying float pos;

        void main( ){
            vec3 c;
            float l,z=u_time;
            for(int i=0;i<3;i++) {
                vec2 uv,p=gl_FragCoord.xy/u_resolution;
                uv=p;
                p-=.5;
                p.x*=u_resolution.x/u_resolution.y;
                z+=.07;
                l=length(p);
                uv+=p/l*(sin(z)+1.)*abs(sin(l*9.-z*2.));
                c[i]=.01/length(abs(mod(uv,1.)-.5));
            }
            gl_FragColor=vec4(c/l,u_time);
        }
    `

    planarUniforms = {
        u_resolution: { value: { x: window.innerWidth, y: window.innerHeight } },
        u_time: { value: 0.0 },
        
    }

    let planarMaterial = new THREE.ShaderMaterial ( {
        uniforms: planarUniforms,
        vertexShader: planarVShader,
        fragmentShader: planarFShader,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });

    // STAR FIELD
    starCount = 150;
    rMax = 70;
    rMin = 55;
    var starGeo = new THREE.PlaneGeometry(2, 2, 1, 1);
    var starTexture = new THREE.TextureLoader().load(theStar);
    var starMat = new THREE.MeshBasicMaterial( {
        map: starTexture,
        side: THREE.DoubleSide,
        transparent: true
    });
    // var starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh = new THREE.InstancedMesh(starGeo, starMat, starCount);
    // matrix = new THREE.Matrix4();
    matrix = new THREE.Object3D();
    // matrix.matrixAutoUpdate = false;


    for (let i = 0; i < starCount; i++) {
        // starX[i] = (Math.round(Math.random()) * 2 - 1) * (Math.round(Math.random() * rMax));
        // starY[i] = (Math.round(Math.random()) * 2 - 1) * (Math.round(Math.random() * rMax));
        // starZ[i] = (Math.round(Math.random()) * 2 - 1) * (Math.round(Math.random() * rMax));

        // if (starX[i] < rMin && starY[i] < rMin && starZ[i] < rMin) {
        //     starX[i] += rMin;
        //     starY[i] += rMin;
        //     starZ[i] += rMin;
        // }

        // starX.push(Math.random() * 100);
        // starY.push(Math.random() * 100);
        // starZ.push(Math.random() * 100);

        starPos.push(new THREE.Vector3(
            Math.random() * rMax * (Math.round(Math.random()) * 2 - 1),
            Math.random() * rMax * (Math.round(Math.random()) * 2 - 1),
            Math.random() * rMax * (Math.round(Math.random()) * 2 - 1)
        ));

        if (starPos[i].x < rMin && starPos[i].y < rMin && starPos[i].z < rMin) {
            if (starPos[i].x > -rMin && starPos[i].y > -rMin && starPos[i].z > -rMin) {
                starPos[i].x += rMax * (Math.round(Math.random()) * 2 - 1);

                starPos[i].y += rMax * (Math.round(Math.random()) * 2 - 1);

                starPos[i].z += rMax * (Math.round(Math.random()) * 2 - 1);
            }
        }

    }
    
    scene.add(starMesh);
    // starMesh.layers.enable( BLOOM_SCENE );

    // PALM
    // var objectLoader = new ObjectLoader();
    // objectLoader.load( thePalm, function ( object ) {

    //     scene.add( object );

    // } );

    // let leaf_opt = {
    //     length: 60,
    //     length_stem: 20,
    //     width_stem: 0.2,
    //     leaf_width: 0.8,
    //     leaf_up: 1.5,
    //     density: 11,
    //     curvature: 0.04,
    //     curvature_border: 0.005,
    //     leaf_inclination: 0.9
    // };
    
    // let trunkGeometry = new THREE.BoxGeometry(5,5,5);
    // let leafGeometry = new LeafGeometry(leaf_opt);
    
    // let palm_opt = {
    //     spread: 0.1,
    //     angle: 137.5,
    //     num: 406,
    //     growth: 0.12,
    //     foliage_start_at: 56,
    //     trunk_regular: false,
    //     buffers: false,
    //     angle_open: 36.17,
    //     starting_angle_open: 50
    // };
    
    // let palm = new PalmGenerator(leafGeometry,
    //                             trunkGeometry,
    //                             palm_opt);
    // let geometry = palm.geometry;
    // let bufGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
    // let palmMesh = new THREE.Mesh(bufGeometry, material);
    // scene.add( palmMesh );

    // HORSE
    loader.load( theHorse, function ( gltf ) {

        horseMesh = gltf.scene.children[ 0 ];
        horseMesh.scale.set( 0.055, 0.055, 0.055 );
        horseMesh.position.y = -5;
        // horseMesh.material.color.offsetHSL(0, -0.5, 0);

        scene.add( horseMesh );
        // darkHorse = horseMesh.clone();
        // scene2.add( darkHorse );
        // horseMesh.layers.enableAll();

        mixer = new THREE.AnimationMixer( horseMesh );

        mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();

    } );

    loader.load( theHorse, function ( gltf ) {

        darkHorse = gltf.scene.children[ 0 ];
        darkHorse.scale.set( 0.055, 0.055, 0.055 );
        darkHorse.position.y = -5;
        // darkHorse.material.color.offsetHSL(0, -0.5, 0);

        scene2.add( darkHorse );
        // darkHorse = darkHorse.clone();
        // scene2.add( darkHorse );
        // darkHorse.layers.set( BLOOM_SCENE );

        mixer2 = new THREE.AnimationMixer( darkHorse );

        mixer2.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();

    } );

    // SAND BOX
    let sandSize = 2;
    let sandGeo = new THREE.BoxBufferGeometry(sandSize, sandSize, sandSize, 1, 1, 1);
    var sandTexture = new THREE.TextureLoader().load( sandImage );
    let sandMaterial = new THREE.MeshStandardMaterial( {
        map: sandTexture
    });
    sandMesh = new THREE.Mesh( sandGeo, sandMaterial );
    sandMesh.position.set(2, 8, 11);
    sandMesh.castShadow = true;
    sandMesh.receiveShadow = true;
    scene.add( sandMesh );

    sandMesh.name = "Sandbox";

    sandScene2 = sandMesh.clone();
    sandScene2.material = darkMaterial;
    scene2.add( sandScene2 );
    sandScene3 = sandScene2.clone();
    scene3.add( sandScene3 );

    // PALM POT
    let palmScale = 0.075;
    let palmHeight = -1.5;
    loader.load( thePalm, function ( gltf ) {

        palmMesh = gltf.scene.children[ 0 ];
        palmMesh.traverse(function(o) {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
              o.layers.enable( 1 );
              o.material.metalness = 0;

            //   o.material.colorWrite = false;
            //   let p = o.clone();
            //   p.layers.set( BLOOM_SCENE );
            //   palmMeshArray.push(p);

            }
          });
        palmMesh.scale.set(palmScale, palmScale, palmScale);
        palmMesh.position.set(0, palmHeight, 0);
        palmMesh.rotation.y = -Math.PI/2;
        palmMesh.castShadow = true;
        palmMesh.receiveShadow = true;
        scene.add( palmMesh );
        sandMesh.add( palmMesh );
        // scene.add(palmMeshArray);

        // let darkPalm = palmMesh.clone();
        // scene2.add(darkPalm);
    } );

    loader.load( thePalm, function ( gltf ) {    
    
        let palm2 = gltf.scene.children[ 0 ];
        palm2.traverse(function(o) {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                // o.layers.set( BLOOM_SCENE );
            //   let p = o.clone();
            //   p.layers.set( BLOOM_SCENE );
            //   palm2Array.push(p);

            }
            });
        palm2.scale.set(palmScale, palmScale, palmScale);
        palm2.position.set(0, palmHeight, 0);
        palm2.rotation.y = -Math.PI/2;
        palm2.castShadow = true;
        palm2.receiveShadow = true;
        scene2.add( palm2 );
        sandScene2.add( palm2 );
        // scene.add(palmMeshArray);

        // let darkPalm = palmMesh.clone();
        // scene2.add(darkPalm);
    } );

    loader.load( thePalm, function ( gltf ) {    
    
        let palm3 = gltf.scene.children[ 0 ];
        palm3.traverse(function(o) {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                // o.layers.set( BLOOM_SCENE );
            //   let p = o.clone();
            //   p.layers.set( BLOOM_SCENE );
            //   palm3Array.push(p);

            }
            });
        palm3.scale.set(palmScale, palmScale, palmScale);
        palm3.position.set(0, palmHeight, 0);
        palm3.rotation.y = -Math.PI/2;
        palm3.castShadow = true;
        palm3.receiveShadow = true;
        scene3.add( palm3 );
        sandScene3.add( palm3 );
        // scene.add(palmMeshArray);

        // let darkPalm = palmMesh.clone();
        // scene2.add(darkPalm);
    } );

    // RUG
    let rugScale = 0.0021;
    loader.load( theRug, function ( gltf ) {

        rugMesh = gltf.scene.children[ 0 ];
        rugMesh.traverse(function(o) {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                // o.material.metalness = 0;

            }
            });
        rugMesh.scale.set( rugScale, rugScale, rugScale );
        rugMesh.position.set(-4.88, -0.85, 5.89);

        scene.add( rugMesh );

        rugMesh.rotation.x = Math.PI;
        rugMesh.rotation.y = Math.PI * -0.29;

      
    } );

     // COUCH
     let couchScale = 3.5;
     loader.load( theCouch, function ( gltf ) {

        couchMesh = gltf.scene;
        couchMesh.traverse(function(o) {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;

            }
            });
        couchMesh.scale.set( couchScale, couchScale, couchScale );
        couchMesh.position.set(-5.5, -0.85, 11.5);
        couchMesh.rotation.y = Math.PI * 0.75;

        scene.add( couchMesh );

        // couchMesh.rotation.x = Math.PI;

      
    } );

     // CHAIR
     let chairScale = .65;
     loader.load( theChair, function ( gltf ) {

        chairMesh = gltf.scene;
        chairMesh.traverse(function(o) {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;

            }
            });
        chairMesh.scale.set( chairScale, chairScale, chairScale * 1.25 );
        chairMesh.position.set(-8, -0.85, 5);
        chairMesh.rotation.y = Math.PI * 0.03;

        scene.add( chairMesh );

        // chairMesh.rotation.x = Math.PI;

      
    } );

     // SPEAKERS
     let speakerScale = 4.25;
     loader.load( theSpeaker, function ( gltf ) {

        speakerMesh = gltf.scene;
        speakerMesh.traverse(function(o) {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                o.material.metalness = 0;

            }
            });
        speakerMesh.scale.set( speakerScale, speakerScale, speakerScale );
        speakerMesh.position.set(-8, -0.85, 6.75);
        speakerMesh.rotation.y = Math.PI * 0.56;

        scene.add( speakerMesh );

        // speakerMesh.rotation.x = Math.PI;

      
    } );

    // RECORD PLAYER
    let playerScale = 0.6;
    loader.load( thePlayer, function ( gltf ) {

        playerMesh = gltf.scene;
        playerMesh.traverse(function(o) {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                // o.material.envMap = cubeRenderTarget2.texture;


            }
            });
        playerMesh.scale.set( playerScale, playerScale, playerScale );
        playerMesh.position.set(-7, 1, 5);
        playerMesh.rotation.y = Math.PI * 1.5;

        scene.add( playerMesh );

        // playerMesh.rotation.x = Math.PI;

    
    } );

    // SLURP
    let slurpScale = 0.06;
    loader.load( slurp1, function ( gltf ) {

        slurp1Mesh = gltf.scene;
        slurp1Mesh.traverse(function(o) {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                // o.material.envMap = cubeRenderTarget2.texture;
                o.material.metalness = 0;

            }
            });
        slurp1Mesh.scale.set( slurpScale, slurpScale, slurpScale );
        slurp1Mesh.position.set(-7.75, 1.36, 6.95);
        slurp1Mesh.rotation.y = Math.PI * 1.5; // 1.75

        scene.add( slurp1Mesh );

        // slurp1Mesh.rotation.x = Math.PI;

    
    } );

    // SOBAN
    let sobanScale = 4;
    loader.load( soban1, function ( gltf ) {

        soban1Mesh = gltf.scene;
        soban1Mesh.traverse(function(o) {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                // o.material.envMap = cubeRenderTarget2.texture;
                o.material.metalness = 0;
            }
            });
        soban1Mesh.scale.set( sobanScale, sobanScale, sobanScale );
        soban1Mesh.position.set(.5, -1, 13);
        soban1Mesh.rotation.y = Math.PI * 1.16;
        // soban1Mesh.rotation.x = Math.PI;

        scene.add( soban1Mesh );

        // this.renderer.gammaOutput = true;
        // this.renderer.gammaInput = true;
        // this.renderer.gammaFactor = 2.2;
        // this.encoding = THREE.sRGBEncoding
        // this.anisotropy = maxAnisotropy;
        // this.mipmaps = true;
    
    } );

     // THESIS BOOK 1
     let thesisbook1Scale = 0.5;
     loader.load( thesisbook1, function ( gltf ) {
 
         thesisbook1Mesh = gltf.scene;
         thesisbook1Mesh.traverse(function(o) {
             if (o.isMesh) {
                 o.castShadow = true;
                 o.receiveShadow = true;
                 // o.material.envMap = cubeRenderTarget2.texture;
                 o.material.metalness = 0;
             }
             });
         thesisbook1Mesh.scale.set( thesisbook1Scale, thesisbook1Scale, thesisbook1Scale );
         thesisbook1Mesh.position.set(.5, 1, 13.6);
         thesisbook1Mesh.rotation.y = Math.PI * 1;
         thesisbook1Mesh.rotation.x = Math.PI * 0.475;
         thesisbook1Mesh.rotation.z = Math.PI * 0.1;

         // thesisbook1Mesh.rotation.x = Math.PI;
 
         scene.add( thesisbook1Mesh );
     
     } );

    // RECORD STACK
    let recordstackScale = 0.25;
    loader.load( recordstack1, function ( gltf ) {

        recordstack1Mesh = gltf.scene;
        recordstack1Mesh.traverse(function(o) {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                // o.material.envMap = cubeRenderTarget2.texture;
                o.material.metalness = 0;
            }
            });
        recordstack1Mesh.scale.set( recordstackScale, recordstackScale, recordstackScale );
        recordstack1Mesh.position.set( -7.5, -0.9, 3.45 );
        // recordstack1Mesh.rotation.y = Math.PI * 1;
        // recordstack1Mesh.rotation.x = Math.PI * 0.475;
        // recordstack1Mesh.rotation.z = Math.PI * 0.1;

        // recordstack1Mesh.rotation.x = Math.PI;

        scene.add( recordstack1Mesh );
    
    } );

    // loader.load( theRug, function ( gltf ) {

    //     let rug2 = gltf.scene.children[ 0 ];
    //     rug2.traverse(function(o) {
    //         if (o.isMesh) {
    //             o.castShadow = true;
    //             o.receiveShadow = true;

    //         }
    //         });
    //     rug2.scale.set( 0.002, 0.002, 0.002 );
    //     rug2.position.set(0, -0.5, 2);

    //     scene3.add( rug2 );

    //     rug2.rotation.x = Math.PI;

      
    // } );

    // SMILEY

    const vertexShaderSun =  `
    uniform vec3 viewVector;
    varying float intensity;
    void main() {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
        vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
        intensity = pow( dot(normalize(viewVector), actual_normal), 9.0 );
        }
    `
    const fragmentShaderSun = `
    varying float intensity;
    void main() {
        vec3 glow = vec3(1.0, 0.35, 0.45) * intensity;
        gl_FragColor = vec4( glow, 1.0 );
        }
    `

    const smileyTexture = new THREE.TextureLoader().load( "images/smiley.png" );
    smileyTexture.repeat.set( 10, 10 ); // CHANGE THIS FOR SIZE
    smileyTexture.wrapS = THREE.RepeatWrapping;
    smileyTexture.wrapT = THREE.RepeatWrapping;
    smileyTexture.needsUpdate = true;


    let smileyGeo = new THREE.SphereGeometry( 0.5, 50, 50 );
    let smileyMat = new THREE.MeshStandardMaterial({
        color: 'rgb( 225, 100, 50 )',
        transparent: true,
        opacity: 0.85,
        map: smileyTexture,
    });
    smileyMesh = new THREE.Mesh( smileyGeo, smileyMat );
    
    let glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
        viewVector: {
            type: "v3",
            value: camera.position
        }
        },
        vertexShader: vertexShaderSun,
        fragmentShader: fragmentShaderSun,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.5,
        map: smileyTexture,
    });

    let glowGeometry = new THREE.SphereGeometry( 0.55, 50, 50 );
    
    let glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    smileyMesh.add(glowMesh);
    smileyMesh.glow = glowMesh;
    scene.add(smileyMesh);

    smileyHeight = 7;
    smileyMesh.position.set( -6.4, smileyHeight, 13.6 );

    // RING
    var circleSize = 1.5;
    var tubeSize = .01;
    geometry = new THREE.TorusBufferGeometry(circleSize, tubeSize, 100, 100);
    var circleMat = new THREE.MeshBasicMaterial({
        color: '#fff',
        side: THREE.DoubleSide
    });
    var circleMesh = new THREE.Mesh(geometry, planarMaterial);
    circleMesh.position.y = 4;
    scene2.add(circleMesh);
    // circleMesh.layers.set( BLOOM_SCENE );

    // SMOKE
    var smokeBottom = -1;

    smokeCenter = smokeLine(-0.15, smokeBottom, -.025, 2.55, 0.15, smokeBottom, .025, 2.65);
    smokeLeft = smokeLine(-1.15, smokeBottom, -0.175, 2.75, -0.65, smokeBottom, -0.165, 2.55);
    smokeRight = smokeLine(0.65, smokeBottom, 0.165, 2.55, 1.15, smokeBottom, 0.175, 2.65);
    smokeLeft2 = smokeLine(-2.5, smokeBottom, -0.35, 2.65, -1.75, smokeBottom, -0.35, 2.55);
    smokeRight2 = smokeLine(1.75, smokeBottom, 0.35, 2.55, 2.5, smokeBottom, 0.35, 2.65);
    
    // smokeCenter.material = planarMaterial;
    // smokeLeft.material = planarMaterial;
    // smokeRight.material = planarMaterial;
    // smokeLeft2.material = planarMaterial;
    // smokeRight2.material = planarMaterial;

    // smokeCenter.geometry.computeBoundingBox();
    // const smokeRes = new THREE.Vector3( smokeCenter.geometry.boundingBox.getSize() );
    // smokeRes = smokeCenter.geometry.getSize();

    // planarUniforms.u_resolution.value = { x: smokeRes.x, y: smokeRes.y }

    smoke.push(smokeCenter);
    smoke.push(smokeLeft); 
    smoke.push(smokeRight);   
    smoke.push(smokeLeft2);   
    smoke.push(smokeRight2);   

    scene2.add(smokeCenter);
    scene2.add(smokeLeft);
	scene2.add(smokeRight);
    scene2.add(smokeLeft2);
    scene2.add(smokeRight2);

    smokeCenter.layers.enable( BLOOM_SCENE );
    smokeLeft.layers.enable( BLOOM_SCENE );
    smokeRight.layers.enable( BLOOM_SCENE );
    smokeLeft2.layers.enable( BLOOM_SCENE );
    smokeRight2.layers.enable( BLOOM_SCENE );

    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor('#000');
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
        // renderer.autoClear = false;

    // CONTROLS
    controls = new PointerLockControls( camera, document.body ); // renderer.domElement / document.body
    // controls.target = new THREE.Vector3(0, 4, 0);


    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );
    const intro = document.getElementById( 'intro' );


    instructions.addEventListener( 'click', function () {

        controls.lock();

    } );

    document.addEventListener('click', function(e){
        // if( e.key == '32' ){
            controls.lock();
        // }
    } );

    controls.addEventListener( 'lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';
        intro.style.display = 'none';


    } );

    controls.addEventListener( 'unlock', function () {

        blocker.style.display = 'block';
        instructions.style.display = '';
        intro.style.display = '';


    } );

    scene.add( controls.getObject() );

    const onKeyDown = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'Space':
                if ( canJump === true ) velocity.y += 200;
                canJump = false;
                break;

            case 'KeyZ':
                crouch = true;
                break;

        }

    };

    const onKeyUp = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

            case 'KeyZ':
                crouch = false;
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 4 );

    // POST PROCESSING
    var renderScene = new RenderPass(scene, camera);
    var renderScene2 = new RenderPass(scene2, camera);
    var renderScene3 = new RenderPass(scene3, camera);

    composer = new EffectComposer(renderer);
    composer2 = new EffectComposer(renderer);
    composer3 = new EffectComposer(renderer);
    bloomComposer = new EffectComposer(renderer);

    var effectFXAA = new ShaderPass(FXAAShader);
	effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );

    var copyShader = new ShaderPass(CopyShader);
    copyShader.renderToScreen = true;
    
    var chromaticAbberation = new ShaderPass(RGBShiftShader);
    chromaticAbberation.uniforms['amount'].value = 0.003;

	var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 			bloomStrength, bloomRadius, bloomThreshold);

    var blendPass = new ShaderPass( AdditiveBlendShader );
    blendPass.uniforms.tAdd.value = composer.renderTarget2.texture; // CHANGE THIS FOR MULTIPLE CHAINS?

    var blendPass2 = new ShaderPass( AdditiveBlendShader );
    blendPass2.uniforms.tAdd.value = bloomComposer.renderTarget2.texture; 
    blendPass2.uniforms.amount.value = 0.6;

    var blendPass3 = new ShaderPass( AdditiveBlendShader );
    blendPass3.uniforms.tAdd.value = composer.renderTarget2.texture; 
    // blendPass3.uniforms.tDiffuse.value = composer.renderTarget2.texture; 

    // let finalPass = new ShaderPass(
    //     new THREE.ShaderMaterial( {
    //         uniforms: {
    //             baseTexture: { value: null },
    //             bloomTexture: { value: bloomComposer.renderTarget2.texture }
    //         },
    //         vertexShader: document.getElementById( 'vertexshader' ).textContent,
    //         fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
    //         defines: {}
    //     } ), "baseTexture"
    // );
    // finalPass.needsSwap = true;

    let saoPass = new SAOPass( scene, camera, false, );
    saoPass.params.saoBias = 1;
    saoPass.params.saoIntensity = .0005;
    saoPass.params.saoScale = 10;
    saoPass.params.Blur = true;
    saoPass.params.saoBlurRadius = 200;
    saoPass.params.saoBlurStdDev = 100;
    saoPass.params.saoBlurDepthCutoff = 0.1;
    saoPass.params.saoKernelRadius = 120;
    saoPass.params.saoBlurRadius = 4;
    saoPass.params.saoMinResolution = 0;

    // var saoPass = new SAOPass(scene, camera, false, true);

    // ssaoPass.kernelRadius = 16;

    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    // bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene2);
    bloomComposer.addPass(bloomPass);
    bloomComposer.addPass(blendPass3);
    bloomComposer.addPass(effectFXAA);
    bloomComposer.addPass(copyShader);

    composer.setSize(window.innerWidth, window.innerHeight);
    // composer.renderToScreen = false;
    composer.addPass(renderScene);
    // composer.addPass(bloomPass);
    // composer.addPass(saoPass);
    composer.addPass(effectFXAA);
    composer.addPass(copyShader);

    composer2.setSize(window.innerWidth, window.innerHeight);
    composer2.addPass(renderScene2);
    // composer2.addPass(effectFXAA); 
    // composer2.addPass(bloomPass);
    // composer2.addPass(chromaticAbberation);
    composer2.addPass(blendPass);
    composer2.addPass(effectFXAA);
    // composer2.addPass(copyShader);

    composer3.setSize(window.innerWidth, window.innerHeight);
    composer3.addPass(renderScene3);
    blendPass2.uniforms.amount.value = 1.0;
    composer3.addPass(blendPass2);
    // composer3.addPass(effectFXAA);
    composer3.addPass(copyShader);

    
    document.body.appendChild(renderer.domElement);


     // SELECTIVE BLOOM
     // const params = {
     //     exposure: 1,
     //     bloomStrength: 5,
     //     bloomThreshold: 0,
     //     bloomRadius: 0,
     //     scene: "Scene with Glow"
     // };
 
     // const darkMaterial = new THREE.MeshBasicMaterial( { color: "black" } );
    //  const materials = {};
 
     // const renderScene = new RenderPass( scene, camera );
 
     // const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
     // bloomPass.threshold = params.bloomThreshold;
     // bloomPass.strength = params.bloomStrength;
     // bloomPass.radius = params.bloomRadius;
 
    //  const bloomComposer = new EffectComposer( renderer );
    //  bloomComposer.setSize(window.innerWidth, window.innerHeight);

    //  bloomComposer.renderToScreen = false;
    //  bloomComposer.addPass( renderScene );
    //  bloomComposer.addPass( bloomPass );
    //  bloomComposer.addPass( copyShader );

 
    
 
    //  const finalComposer = new EffectComposer( renderer );
    //  finalComposer.setSize(window.innerWidth, window.innerHeight);

    //  finalComposer.addPass( renderScene );
    //  finalComposer.addPass( finalPass );

}

function animate() {

    requestAnimationFrame(animate);

    // MSDF
    ThreeMeshUI.update();

    // CONTROLS
    // controls.update();

    const cTime = performance.now();
    const cSpeed = 35.0;
    const mass = 100.0;
    const jumpSpeed = 0.1;
    const crouchDist = 2.5;

    if ( controls.isLocked === true ) {

        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= cameraHeight;

        const intersections = raycaster.intersectObjects( cObjects );

        const onObject = intersections.length > 0;

        const cDelta = ( cTime - prevCTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * cDelta;
        velocity.z -= velocity.z * 10.0 * cDelta;

        velocity.y -= 9.8 * mass * cDelta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * cSpeed * cDelta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * cSpeed * cDelta;

        if ( onObject === true ) {

            velocity.y = Math.max( 0, velocity.y );
            canJump = true;

        }

        controls.moveRight( - velocity.x * cDelta );
        controls.moveForward( - velocity.z * cDelta );

        controls.getObject().position.y += ( velocity.y * ( cDelta * jumpSpeed ) ); // new behavior

        if ( controls.getObject().position.y < cameraHeight ) {
            if ( !crouch) {
                velocity.y = 0;
                controls.getObject().position.y = cameraHeight;

                canJump = true;
            }
        }

        if ( crouch ) controls.getObject().position.y +=  velocity.y  * ( cDelta * jumpSpeed );

        if ( controls.getObject().position.y < cameraHeight - crouchDist ) {
            if ( crouch ) {
                velocity.y = 0;
                controls.getObject().position.y = cameraHeight - crouchDist;

                // canJump = true;
            }
        }

    }

    prevCTime = cTime;

    // CLIPPING
    if( controls.getObject().position.x > 9 ) controls.getObject().position.x = 9; 
    if( controls.getObject().position.x < -9 ) controls.getObject().position.x = -9;
    if( controls.getObject().position.z > 15 ) controls.getObject().position.z = 15;
    if( controls.getObject().position.z < -3 ) controls.getObject().position.z = -3;   

    // CLOCK
    var timeElapsed = clock.getElapsedTime();
    var delta = clock.getDelta(); 

    // TOOLTIPS
    // toolSprite.center.set( mouse.x, mouse.y );

    // projector.setFromCamera( mouse, camera ); 
    // INTERSECTED = projector.intersectObjects( scene.children ); 
    // for ( var i = 0; i < INTERSECTED.length; i++ ) { 
    //     if ( INTERSECTED[ 0 ].object.name )
    //     {
    //         toolContext.clearRect(0,0,640,480);
    //         var message = INTERSECTED[ 0 ].object.name;
    //         var metrics = toolContext.measureText(message);
    //         var width = metrics.width;
    //         toolContext.fillStyle = "rgba(0,0,0,0.95)"; // black border
    //         toolContext.fillRect( 0,0, width+8,20+8);
    //         toolContext.fillStyle = "rgba(255,255,255,0.95)"; // white filler
    //         toolContext.fillRect( 2,2, width+4,20+4 );
    //         toolContext.fillStyle = "rgba(0,0,0,1)"; // text color
    //         toolContext.fillText( message, 4,20 );
    //         toolTexture.needsUpdate = true;

    //         toolSprite.position.set( mouse.x, mouse.y, 1 ); 
    //     }
    //     else
    //     {
    //         toolContext.clearRect(0,0,300,300);
    //         toolTexture.needsUpdate = true;
    //     }      
    // }

    // EYEBALL
    // animator.update(100 * delta);
    animator.animate();
    var eyeSpeed = 0.4;

    eyeMesh.position.x = -7 + eyeXOrbit * Math.cos(timeElapsed*eyeSpeed);
    eyeMesh.position.y = 4 + eyeYOrbit * Math.sin(timeElapsed*eyeSpeed);
    eyeMesh.position.z = eyeZOrbit * Math.sin(timeElapsed*eyeSpeed);

    darkEye.position.x = -7 + eyeXOrbit * Math.cos(timeElapsed*eyeSpeed);
    darkEye.position.y = 4 + eyeYOrbit * Math.sin(timeElapsed*eyeSpeed);
    darkEye.position.z = eyeZOrbit * Math.sin(timeElapsed*eyeSpeed);

    // SMILEY
    const smileySpeed = eyeSpeed;
    smileyMesh.position.y = smileyHeight + Math.sin(timeElapsed*smileySpeed);
    smileyMesh.rotation.y += timeElapsed*smileySpeed;

    // HORSE
    if ( mixer ) {

        const time = Date.now();

        mixer.update( ( time - prevTime ) * 0.001 );

        prevTime = time;

    }
    horseMesh.position.x = Math.cos(timeElapsed * 0.25) * 40;

    horseMesh.rotation.y = -(timeElapsed * 0.25);
    horseMesh.position.z = 6 + Math.sin(timeElapsed * 0.25) * 44;

    if ( mixer2 ) {

        const time = Date.now();

        mixer2.update( ( time - prevTime ) * 0.001 );

        prevTime = time;

    }
    darkHorse.position.x = Math.cos(timeElapsed * 0.25) * 40;

    darkHorse.rotation.y = -(timeElapsed * 0.25);
    darkHorse.position.z = 6 + Math.sin(timeElapsed * 0.25) * 44;

    // darkHorse.position.x = Math.cos(timeElapsed * 0.25) * 40;

    // darkHorse.rotation.y = -(timeElapsed * 0.25);
    // darkHorse.position.z = 6 + Math.sin(timeElapsed * 0.25) * 44;


    // TEST 1
    // customUniforms.mixAmount.value = 0.5 * (1.0 + Math.sin(timeElapsed));

    // TEST 2
    // uniforms.time.value = 0.125 * timeElapsed;
	
	// for( var v = 0; v < particleGeometry.attributes.position.count/3; v++ ) 
	// {
    //     var timeOffset = uniforms.time.value + attributes.customOffset.value[ v ];

    //     particleGeometry.attributes.position.array[v*3]   = 20.0 * Math.cos(2.0 * timeOffset) * (3.0 + Math.cos(3.0 * timeOffset));
    //     particleGeometry.attributes.position.array[v*3+1] = 20.0 * Math.cos(2.0 * timeOffset) * (3.0 + Math.cos(3.0 * timeOffset));
    //     particleGeometry.attributes.position.array[v*3+2] = 50.0 * Math.sin(3.0 * timeOffset);

	// }


    // LIGHT1
    let offsetSin = 2100; // 300, 2500
    var lightSpeed = 0.002;
    let lightRadius = 7;
    light1.position.y = 14.5;
    light1.position.x = Math.cos( (offsetSin + timeElapsed) * lightSpeed) * lightRadius;
    // light1.position.y = 16 + light1YOrbit * Math.sin(timeElapsed*lightSpeed);
    light1.position.z = 6 + Math.sin( (offsetSin + timeElapsed) * lightSpeed) * lightRadius;

    // STAR FIELD
    for (let i = 0; i < starCount; i++) {


        matrix.position.set(starPos[i].x, starPos[i].y, starPos[i].z);
        matrix.rotation.y = (timeElapsed + i * .5);
        // matrtix.scale(Math.random(), Math.random(), Math.random());

        matrix.updateMatrix();

        starMesh.setMatrixAt(i, matrix.matrix);

    }
    starMesh.instanceMatrix.needsUpdate = true;


    // SMOKE WAVE
    var amp = .001;
    var freq = .65;
    for (var n = 0; n < smoke.length; n++){

        for (let i = 0; i < smoke[n].geometry.attributes.position.array.length/3; i++) {
           
            smoke[n].geometry.attributes.position.array[i*3] += Math.sin(timeElapsed*5+i*-freq)*amp;
        }
        smoke[n].geometry.attributes.position.needsUpdate = true;

    }

    // BG CUBE
    bgCube.rotation.y += 0.0001;
    bgCube.rotation.z += 0.0002;  

    // PORTAL CAM
    cubeCamera.update( renderer, scene );
    // reflectionCubeCam.update( renderer, scene );

    // VERTEX COLORS
    vertexUniforms.u_time.value = timeElapsed;
    planarUniforms.u_time.value = timeElapsed;


    // RENDER
   
    // renderer.setRenderTarget( null );
    // renderer.autoClear = false;
    // renderer.clear();

    // camera.layers.enable( ENTIRE_SCENE );
    // camera.layers.disable( BLOOM_SCENE );

    // camera.layers.enable( PORTAL );

    composer.render();

    // scene.traverse( function (obj) {
    //     if (obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
    //         obj.material.colorWrite = false;
    //         // obj.material = darkMaterial;
    //     }

    // });

    // bgCube.visible = false;

    // palmMesh.traverse(function(o) {
    //     if (o.isMesh) {
    //       o.material.colorWrite = false;
    //     }
    // });   
    // palmMesh.material.colorWrite = true;x

    // camera.layers.disable( ENTIRE_SCENE );
    // camera.layers.set( BLOOM_SCENE );
    // composer.clearDepth();

    bloomComposer.render();

    // camera.layers.set( ENTIRE_SCENE );
    // bloomComposer.clearDepth();

    composer3.render();

    // composer3.clearDepth();
    // renderer.render( sceneOrtho, cameraOrtho );

    // composer3.clearDepth();

    // renderer.autoClear = true;

    // camera.layers.enable( ENTIRE_SCENE );

    // composer.render(scene, camera);

    // scene.traverse( function (obj) {
    //     if (obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
    //         obj.material.colorWrite = true;
    //     }
    // });

    // bgCube.visible = true;

    // composer.render(scene, camera);

    // finalComposer.render();

    // composer2.render(scene2, camera);
    // composer3.render(scene3, camera);

    // renderer.render(scene3, camera);

}

function onWindowResize() {
	// Camera frustum aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;
	// After making changes to aspect
	camera.updateProjectionMatrix();
	// Reset size
	renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
	composer3.setSize(window.innerWidth, window.innerHeight);

}

window.addEventListener('resize', onWindowResize, false);

init();
animate();