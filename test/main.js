let cubeCamera;
let container;
let sphereMesh;
let clock;
let cc = 2;

// import { UnrealBloomPass } from 'UnrealBloomPass.js';


function getLight() {
	var light = new THREE.PointLight(0xffffff, 1);
	light.castShadow = true;
	var shadowMapSize = 30;

	//Set up shadow properties for the light
	// light.shadow.mapSize.width = 1024;
	// light.shadow.mapSize.height = 1024;

	// light.shadow.camera.left = -shadowMapSize;
	// light.shadow.camera.bottom = -shadowMapSize;
	// light.shadow.camera.right = shadowMapSize;
	// light.shadow.camera.top = shadowMapSize;

	light.shadow.bias = 0.0001;
	light.angle = Math.PI / 4;
	light.penumbra = 0.05;
	light.decay = 2;
	light.distance = 1000;
	light.shadow.camera.near = 1;
	light.shadow.camera.far = 1000;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;

	return light;
}

function getBox(w, h, d, segments) {
	var geometry = new THREE.BoxGeometry(w, h, d, segments, segments, segments);
	
	var material = new THREE.MeshBasicMaterial({
		// color: '#fff'
		envMap: cubeCamera.renderTarget,
		roughness: 0,
	});

	// material.envMap.mapping = THREE.CubeRefractionMapping;

	var obj = new THREE.Mesh(geometry, material);
	obj.castShadow = true;

	return obj;
}

function getSphere(radius, segments) {
	var geometry = new THREE.SphereGeometry(radius, segments, segments);
	var material = new THREE.MeshPhongMaterial({
		color: 'rgb(255, 0, 0)', 
		emissive: 'rgb(10, 0, 255)',
		specular: 'rgb(255, 50, 255)',
		// roughness: .01,
		// metalness: .1,
		shininess: 80,
		// envMap: cubeCamera.renderTarget
		side: THREE.DoubleSide,
		transparent: true,
		// opacity: 1,
		envMap: cubeCamera.renderTarget,
	});

	material.envMap.mapping = THREE.CubeRefractionMapping;

	// var envMap = new THREE.TextureLoader().load("envMap.png");
	// envMap.mapping = THREE.SphericalReflectionMapping;
	// material.envMap = envMap;
	
	var roughnessMap = new THREE.TextureLoader().load("roughnessMap.png");
	roughnessMap.magFilter = THREE.NearestFilter;
	material.roughnessMap = roughnessMap;


	sphereMesh = new THREE.Mesh(geometry, material);
	sphereMesh.castShadow = true;

	return sphereMesh;
}

function getPlane(size, segments, cubeCamera) {
	var geometry = new THREE.PlaneGeometry(size, size, segments, segments);
	
	var scale = size*4;
	var scale2 = size*2;

	var canvas = document.createElement('canvas'),
	ctx = canvas.getContext('2d');
	canvas.width = scale;
	canvas.height = scale;
	ctx.fillStyle = "#000";
    ctx.fillRect( 0, 0, scale, scale );
    ctx.fillStyle = "#fff";
    ctx.fillRect( 0, 0, scale2, scale2 );
    ctx.fillRect( scale2, scale2, scale2, scale2 );

    var texture = new THREE.Texture(canvas);
    texture.repeat.set( 100, 100 );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
	texture.needsUpdate = true;

	var material = new THREE.MeshStandardMaterial({
		roughness: 1,
		map: texture,
		// envMap: cubeCamera.renderTarget,
		roughnessMap: texture,

		// color: 'rgb(255, 255, 255)', 
		side: THREE.DoubleSide,
		// transparent: true
		// shininess: 200,
		// wireframe: true
	});
	var obj = new THREE.Mesh(geometry, material);
	obj.receiveShadow = true;
	// obj.castShadow = true;

	return obj;
}

