import _ from 'lodash';
import './style.css';
import '../AdditiveBlendShader.js';
import xanaduJSON from'../MSDF Xanadu/Xanadu-Regular.json';
import xanaduPNG from'../MSDF Xanadu/Xanadu-Regular.png';
import spacePZ from '../space8/pz.png';
import spaceNZ from '../space8/nz.png';
import spacePY from '../space8/py.png';
import spaceNY from '../space8/ny.png';
import spacePX from '../space8/px.png';
import spaceNX from '../space8/nx.png';
import eyeSprite from '../eyeball-sprite2.png';
import theStar from '../sticker/star-3.png';
import theHorse from '../Horse.glb';
import thePalm from '../models/VP_Phoenix Palm_v2.glb';

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
// import { ObjectLoader } from '../node_modules/three/src/loaders/ObjectLoader.js';



var camera, scene, renderer;
var scene2, scene3;
let cubeCamera;
var geometry, material, mesh;
let controls;
var composer, composer2, composer3;

let rtTexture;
let cubeRenderTarget1;
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

let mixer, horseMesh, darkHorse;
let prevTime = Date.now();


let palmMesh;

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
		color: 'rgb(200, 0, 0)', 
		emissive: 'rgb(25, 25, 255)',
        specular: 'rgb(255, 50, 255)',
        // ambient: 'rgb(200, 0, 0)',
		// roughness: .01,
		// metalness: .1,
		shininess: 55,
		envMap: cubeRenderTarget1.texture,
		side: THREE.DoubleSide,
		transparent: true,
        // opacity: 1,
        reflectivity: 1,
        // blending: THREE.AdditiveBlending,
    });
    
    var material2 = new THREE.MeshPhongMaterial({
		color: 'rgb(200, 0, 0)', 
		emissive: 'rgb(10, 0, 255)',
        specular: 'rgb(255, 50, 255)',
        // ambient: 'rgb(200, 0, 0)',
		// roughness: .01,
		// metalness: .1,
		shininess: 140,
		// envMap: cubeRenderTarget1.texture,
		side: THREE.DoubleSide,
		transparent: true,
        // opacity: 1,
        reflectivity: 1,
        // blending: THREE.AdditiveBlending,
	});

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
        side: THREE.DoubleSide
    });

    var mesh = new THREE.Mesh(combo, material);

    return mesh;
}

