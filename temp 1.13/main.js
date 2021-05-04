// import { PlainAnimator } from 'three-plain-animator/lib/plain-animator';

var camera, scene, renderer;
var scene2, scene3;
let cubeCamera;
var geometry, material, mesh;
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

	sphereMesh = new THREE.Mesh(geometry, material);
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
    
    // const bgLoader = new THREE.CubeTextureLoader();
    // const bgTexture = bgLoader.load([
    //   'spacebox/bkg1_right.png',
    //   'spacebox/bkg1_left.png',
    //   'spacebox/bkg1_top.png',
    //   'spacebox/bkg1_bot.png',
    //   'spacebox/bkg1_back.png',
    //   'spacebox/bkg1_front.png',
    // ]);

    // var bgGeo = new THREE.BoxBufferGeometry(75, 75, 75);
    // var bgMaterial = new THREE.MeshBasicMaterial({
    //     // color: '#f00',
    //     side: THREE.DoubleSide,
    //     envMap: bgTexture
    // });

    // BG CUBE
    let bgMaterial = [];
    let texture_ft = new THREE.TextureLoader().load( 'space8/pz.png');
    let texture_bk = new THREE.TextureLoader().load( 'space8/nz.png');
    let texture_up = new THREE.TextureLoader().load( 'space8/py.png');
    let texture_dn = new THREE.TextureLoader().load( 'space8/ny.png');
    let texture_rt = new THREE.TextureLoader().load( 'space8/px.png');
    let texture_lf = new THREE.TextureLoader().load( 'space8/nx.png');
      
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_up }));
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
    bgMaterial.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
       
    for (let i = 0; i < 6; i++)
      bgMaterial[i].side = THREE.BackSide;

    // var bgLoader = new THREE.TextureLoader();
    // var bgTexture = bgLoader.load('stars/stars-ER-1.png');
    // var bgTarget = new THREE.WebGLCubeRenderTarget(1024);
    // bgTarget.fromEquirectangularTexture(renderer, bgTexture);

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
    light1.shadow.mapSize.width = 1024*2;
    light1.shadow.mapSize.height = 1024*2;
    light1.position.set(6, 16, 10);
    scene.add(light1);

    light1XOrbit = 15;
    light1YOrbit = 1;
    light1ZOrbit = 15;

    var light3 = new THREE.PointLight('#fff', .25);
    light3.castShadow = true;
    light3.position.set(-2, 7, -3);
    scene.add(light3);

    var light2 = new THREE.AmbientLight('#111'); 
	light2.position.set( light1.position );
    // scene.add(light2);
    
    var hemiLight = new THREE.HemisphereLight('#99f', '#0f6', .35);
    scene.add(hemiLight);

    // MSDF
    const textContainer = new ThreeMeshUI.Block({
		width: 3,
		height: 2,
		padding: 0.05,
		justifyContent: 'center',
		alignContent: 'center',
		fontFamily: 'MSDF Xanadu/Xanadu-Regular.json',
        fontTexture: 'MSDF Xanadu/Xanadu-Regular.png',
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

    // SPHERE
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
    ctx.fillStyle = "#999";
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
    floorMesh.position.y += 0.01;

    var darkFloor = floorMesh.clone();
    // darkFloor.position.y += 2;
    darkFloor.material = darkMaterial;
    scene2.add(darkFloor);

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
        amount: .5, 
        curveSegments: 150,
        bevelEnabled: false, 
        bevelSegments: 2, 
        steps: 2, 
        bevelSize: 1, 
        bevelThickness: 1 
    };

    var wallNZGeo = new THREE.ExtrudeBufferGeometry( wallNZ, extrudeSettings );

    var wallMaterial = new THREE.MeshStandardMaterial( {
        color: '#fff',
        // map: texture,
        side: THREE.DoubleSide
    });

    var wallNZMesh = new THREE.Mesh(wallNZGeo, wallMaterial);

    wallNZMesh.position.set(0, 0, -4);
    wallNZMesh.castShadow = true;

    scene.add(wallNZMesh);

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

    var extrudeSettings = { 
        amount: .5, 
        curveSegments: 100,
        bevelEnabled: false, 
        bevelSegments: 2, 
        steps: 2, 
        bevelSize: 1, 
        bevelThickness: 1 
    };

    var wallNXGeo = new THREE.ExtrudeBufferGeometry( wallNX, extrudeSettings );

    var wallNXMesh = new THREE.Mesh(wallNXGeo, wallMaterial);

    wallNXMesh.position.set(-10, 0, 6);
    wallNXMesh.rotation.y = Math.PI/2;
    wallNXMesh.castShadow = true;

    scene.add(wallNXMesh);

    var wallNXEdges = new THREE.EdgesGeometry( wallNXGeo );
    var wallNXLines = new THREE.LineSegments( wallNXEdges, lineMaterial );

    wallNXLines.position.set(-10, 0, 6);
    wallNXLines.rotation.y = Math.PI/2;

    scene.add( wallNXLines );

    var darkWallNX = wallNXMesh.clone();
    darkWallNX.material = darkMaterial;
    scene2.add(darkWallNX);

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

    var extrudeSettings = { 
        amount: .5, 
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

    var wallPZEdges = new THREE.EdgesGeometry( wallPZGeo );
    var wallPZLines = new THREE.LineSegments( wallPZEdges, lineMaterial );

    wallPZLines.position.set(0, 0, 16);

    scene.add( wallPZLines );

    var darkWallPZ = wallPZMesh.clone();
    darkWallPZ.material = darkMaterial;
    scene2.add(darkWallPZ);

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

    var extrudeSettings = { 
        amount: .5, 
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

    var wallPXEdges = new THREE.EdgesGeometry( wallPXGeo );
    var wallPXLines = new THREE.LineSegments( wallPXEdges, lineMaterial );

    wallPXLines.position.set(9, 0, 6);
    wallPXLines.rotation.y = Math.PI/2;

    scene.add( wallPXLines );

    var darkWallPX = wallPXMesh.clone();
    darkWallPX.material = darkMaterial;
    scene2.add(darkWallPX);

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

    var extrudeSettings = { 
        amount: .5, 
        curveSegments: 100,
        bevelEnabled: false, 
        bevelSegments: 2, 
        steps: 2, 
        bevelSize: 1, 
        bevelThickness: 1 
    };

    var roofGeo = new THREE.ExtrudeBufferGeometry( roof, extrudeSettings );

    var roofMesh = new THREE.Mesh(roofGeo, wallMaterial);

    roofMesh.position.set(0, 10, 6.25);
    roofMesh.rotation.x = Math.PI/2;
    roofMesh.castShadow = true;

    scene.add(roofMesh);

    var roofEdges = new THREE.EdgesGeometry( roofGeo );
    var roofLines = new THREE.LineSegments( roofEdges, lineMaterial );

    roofLines.position.set(0, 10, 6.25);
    roofLines.rotation.x = Math.PI/2;

    scene.add( roofLines );

    var darkroof = roofMesh.clone();
    darkroof.material = darkMaterial;
    scene2.add(darkroof);

    // EYEBALL
    var eyePlane = new THREE.PlaneGeometry(1, 1, 1, 1);
    var eyeTexture = new THREE.TextureLoader().load('eyeball-sprite2.png');
    
    animator =  new  TextureAnimator(eyeTexture, 44, 1, 44, 15);
    
    var eyeMaterial = new THREE.MeshStandardMaterial({
        map: eyeTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    eyeMesh = new THREE.Mesh(eyePlane, eyeMaterial);
    
    eyeXOrbit = -10;
    eyeYOrbit = -3;
    eyeZOrbit = -10;
    
    eyeMesh.position.set(eyeXOrbit, eyeYOrbit, eyeZOrbit);
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
    // eyeMesh.add(darkEye);


    // CIRCLE
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
    // renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // renderer.autoClear = false;

    // CONTROLS
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target = new THREE.Vector3(0, 4, 0);

    document.body.appendChild(renderer.domElement);

    // POST PROCESSING
    var renderScene = new THREE.RenderPass(scene, camera);
    var renderScene2 = new THREE.RenderPass(scene2, camera);
    var renderScene3 = new THREE.RenderPass(scene3, camera);

    composer = new THREE.EffectComposer(renderer);
    composer2 = new THREE.EffectComposer(renderer);
    composer3 = new THREE.EffectComposer(renderer);

    var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
	effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );

    var copyShader = new THREE.ShaderPass(THREE.CopyShader);
    copyShader.renderToScreen = true;
    
    var chromaticAbberation = new THREE.ShaderPass(THREE.RGBShiftShader);
    chromaticAbberation.uniforms['amount'].value = 0.003;

	var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 			bloomStrength, bloomRadius, bloomThreshold);

    var blendPass = new THREE.ShaderPass( THREE.AdditiveBlendShader );
    blendPass.uniforms.tAdd.value = composer.renderTarget2.texture; // CHANGE THIS FOR MULTIPLE CHAINS?

    var blendPass2 = new THREE.ShaderPass( THREE.AdditiveBlendShader );
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
    composer2.addPass(chromaticAbberation);
    composer2.addPass(blendPass);
    composer2.addPass(effectFXAA);

    composer2.addPass(copyShader);

    composer3.setSize(window.innerWidth, window.innerHeight);
    composer3.addPass(renderScene3);
    composer3.addPass(blendPass2);
    composer3.addPass(copyShader);

}

function animate() {

    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame(animate);

    var delta = clock.getDelta(); 

    // MSDF
    ThreeMeshUI.update();

    // CONTROLS
    controls.update();

    // CLOCK
    var timeElapsed = clock.getElapsedTime();

    // EYEBALL
    var eyeSpeed = 0.5;

    eyeMesh.position.x = -7 + eyeXOrbit * Math.cos(timeElapsed*eyeSpeed);
    eyeMesh.position.y = 4 + eyeYOrbit * Math.sin(timeElapsed*eyeSpeed);
    eyeMesh.position.z = eyeZOrbit * Math.sin(timeElapsed*eyeSpeed);

    darkEye.position.x = -7 + eyeXOrbit * Math.cos(timeElapsed*eyeSpeed);
    darkEye.position.y = 4 + eyeYOrbit * Math.sin(timeElapsed*eyeSpeed);
    darkEye.position.z = eyeZOrbit * Math.sin(timeElapsed*eyeSpeed);

    animator.update(100 * delta);

    // LIGHT1

    var lightSpeed = 0.1;

    light1.position.x = 6 +light1XOrbit * Math.cos(timeElapsed*lightSpeed);
    light1.position.y = 16 + light1YOrbit * Math.sin(timeElapsed*lightSpeed);
    light1.position.z = 10 + light1ZOrbit * Math.sin(timeElapsed*lightSpeed);

    // SMOKE WAVE
    var amp = 0.003;
    var freq = .5;
    for (var n = 0; n < smoke.length; n++){
        smoke[n].geometry.vertices.forEach(function(i, index){
            
            if (index > 0 && index < (smoke[n].geometry.vertices.length/2)-1) {
                i.x += Math.sin(timeElapsed*5+index*-freq)*amp;
            }

            if (index > smoke[n].geometry.vertices.length/2 && index < smoke[n].geometry.vertices.length-1) {
                i.x -= Math.sin(timeElapsed*5+index*freq)*amp;
            }
        });
        smoke[n].geometry.verticesNeedUpdate = true;
    }
    
    // smokeLeft.geometry.vertices.forEach(function(i, index){
        
    //     if (index > 0 && index < (smokeLeft.geometry.vertices.length/2)-1) {
    //         i.x += Math.sin(timeElapsed*5+index*.65)*.01;
    //     }

    //     if (index > smokeLeft.geometry.vertices.length/2 && index < smokeLeft.geometry.vertices.length-1) {
    //         i.x -= Math.sin(timeElapsed*5+index*.75)*.01;
    //     }
    // });
    // smokeLeft.geometry.verticesNeedUpdate = true;
    
    // smokeRight.geometry.vertices.forEach(function(i, index){
        
    //     if (index > 0 && index < (smokeRight.geometry.vertices.length/2)-1) {
    //         i.x += Math.sin(timeElapsed*5+index*.65)*.01;
    //     }

    //     if (index > smokeRight.geometry.vertices.length/2 && index < smokeRight.geometry.vertices.length-1) {
    //         i.x -= Math.sin(timeElapsed*5+index*.75)*.01;
    //     }
    // });
	// smokeRight.geometry.verticesNeedUpdate = true;

    // UPDATE CUBEMAP
    // scene.getObjectByName('testBox').visible = false;
    // cubeCamera.update(renderer, scene);
    // cubeCamera.updateCubeMap(renderer, scene);
    // scene.getObjectByName('testBox').visible = true;

    bgCube.rotation.y += 0.0001;
    bgCube.rotation.z += 0.0002;

    // renderer.setRenderTarget( rtTexture );
    // renderer.clear();
    // renderer.render( scene2, floorView );
    // renderer.setRenderTarget( null );
    // renderer.clear();   

    cubeCamera.update( renderer, scene );

    // RENDER
   
    composer.render(scene, camera);
    // composer.clearDepth();
    composer2.render(scene2, camera);
    // composer2.clearDepth();
    composer3.render(scene3, camera);
    // composer3.clearDepth();

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