function smokeLine (step, xStart1, yStart1, xEnd1, yEnd1, xStart2, yStart2, xEnd2, yEnd2) {
	var increment = 1 / step;
	var startPoint1 = new THREE.Vector3(xStart1, yStart1, 0);
	var endPoint1 = new THREE.Vector3(xEnd1, yEnd1, 0);
	var startPoint2 = new THREE.Vector3(xStart2, yStart2, 0);
	var endPoint2 = new THREE.Vector3(xEnd2, yEnd2, 0);
	
	var geometry1 = new THREE.Geometry();
	var geometry2 = new THREE.Geometry();

	geometry1.name = 'geometry1';
	geometry2.name = 'geometry2';

	for (i = 0; i <= 1; i = i + increment) {
		geometry1.vertices.push(new THREE.Vector3().lerpVectors(startPoint1, endPoint1, i));
		geometry2.vertices.push(new THREE.Vector3().lerpVectors(startPoint2, endPoint2, i));
	}

	var combo = geometry1;
	for (i = 0; i < geometry2.vertices.length; i++) {
		combo.vertices.push(geometry2.vertices[i]);
	}

	for (i = 0; i < step; i++) {
		combo.faces.push(
			new THREE.Face3(i, i+step+2, i+1),
			new THREE.Face3(i, i+step+1, i+step+2)
		);
	}

	// combo.vertices.push(endPoint2);
	// combo.vertices.push(startPoint2);
	// combo.vertices.push(startPoint1);


	// var material = new THREE.MeshBasicMaterial( {
	// 	color: 0x00ff00,
	// 	// wireframe: true
	// })

	var material = new THREE.MeshStandardMaterial({
		color: '#000', 
		// roughness: 0,
		// envMap: cubeCamera.renderTarget,
		side: THREE.DoubleSide
	});

	// material.envMap.mapping = THREE.CubeRefractionMapping;

	// var roughnessMap = new THREE.TextureLoader().load("roughnessMap.png");
	// roughnessMap.magFilter = THREE.NearestFilter;
	// material.roughnessMap = roughnessMap;

	var mesh = new THREE.Mesh(combo, material);

	// var line = new THREE.Line(geometry1, material);

	return mesh;
}

function smokeVector (cc, xStart1, yStart1, xEnd1, yEnd1, xStart2, yStart2, xEnd2, yEnd2) {

	let start1 = new THREE.Vector2(xStart1, yStart1);
	let end1 = new THREE.Vector2(xEnd1, yEnd1);
	let start2 = new THREE.Vector2(xStart2, yStart2);
	let end2 = new THREE.Vector2(xEnd2, yEnd2);

	let mid1 = new THREE.Vector2().lerpVectors(start1, end1, .5);
	let mid2 = new THREE.Vector2().lerpVectors(start2, end2, .5);

	let points = [];
	points.push(start1);
	points.push(mid1);
	points.push(end1);
	points.push(start2);
	points.push(mid2);
	points.push(end2);

	// let points = [];
	// points.push(new THREE.Vector2(xStart1, yStart1));
	// points.push(new THREE.Vector2(xEnd1, yEnd1));
	// points.push(new THREE.Vector2(xStart2, yStart2));
	// points.push(new THREE.Vector2(xEnd2, yEnd2));

	// var shape = new THREE.Shape(points);


	var shape = new THREE.Shape();
	shape.moveTo(start1.x, start1.y);
	shape.lineTo(start2.x, start2.y);
	shape.bezierCurveTo(start2.x+cc, start2.y, mid2.x-cc, mid2.y, mid2.x, mid2.y);
	shape.bezierCurveTo(mid2.x+cc, mid2.y, end2.x-cc, end2.y, end2.x, end2.y);
	shape.lineTo(end1.x, end1.y);
	shape.bezierCurveTo(end1.x-cc, end1.y, mid1.x+cc, mid1.y, mid1.x, mid1.y);
	shape.bezierCurveTo(mid1.x-cc, mid1.y, start1.x+cc, start1.y, start1.x, start1.y);

	var extrudeSettings = {
		amount: .001,
		steps: 1,
		depth: 1,
		bevelEnabled: true,
		bevelThickness: .1,
		bevelSize: .2,
		bevelOffset: 0,
		bevelSegments: 20,
		curveSegments: 50
	};
	
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

	// var geometry = new THREE.ExtrudeGeometry(shape, {amount: 5, bevelEnabled: false});
	
	// var geometry = new THREE.ShapeGeometry(shape);

	var material = new THREE.MeshBasicMaterial({
		wireframe: true,
		color: '#fff', 
		// envMap: cubeCamera.renderTarget,
	});

	// material.envMap.mapping = THREE.CubeRefractionMapping;

	var mesh = new THREE.Mesh(geometry, material);

	return mesh;
}