function init() {
    
    // SCENES
    scene = new THREE.Scene();
    scene2 = new THREE.Scene();
    scene3 = new THREE.Scene();

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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 4, 4);

    floorView = new THREE.PerspectiveCamera(155.5, window.innerWidth / window.innerHeight, 1, 10000);
    floorView.position.set(0, 0, 0);
    floorView.lookAt(0, 1, 0);

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

    // CLOCK
    clock = new THREE.Clock();

    // FOG
    // scene.fog = new THREE.Fog ('black', 10, 50);

    // LIGHTS
    light1 = new THREE.PointLight('#fff', .75);
    light1.castShadow = true;
    light1.shadow.bias = -0.0001;
    light1.shadow.mapSize.width = 2048;
    light1.shadow.mapSize.height = 1024;
    light1.position.set(6, 16, 10);
    scene.add(light1);

    light1XOrbit = 15;
    light1YOrbit = 1;
    light1ZOrbit = 15;

    var light3 = new THREE.PointLight('#fff', .25);
    light3.castShadow = true;
    light3.position.set(-2, 7, -3);
    scene.add(light3);

    var light2 = new THREE.AmbientLight('#333'); 
	light2.position.set( light1.position );
    // scene2.add(light2);
    
    var hemiLight = new THREE.HemisphereLight('#99f', '#0f6', .35);
    scene.add(hemiLight);
    

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

	textContainer.position.set( 0, 4, 0 );
	scene3.add( textContainer );

	textContainer.add(

		new ThreeMeshUI.Text({
			content: "XANADU",
			fontSize: 0.75
		}),	

	);

    // DARK MATERIAL
    var darkMaterial = new THREE.MeshBasicMaterial({
        color: 'black',
        side: THREE.DoubleSide,
        transparent: true
    });

    // PORTAL
    var sphere = getSphere(1.49, 50);
    sphere.position.set(0, 4, 0);
    sphere.scale.set(1, 1, 0.2);
    scene.add(sphere);
    var darkSphere = sphere.clone();
    darkSphere.material = darkMaterial;
    scene2.add(darkSphere);

    // FLOOR
    var size = 20;
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
    floorMesh.position.set(0, -1, 6);
    scene.add(floorMesh);

    // floorMesh.material = floorChecker;
    floorMesh.position.y += 0.01; // COMPENSATE for overlap with wallNZ

    var darkFloor = floorMesh.clone();
    darkFloor.position.set(0, -1, 6);
    darkFloor.material = darkMaterial;
    scene2.add(darkFloor);
    // scene3.add(darkFloor);

    var wallInit = true;
    if (wallInit) {

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

    var wallMaterial = new THREE.MeshPhongMaterial( {
        color: '#fff',
        // map: texture,
        side: THREE.DoubleSide,
        shininess: 100
    });

    var wallNZMesh = new THREE.Mesh(wallNZGeo, wallMaterial);

    wallNZMesh.position.set(0, 0, -4);
    wallNZMesh.castShadow = true;

    scene.add(wallNZMesh);

    //WALL NX
    var wallNX = new THREE.Shape();
    wallNX.moveTo(-10, -1);
    wallNX.lineTo(10, -1);
    wallNX.lineTo(10, 10);
    wallNX.lineTo(-10, 10);

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

    var wallNXMesh = new THREE.Mesh(wallNXGeo, wallMaterial);

    wallNXMesh.position.set(-10, 0, 6);
    wallNXMesh.rotation.y = Math.PI/2;
    wallNXMesh.castShadow = true;

    scene.add(wallNXMesh);

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

    var wallPZMesh = new THREE.Mesh(wallPZGeo, wallMaterial);

    wallPZMesh.position.set(0, 0, 16);

    wallPZMesh.castShadow = true;

    scene.add(wallPZMesh);

    //WALL PX
    var wallPX = new THREE.Shape();
    wallPX.moveTo(-10, -1);
    wallPX.lineTo(10, -1);
    wallPX.lineTo(10, 10);
    wallPX.lineTo(-10, 10);

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

    var wallPXMesh = new THREE.Mesh(wallPXGeo, wallMaterial);

    wallPXMesh.position.set(9, 0, 6);
    wallPXMesh.rotation.y = Math.PI/2;

    wallPXMesh.castShadow = true;

    scene.add(wallPXMesh);

    // ROOF
    var roof = new THREE.Shape();
    roof.moveTo(-10, -10);
    roof.lineTo(10, -10);
    roof.lineTo(10, 10);
    roof.lineTo(-10, 10);

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

    var roofMesh = new THREE.Mesh(roofGeo, wallMaterial);

    roofMesh.position.set(0, 10, 6.25);
    roofMesh.rotation.x = Math.PI/2;
    roofMesh.castShadow = true;

    scene.add( roofMesh );

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

        wallNZLines.position.set(0, 0, -4);

        scene.add( wallNZLines );

        var darkWallNZ = wallNZMesh.clone();
        darkWallNZ.material = darkMaterial;
        scene2.add(darkWallNZ);

        var wallNXEdges = new THREE.EdgesGeometry( wallNXGeo );
        var wallNXLines = new THREE.LineSegments( wallNXEdges, lineMaterial );

        wallNXLines.position.set(-10, 0, 6);
        wallNXLines.rotation.y = Math.PI/2;

        scene.add( wallNXLines );

        var darkWallNX = wallNXMesh.clone();
        darkWallNX.material = darkMaterial;
        scene2.add(darkWallNX);

        var wallPZEdges = new THREE.EdgesGeometry( wallPZGeo );
        var wallPZLines = new THREE.LineSegments( wallPZEdges, lineMaterial );

        wallPZLines.position.set(0, 0, 16);

        scene.add( wallPZLines );

        var darkWallPZ = wallPZMesh.clone();
        darkWallPZ.material = darkMaterial;
        scene2.add(darkWallPZ);

        var wallPXEdges = new THREE.EdgesGeometry( wallPXGeo );
        var wallPXLines = new THREE.LineSegments( wallPXEdges, lineMaterial );

        wallPXLines.position.set(9, 0, 6);
        wallPXLines.rotation.y = Math.PI/2;

        scene.add( wallPXLines );

        var darkWallPX = wallPXMesh.clone();
        darkWallPX.material = darkMaterial;
        scene2.add(darkWallPX);

        var roofEdges = new THREE.EdgesGeometry( roofGeo );
        var roofLines = new THREE.LineSegments( roofEdges, lineMaterial );

        roofLines.position.set(0, 10, 6.25);
        roofLines.rotation.x = Math.PI/2;

        scene.add( roofLines );

        var darkroof = roofMesh.clone();
        darkroof.material = darkMaterial;
        scene2.add(darkroof);

    }

    // EYEBALL
    var eyePlane = new THREE.PlaneGeometry(1, 1, 1, 1);
    var eyeTexture = new THREE.TextureLoader().load(eyeSprite);
    
    animator =  new  TextureAnimator(eyeTexture, 44, 1, 44, 15);
    
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
    scene.add(eyeMesh);

    darkEye = eyeMesh.clone();

    var darkEyeMaterial = new THREE.MeshBasicMaterial({
        map: eyeTexture,
        transparent: true,
        color: '#000',
        side: THREE.DoubleSide
    });
    darkEye.material = darkEyeMaterial;
    scene2.add(darkEye);

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
    
    scene2.add(starMesh);

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
    let loader = new GLTFLoader();
    loader.load( theHorse, function ( gltf ) {

        horseMesh = gltf.scene.children[ 0 ];
        horseMesh.scale.set( 0.055, 0.055, 0.055 );
        horseMesh.position.y = -5;
        // horseMesh.material.color.offsetHSL(0, -0.5, 0);

        scene.add( horseMesh );
        // darkHorse = horseMesh.clone();
        // scene2.add( darkHorse );

        mixer = new THREE.AnimationMixer( horseMesh );

        mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();

    } );

    // PALM POT
    loader.load( thePalm, function ( gltf ) {

        palmMesh = gltf.scene.children[ 0 ];
        palmMesh.traverse(function(o) {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
        palmMesh.scale.set(0.05, 0.05, 0.05);
        palmMesh.position.set(0, 0, 6);
        palmMesh.castShadow = true;
        palmMesh.receiveShadow = true;
        scene.add( palmMesh );

        // let darkPalm = palmMesh.clone();
        // scene2.add(darkPalm);
    } );

    // RING
    var circleSize = 1.5;
    var tubeSize = .01;
    geometry = new THREE.TorusBufferGeometry(circleSize, tubeSize, 100, 100);
    var circleMat = new THREE.MeshBasicMaterial({
        color: '#fff',
        side: THREE.DoubleSide
    });
    var circleMesh = new THREE.Mesh(geometry, circleMat);
    circleMesh.position.y = 4;
    scene2.add(circleMesh);

    // SMOKE
    var smokeBottom = -1;

    smokeCenter = smokeLine(-0.15, smokeBottom, -.025, 2.55, 0.15, smokeBottom, .025, 2.65);
    smokeLeft = smokeLine(-1.15, smokeBottom, -0.175, 2.75, -0.65, smokeBottom, -0.165, 2.55);
    smokeRight = smokeLine(0.65, smokeBottom, 0.165, 2.55, 1.15, smokeBottom, 0.175, 2.65);
    smokeLeft2 = smokeLine(-2.5, smokeBottom, -0.35, 2.65, -1.75, smokeBottom, -0.35, 2.55);
    smokeRight2 = smokeLine(1.75, smokeBottom, 0.35, 2.55, 2.5, smokeBottom, 0.35, 2.65);
    
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

    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor('#000');
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // renderer.autoClear = false;

    // CONTROLS
    controls = new OrbitControls( camera, renderer.domElement );
    controls.target = new THREE.Vector3(0, 4, 0);

    document.body.appendChild(renderer.domElement);

    // POST PROCESSING
    var renderScene = new RenderPass(scene, camera);
    var renderScene2 = new RenderPass(scene2, camera);
    var renderScene3 = new RenderPass(scene3, camera);

    composer = new EffectComposer(renderer);
    composer2 = new EffectComposer(renderer);
    composer3 = new EffectComposer(renderer);

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
    blendPass2.uniforms.tAdd.value = composer2.renderTarget2.texture; 

    // var saoPass = new SAOPass(scene, camera, false, true);

    // ssaoPass.kernelRadius = 16;

    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(renderScene);
    // composer.addPass(saoPass);
    composer.addPass(copyShader);

    composer2.setSize(window.innerWidth, window.innerHeight);
    composer2.addPass(renderScene2);
    // composer2.addPass(effectFXAA); 
    composer2.addPass(bloomPass);
    // composer2.addPass(chromaticAbberation);
    composer2.addPass(blendPass);
    composer2.addPass(effectFXAA);
    composer2.addPass(copyShader);

    composer3.setSize(window.innerWidth, window.innerHeight);
    composer3.addPass(renderScene3);
    composer3.addPass(blendPass2);
    composer3.addPass(effectFXAA);
    composer3.addPass(copyShader);

}

function animate() {

    requestAnimationFrame(animate);

    // MSDF
    ThreeMeshUI.update();

    // CONTROLS
    controls.update();

    // CLOCK
    var timeElapsed = clock.getElapsedTime();
    var delta = clock.getDelta(); 

    // EYEBALL
    var eyeSpeed = 0.5;

    eyeMesh.position.x = -7 + eyeXOrbit * Math.cos(timeElapsed*eyeSpeed);
    eyeMesh.position.y = 4 + eyeYOrbit * Math.sin(timeElapsed*eyeSpeed);
    eyeMesh.position.z = eyeZOrbit * Math.sin(timeElapsed*eyeSpeed);

    darkEye.position.x = -7 + eyeXOrbit * Math.cos(timeElapsed*eyeSpeed);
    darkEye.position.y = 4 + eyeYOrbit * Math.sin(timeElapsed*eyeSpeed);
    darkEye.position.z = eyeZOrbit * Math.sin(timeElapsed*eyeSpeed);

    animator.update(100 * delta);

    // HORSE
    if ( mixer ) {

        const time = Date.now();

        mixer.update( ( time - prevTime ) * 0.001 );

        prevTime = time;

    }
    horseMesh.position.x = Math.cos(timeElapsed * 0.25) * 40;

    horseMesh.rotation.y = -(timeElapsed * 0.25);
    horseMesh.position.z = 6 + Math.sin(timeElapsed * 0.25) * 44;

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

    // var lightSpeed = 0.1;

    // light1.position.x = 6 +light1XOrbit * Math.cos(timeElapsed*lightSpeed);
    // light1.position.y = 16 + light1YOrbit * Math.sin(timeElapsed*lightSpeed);
    // light1.position.z = 10 + light1ZOrbit * Math.sin(timeElapsed*lightSpeed);

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
    var amp = .003;
    var freq = .65;
    for (var n = 0; n < smoke.length; n++){

        for (let i = 0; i < smoke[n].geometry.attributes.position.length/3; i++) {
           
            smoke[n].geometry.attributes.position.array[i*3] += Math.sin(timeElapsed*5+i*-freq)*amp;
        }
        smoke[n].geometry.attributes.position.needsUpdate = true;

    }


    // BG CUBE
    bgCube.rotation.y += 0.0001;
    bgCube.rotation.z += 0.0002;  

    // PORTAL CAM
    cubeCamera.update( renderer, scene );

    // RENDER
   
    // renderer.setRenderTarget( null );
    // renderer.clear();

    
    composer.render(scene, camera);
    composer2.render(scene2, camera);
    composer3.render(scene3, camera);

    // renderer.render(scene3, camera);

}

function onWindowResize() {
	// Camera frustum aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;
	// After making changes to aspect
	camera.updateProjectionMatrix();
	// Reset size
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

init();
animate();