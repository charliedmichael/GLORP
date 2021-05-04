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

var bloomStrength = 2;
var bloomRadius = 0;
var bloomThreshold = 0.1;

let clock;

function getSphere (radius, segments) {
    var geometry = new THREE.SphereGeometry(radius, segments, segments);
    
	var material = new THREE.MeshPhongMaterial({
		color: 'rgb(200, 0, 0)', 
		emissive: 'rgb(10, 0, 255)',
        specular: 'rgb(255, 50, 255)',
        // ambient: 'rgb(200, 0, 0)',
		// roughness: .01,
		// metalness: .1,
		shininess: 180,
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
		shininess: 180,
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

    var material = new THREE.MeshBasicMaterial({
        color: 'white', 
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
    
    // CAMERA
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
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
    cubeCamera = new THREE.CubeCamera( 1, 1000, cubeRenderTarget1 );
    cubeCamera.position.set(0, 3, 0);
    // scene.add(cubeCamera);

    // CLOCK
    clock = new THREE.Clock();

    // FOG
    scene.fog = new THREE.Fog ('black', 10, 20);

    // LIGHTS

    var light1 = new THREE.PointLight('#fff', 1);
    light1.castShadow = true;
    light1.position.set(1, 5, 3);
    scene.add(light1);

    var light2 = new THREE.AmbientLight('#111'); 
	light2.position.set( light1.position );
	scene.add(light2);

    // TEST BOX
    // var testBoxGeo = new THREE.BoxBufferGeometry(2, 2, 2, 2);
    // testBoxMat = new THREE.MeshBasicMaterial({
    //     // transparent: true,
    //     // side: THREE.DoubleSide,
	// 	envMap: cubeRenderTarget1.texture,
    //     combine: THREE.MultiplyOperation,
    //     reflectivity: 1

    // });
    // var testBoxMesh = new THREE.Mesh(testBoxGeo, testBoxMat);
    // testBoxMesh.position.set(3, 3, 0);
    // testBoxMesh.name = 'testBox';
    // scene.add(testBoxMesh);

    // FONT
    // var fontLoader = new THREE.FontLoader();

    // TEXT CANVAS
    // var xanadu = fontLoader.load('Xanadu_Regular.json');

    // var xanadu_font = new FontFace('XANADU', 'Xanadu-11.9-2.otf');
    // xanadu_font.load().then(function(loaded_face) {
	// document.fonts.add(loaded_face);
  	// // document.body.style.fontFamily = 'XANADU, Arial';
    // }).catch(function(error) {
	// // error occurred
    // });

    // var textCanvasSize = 400;
    // var textGeo = new THREE.PlaneGeometry(5, 5, 5, 5);
    // var textCanvas = document.createElement('canvas');
    // var textContext = textCanvas.getContext('2d');
    // textCanvas.width = 400;
    // textCanvas.height = 400;
    // // textContext.fillStyle = 'black';
    // // textContext.fillRect(0, 0, textCanvasSize, textCanvasSize);
    // textContext.font = '1 pt XANADU';
    // textContext.textAlign = 'center';
    // textContext.textBaseline = 'top';
    // textContext.fillStyle = 'rgb(255, 255, 255';
    // textContext.fillText('XANADU', textCanvasSize/2, textCanvasSize/2);
    // var textTexture = new THREE.Texture(textCanvas);
    // textTexture.needsUpdate = true;
    // var textMaterial = new THREE.MeshBasicMaterial({
    //     transparent: true,
    //     map: textTexture,
    //     // color: 'white',
    //     side: THREE.DoubleSide,
    // });
    // var textMesh = new THREE.Mesh(textGeo, textMaterial);

    // textMesh.position.set(0, 4, 0);

    // scene.add(textMesh);
    
    // TEXT GEO
    // fontLoader.load('Xanadu_Regular.json', function ( font ) {
    //     var textGeo = new THREE.TextGeometry('XANADU', {
    //         font: font,
    //         size: .5,
    //         height: 0,
    //         curveSegments: 150,
    //         bevelEnabled: false
    //     }); 
    //     var textMaterial = new THREE.MeshBasicMaterial({
    //         color: 'white'
    //     });

    //     var textMesh = new THREE.Mesh(textGeo, textMaterial);

    //     scene.add(textMesh);
    //     var center = -textMesh.width/2;
    //     textMesh.position.set(-1, 4, 0);
    // });

    // TYPEABLE TEXT
    // var textField = new ThreeTypeableText({
    //     camera: camera,
    //     font: xanadu,
    //     string: 'Hello text!\nThree Typeable Text',
    //     material: new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    //     align: 'center',
    //     onFocus: focusEvent
    // });

    // function focusEvent(focus)
    // {
    //     console.log('focusEvent')
    //     if(focus)
    //         textField.getObject().scale.set(1.2, 1.2, 1.2)
    //     else
    //         textField.getObject().scale.set(1, 1, 1)
    // }

    // textField.onChange = (newText, type, delta, position) => {
    //     console.log(`New Text: ${newText}\nEvent Type: ${type}\nDelta: ${delta}\nPosition in text: ${position}\n`);
    // }

    // textField.getObject().position.setY(2);
    
    // scene.add(textField._group);
    // elements.push(textField);

    // MSDF
    const textContainer = new ThreeMeshUI.Block({
		width: 3,
		height: 2,
		// padding: 0.05,
		justifyContent: 'center',
		alignContent: 'left',
		fontFamily: 'MSDF Xanadu/Xanadu-Regular-msdf.json',
        fontTexture: 'MSDF Xanadu/Xanadu-Regular.png',
        backgroundOpacity: 0
	});

	textContainer.position.set( .25, 4, 0 );
	scene3.add( textContainer );

	//

	textContainer.add(

		new ThreeMeshUI.Text({
			content: "XANADU",
			fontSize: 0.75
		}),

		

	);

    // DARK MATERIAL
    var darkMaterial = new THREE.MeshBasicMaterial({
        color: 'black',
        side: THREE.BackSide
    });

    // SPHERE
    var sphere = getSphere(1.99, 50);
    sphere.position.set(0, 4, 0);
    sphere.scale.set(1, 1, 0.2);
    scene.add(sphere);
    var darkSphere = sphere.clone();
    darkSphere.material = darkMaterial;
    scene2.add(darkSphere);

    // FLOOR
    var size = 100;
    var floorGeo = new THREE.PlaneGeometry(size, size, 100, 100);
    var scale = size*2;
	var scale2 = size;

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
    texture.repeat.set( 75, 75 ); // CHANGE THIS FOR CHECKER SIZE
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    var floorMat = new THREE.MeshStandardMaterial({
        color: '#fff',
        map: rtTexture.texture,
        // map: texture,
        // envMap: cubeCamera.renderTarget,
        side: THREE.DoubleSide,
        transparent: true,
        // opacity: .5,
        blending: THREE.AdditiveBlending,
    });
    var floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = Math.PI/2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    var floorShine = floorMesh.clone();
    scene.add(floorShine);

    var floorChecker = new THREE.MeshStandardMaterial({
        color: '#fff',
        // map: rtTexture.texture,
        map: texture,
        // envMap: cubeCamera.renderTarget,
        side: THREE.DoubleSide,
    });

    floorMesh.material = floorChecker;
    floorMesh.position.y -= 0.01;

    // CIRCLE
    var circleSize = 2;
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
    var smoke = smokeLine(19, -0.15, 0, -.05, 2, 0.15, 0, .05, 2);
    smoke.name = 'smoke';
	scene2.add(smoke);

    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.setClearColor('#000');
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;


    // renderer.autoClear = false;

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
    chromaticAbberation.uniforms['amount'].value = 0.001;

	var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 			bloomStrength, bloomRadius, bloomThreshold);

    var blendPass = new THREE.ShaderPass( THREE.AdditiveBlendShader );
    blendPass.uniforms.tAdd.value = composer.renderTarget2.texture; // CHANGE THIS FOR MULTIPLE CHAINS?

    var blendPass2 = new THREE.ShaderPass( THREE.AdditiveBlendShader );
    blendPass2.uniforms.tAdd.value = composer2.renderTarget2.texture; 

    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(renderScene);
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

    // MSDF
    ThreeMeshUI.update();

    // CONTROLS
    controls.update();

    // CLOCK
    var timeElapsed = clock.getElapsedTime();

    // SMOKE WAVE
	var smokeWave = scene2.getObjectByName('smoke');
	smokeWave.geometry.vertices.forEach(function(i, index){
		
		if (index > 0 && index < (smokeWave.geometry.vertices.length/2)-1) {
			i.x += Math.sin(timeElapsed*5+index*.65)*.01;
		}

		if (index > smokeWave.geometry.vertices.length/2 && index < smokeWave.geometry.vertices.length-1) {
			i.x -= Math.sin(timeElapsed*5+index*.75)*.01;
		}
	});
	smokeWave.geometry.verticesNeedUpdate = true;

    // UPDATE CUBEMAP
    // scene.getObjectByName('testBox').visible = false;
    // cubeCamera.update(renderer, scene);
    // cubeCamera.updateCubeMap(renderer, scene);
    // scene.getObjectByName('testBox').visible = true;

    renderer.setRenderTarget( rtTexture );
    renderer.clear();
    renderer.render( scene2, floorView );
    renderer.setRenderTarget( null );
    renderer.clear();

    // renderer.setRenderTarget( texttempTexture );
    // renderer.clear();
    // renderer.render( scene3, camera );
    // renderer.setRenderTarget( null );
    // renderer.clear();    

    // scene.getObjectByName('testBox').visible = false;

    cubeCamera.update( renderer, scene );
    // testBoxMat.envMap = cubeRenderTarget1.texture;

    // scene.getObjectByName('testBox').visible = true;

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