function init() {

	container = document.createElement( 'div' );
  	document.body.appendChild( container );
	// scene
	var scene = new THREE.Scene();
	// var gui = new dat.GUI();
	clock = new THREE.Clock();

	// CAMERA
	var camera = new THREE.PerspectiveCamera(
		45, // field of view
		window.innerWidth / window.innerHeight, // aspect ratio
		1, // near clipping plane
		5000 // far clipping plane
	);
	camera.lookAt(new THREE.Vector3(0,2,0));

	// CUBE CAMERA
	cubeCamera = new THREE.CubeCamera(0.1, 1000, 1000); 
	scene.add(cubeCamera);

	// RENDERER
	var renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: false,
	});
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	// renderer.gammaInput = true;
	// renderer.gammaOutput = true;

	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor('rgb(0, 0, 0)');
	document.body.appendChild(renderer.domElement);

	// POST PROCESSING
	var composer = new THREE.EffectComposer(renderer);

	var renderPass = new THREE.RenderPass(scene, camera);
	
	// var vignetteEffect = new THREE.ShaderPass(THREE.VignetteShader);
	// vignetteEffect.uniforms['darkness'].value = 2;

	var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
	// effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );

	var res = new THREE.Vector2(window.innerWidth, window.innerHeight);
	// var bloomPass = new THREE.UnrealBloomPass(res, 2, 0.1, 0.1);

	var bloom = new THREE.ShaderPass(THREE.BloomPass);
	
	var rgbShiftShader = new THREE.ShaderPass(THREE.RGBShiftShader);
	rgbShiftShader.uniforms['amount'].value = 0.003;

	var copyShader = new THREE.ShaderPass(THREE.CopyShader);
	copyShader.renderToScreen = true;

	composer.addPass(renderPass);
	// composer.addPass(effectFXAA);
	composer.addPass(rgbShiftShader);
	// composer.addPass(bloomPass);
	// composer.addPass(bloom);
	composer.addPass(copyShader);

	// renderer.toneMapping = THREE.LinearToneMapping;
	// renderer.toneMappingExposure = Math.pow( 1, 4.0 );

	// CONTROLS
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target = new THREE.Vector3(0, 2, 0);

	// FOG
	var enableFog = true;
	if (enableFog) {
		scene.fog = new THREE.Fog('rgb(0, 0, 0)', 10, 20);
	}

	// LIGHTS
	var light1 = getLight();
	scene.add(light1);

	var light2 = new THREE.AmbientLight('#111'); 
	light2.position.set( light1.position );
	scene.add(light2);

	// SHADER TEST
	
	uniforms1 = {
		"time": { value: 0.0 },
		"colorTexture": { value: new THREE.TextureLoader().load( 'purplestars2.jpg' ) }

	};

	uniforms1[ "colorTexture" ].value.wrapS = uniforms1[ "colorTexture" ].value.wrapT = THREE.RepeatWrapping;

	// GLOBALS
	var worldRadius = 40;

	// SKY DOME
	var skyGeo = new THREE.SphereBufferGeometry(worldRadius, 32, 15);
	var skyMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms1,
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent,
		side: THREE.DoubleSide,
		// lights: true,
	});
	var skyMesh = new THREE.Mesh(skyGeo, skyMaterial);
	scene.add(skyMesh);

	// SKY FILTER
	var skyFilterGeo = new THREE.SphereBufferGeometry(worldRadius-1, 32, 15);
	var skyFilterMat = new THREE.MeshStandardMaterial({
		color: 'rgb(0, 0, 0)',
		opacity: 1,
		transparent: true,
		side: THREE.BackSide,
	});
	var skyFilterMesh = new THREE.Mesh(skyFilterGeo, skyFilterMat);

	scene.add(skyFilterMesh);

	// HORIZON TORUS
	// var horizon = new THREE.TorusBufferGeometry(worldRadius-10, 1, 5, 50);
	// var horizonMat = new THREE.MeshLambertMaterial({
	// 	color: 'rgb(0, 255, 0',
	// 	emissive: 'rgb(0, 255, 0)',
	// 	side: THREE.DoubleSide,
	// });
	// var horizonMesh = new THREE.Mesh(horizon, horizonMat);
	// horizonMesh.rotation.x = Math.PI/2;
	// scene.add(horizonMesh);

	// ADD GEOMETRY
	var floor = getPlane(100, 100, cubeCamera);
	var ball = getSphere(2, 30, cubeCamera);
	var smoke = smokeLine(19, -2, 0, -.5, 2, 2, 0, .5, 2);
	var box = getBox(3, 3, 3, 3);

	// TEST SMOKE VECTOR
	// var meshTest = smokeVector(cc, -1, 0, -.25, 3, 1, 0, .25, 3);
	// scene.add(meshTest);
	// meshTest.position.y = 1;
	// meshTest.name = 'smokey';

	floor.name = 'the-floor';
	ball.name = 'ball';
	smoke.name = 'smoke';

	// MANIPULATE GEOMETRY
	floor.rotation.x = Math.PI/2;
	// floor.position.y = -2;
	light1.position.set(3, 5, 4);
	skyMesh.rotation.x = Math.PI/2;
	skyMesh.rotation.z = Math.PI/2;
	ball.position.set(2, 2, 0);

	cubeCamera.position.y = 1;
	// cubeCamera.rotation.y = Math.PI;

	camera.position.z = 7;
	camera.position.y = 4;

	// TEST PLANE
	// var planegeo = new THREE.PlaneGeometry(3, 3, 3, 3);
	// var planematerial = new THREE.MeshBasicMaterial({
	// 	// color: '#fff', 
	// 	// wireframe: true
	// 	envMap: cubeCamera.renderTarget,
	// });
	// // planematerial.envMap.mapping = THREE.CubeRefractionMapping;

	// var planeMesh = new THREE.Mesh(planegeo, planematerial);
	// // scene.add(planeMesh);

	// ADD geometry to the scene
	scene.add(floor);
	scene.add(ball);
	scene.add(smoke);
	// scene.add(box);

	// LIGHT HELPER
	// scene.add( new THREE.CameraHelper( light1.shadow.camera ) );
	
	window.addEventListener('resize', onWindowResize, false);

	update(renderer, composer, scene, camera, controls, clock);

	// return scene;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);

}

// UPDATE
function update(renderer, composer, scene, camera, controls, clock) {
	controls.update();

	var timeElapsed = clock.getElapsedTime();

	//FLOOR WAVE
	// var waveFloor = scene.getObjectByName('the-floor');
    // waveFloor.geometry.vertices.forEach(function(i, index) {
        
    //     i.z = Math.sin(timeElapsed+index)*.1;
    //     i.z += Math.sin(timeElapsed+index*.1)*.25;
    // });
	// waveFloor.geometry.verticesNeedUpdate = true;
	
	// SPHERE TWIST
	// var quaternion = new THREE.Quaternion();
	// var sphereTwist = scene.getObjectByName('ball');

  	// for (let i = 0; i < sphereTwist.geometry.vertices.length; i++) {
	// 	var yPos = sphereTwist.geometry.vertices[i].y;
	// 	var twistAmount = .5;
	// 	var upVec = new THREE.Vector3(0, Math.sin(timeElapsed), 0);

	// 	quaternion.setFromAxisAngle(
	// 	upVec, 
	// 	(Math.PI / 180) * (yPos / twistAmount)
	// 	);

	// 	sphereTwist.geometry.vertices[i].applyQuaternion(quaternion);
	// }
	// sphereTwist.geometry.verticesNeedUpdate = true;

	// LINE WAVE
	// var lineWave = scene.getObjectByName('smoke');
	// lineWave.geometry.vertices.forEach(function(i, index){
		
	// 	if (index > 0 && index < lineWave.geometry.vertices.length-1) {
	// 		i.x += Math.sin(timeElapsed*5+index*.35)*.01;
	// 	}
		
	// });
	// lineWave.geometry.verticesNeedUpdate = true;

	// SMOKE WAVE
	var smokeWave = scene.getObjectByName('smoke');
	smokeWave.geometry.vertices.forEach(function(i, index){
		
		if (index > 0 && index < (smokeWave.geometry.vertices.length/2)-1) {
			i.x += Math.sin(timeElapsed*5+index*.35)*.01;
		}

		if (index > smokeWave.geometry.vertices.length/2 && index < smokeWave.geometry.vertices.length-1) {
			i.x -= Math.sin(timeElapsed*5+index*.35)*.01;
		}
	});
	smokeWave.geometry.verticesNeedUpdate = true;

	// SMOKE VECTOR WAVE
	// var smokeWave = scene.getObjectByName('smokey');
	// smokeWave.geometry.vertices.forEach(function(i, index){
		
	// 	if (index > 1 && index < (smokeWave.geometry.vertices.length/2)-1) {
	// 		i.x += Math.sin(timeElapsed*5*.35)*.01;
	// 	}

	// 	if (index > smokeWave.geometry.vertices.length/2 && index < smokeWave.geometry.vertices.length-2) {
	// 		i.x -= Math.sin(timeElapsed*5+index*.35)*.01;
	// 	}
	// });
	// smokeWave.geometry.verticesNeedUpdate = true;

	// SHADER UPDATE
	// const delta = clock.getDelta();
	// uniforms1[ "time" ].value += delta;
	uniforms1[ "time" ].value = clock.elapsedTime;


	// CUBE CAMERA MIRROR UPDATE
	// sphereMesh.visible = false;
	var ball = scene.getObjectByName('ball');
	ball.visible = false;
	cubeCamera.updateCubeMap(renderer, scene);
	ball.visible = true;
	// sphereMesh.visible = true;

	composer.render(scene, camera);

	requestAnimationFrame(function() {
		update(renderer, composer, scene, camera, controls, clock);
	});	
}

init();