//Correct shadows, specular, bump map (engine 3) and add music.


//----------------------------------------------------------------------//
// CS 4143 GAME ENGINE BASE
// Author: David Cline 
//----------------------------------------------------------------------//

/*
Description:
	Game Engine Base.
	For use by students in CS 4143 at Oklahoma State University, Fall 2017.
	Provides basic code for loading scenes, loading assets, a game loop, 
	input, and scripting.

Scenes:
	Scene files are typically written in JSON.  The exact format of the
	scenes is specified by the parser. These set up an initial static
	configuration of a game level.

Cross-Origin File Requests
	When testing locally, some of the browsers block 
	"Cross origin" requests that come though the "File" protocol.
	If this is blocked, requests that happen after the page loads will
	not work. For the following browsers, use the following:

	Firefox 
		should allow these requests by default
	Safari 
		has a "Develop" option to disable cross-origin restrictions
	Chrome
		use SimpleHTTPServer to serve files using the http protocol
		instead.  In fact, all of the browswers could be tested
		this way. See description below:

		Python provides a simple http server that can be used to test files
		on the local machine (since the file server will likely not work.
		From the directory that you want to be the root of localhost, 
		run python with the command:
			python -m SimpleHTTPServer
		It should respond with
			Serving HTTP on 0.0.0.0 port 8000 ...
		At this point, in your browser, you should be able to access files
		using the URL
			http://localhost:8000/
*/

//----------------------------------------------------------------------//
// GLOBALS
//----------------------------------------------------------------------//

//--------------- SOME CONSTANTS

var constants = {
	// AXIS CONSTANTS
	XAXIS: new THREE.Vector3(1,0,0),
	YAXIS: new THREE.Vector3(0,1,0),
	ZAXIS: new THREE.Vector3(0,0,1)
}

//--------------- GAME ENGINE SPECIFIC VARIABLES

var engine = {
	DEBUG: false, 		// Whether to run in debug mode
	debugText: "",
	startTime: 0, 		// When the scene was loaded (in seconds)

	rendererContainer: undefined,   // A div element that will hold the renderer
	canvas: undefined,				// The game canvas
	loadingManager: undefined,		// loading manager for loading assets
	renderers: {},

	mouseX: 0,			// Current position of mouse
	mouseY: 0,			
	mousePrevX: 0,		// Previous position of mouse
	mousePrevY: 0, 
	mouseDown: 0,       // Which mouse button currently down   
	mouseScroll: 0,	    // How much the mouse wheel has scrolled  
	mousePrevScroll: 0, 

	pressedKeys: {},    // Which keys are currently depressed

	touchX: 0,          // The latest touch position 
	touchY: 0,			// (Multitouch not supported)
	touchPrevX: 0,
	touchPrevY: 0,

	accelX: 0,      // accelerometer data including gravity
	accelY: 0,
	accelZ: 0,

	compassHeading: 0   // compass heading (0 = north)
};

//--------------- THE CURRENT GAME STATE

var gameState = {
	scene: undefined,     
	camera: undefined,
	renderer: undefined
};

//----------------------------------------------------------------------//
// PERFORM GENERAL INITIALIZATION. CREATE THE RENDERER AND LOADING
// MANAGER, AND START LISTENING TO GUI EVENTS.
//----------------------------------------------------------------------//

var initEngineFullScreen = function()
{
	debug("initEngineFullScreen()\n");

	// Create a div element and the canvas
	var container = document.createElement("div");
	var canvas = document.createElement("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	engine.fullScreen = true;
	document.body.appendChild(container);
	container.appendChild(canvas);

	initEngine(canvas);
}

//----------------------------------------------------------------------//

var initEngine = function(canvas) 
{
	debug("initEngine\n");

	// prevent scrolling
	document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only

	engine.startTime = (new Date()).getTime() * 0.001; // reset start time
	engine.canvas = canvas;

	// Make the loading manager for Three.js.
	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function (item, loaded, total) { };

	// Create renderer and add it to the container (div element)
	var renderer = new THREE.WebGLRenderer( {antialias:true, canvas:canvas} );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setPixelRatio(window.devicePixelRatio);
	
	//if(gameState.renderer["defaultRenderer"])
	//{
	//	var renderer = new THREE.WebGLRenderer( {antialias:true, canvas:canvas} );
	//	renderer.setPixelRatio(window.devicePixelRatio);
	//}
	//if(gameState.renderer["filmPassRenderer"])
	//{
	//	var renderer = new THREE.WebGLRenderer( {antialias:true, canvas:canvas} );
	//	renderer.setPixelRatio(window.devicePixelRatio);
	//}
	
	renderer.setSize(canvas.width, canvas.height );
	gameState.renderer = renderer;
	engine.renderers["defaultRenderer"] = renderer;
	engine.renderers["filmPassRenderer"] = renderer;
	engine.renderers["shaderRenderer"] = renderer;

	// Add event listeners so we can respond to events
	window.addEventListener( 'resize', gOnWindowResize );
	//
	document.addEventListener( "click", gOnClick );
	document.addEventListener( "mouseup", gOnMouseUp );
	document.addEventListener( "mousedown", gOnMouseDown );
	document.addEventListener( "mousemove", gOnMouseMove );
	document.addEventListener( "mousewheel", gOnMouseWheel );
	document.addEventListener( "DOMMouseScroll", gOnMouseWheel ); // firefox
	//
    window.addEventListener( "keydown", gOnKeyDown );
    window.addEventListener( "keyup", gOnKeyUp );
    //
    // mobile events
    engine.touchDevice = ("ontouchstart" in document.documentElement)
    if (engine.touchDevice)
    {
        canvas.addEventListener( "touchstart", gOnTouchStart );
        canvas.addEventListener( "touchmove", gOnTouchMove );
        window.addEventListener( "devicemotion", gOnMotion );
        //
        var dor = "deviceorientation";
        if (window.chrome) dor = "deviceorientationabsolute";
        window.addEventListener( dor, gOnOrientation );
    }
}

//------------------------------------------------------------------//
// WINDOW RESIZE LISTENER
//------------------------------------------------------------------//

var gOnWindowResize = function(event) 
{
	debug("onWindowResize\n");

	if (engine.fullScreen)
	{
		engine.canvas.width = window.innerWidth;
		engine.canvas.height = window.innerHeight;
	}

	var width = engine.canvas.width;
	var height = engine.canvas.height;

	if (gameState.camera)
	{
		gameState.camera.aspect = width / height;
		gameState.camera.updateProjectionMatrix();
		gameState.renderer.setSize(width, height);
	}
}

//------------------------------------------------------------------//
// MOUSE LISTENERS
//------------------------------------------------------------------//

var gOnClick = function(event)
{
	debug("onClick\n");
	if (gameState.onClick) gameState.onClick(event);
}

var gOnMouseUp = function(event) 
{
	debug("onMouseUp\n");
	engine.mouseDown = 0;
	if (gameState.onMouseUp) gameState.onMouseUp(event);
}	

var gOnMouseDown = function(event) 
{
	debug("onMouseDown " + event.which + "\n");
	engine.mouseDown = event.which;
	if (gameState.onMouseDown) gameState.onMouseDown(event);
}	

var gOnMouseMove = function(event) 
{
	//debug("onMouseMove " + event.clientX + "," + event.clientY + "\n");
	
	// don't update previous position yet because asynchronous
	//mousePrevX = mouseX;  
	//mousePrevY = mouseY;

	var rect = engine.canvas.getBoundingClientRect();
	engine.mouseX = event.clientX - rect.left;
	engine.mouseY = event.clientY - rect.top;
	if (gameState.onMouseMove) gameState.onMouseMove(event);
}

var gOnMouseWheel = function(event)
{
	debug("onMouseWheel " + engine.mouseScroll + "\n");

	if (event.detail > 0 || event.detail < 0) {
		engine.mouseScroll += event.detail/120.0;
	}
	if (event.wheelDelta > 0 || event.wheelDelta < 0) {
		engine.mouseScroll += event.wheelDelta/120.0;
	}

	if (gameState.onMouseWheel) gameState.onMouseWheel(event);
}

//------------------------------------------------------------------//
// KEY LISTENERS
//------------------------------------------------------------------//

var gOnKeyDown = function(event) 
{
	var key = event.keyCode ? event.keyCode : event.which;
	engine.pressedKeys[key] = true;
	debug("onKeyDown " + key + "\n");

	if (gameState.onKeyDown) gameState.onKeyDown(event);
}

var gOnKeyUp = function(event)
{
	var key = event.keyCode ? event.keyCode : event.which;
	delete engine.pressedKeys[key];
	debug("onKeyUp " + key + "\n");

	if (gameState.onKeyUp) gameState.onKeyUp(event);
}

//------------------------------------------------------------------//
// TOUCH EVENTS
//------------------------------------------------------------------//

var gOnTouchStart = function(event)
{
	debug("onTouchStart\n");

	// handle a single touch event
    var rect = canvas.getBoundingClientRect();
    var touchObj = event.changedTouches[0]; // first event
    var touchX = touchObj.clientX - rect.left;
    var touchY = touchObj.clientY - rect.top;

    engine.touchX = touchX;
    engine.touchY = touchY;

    if (gameState.onTouchStart) gameState.onTouchStart(event);
	event.preventDefault();
}

var gOnTouchMove = function(event)
{
	debug("onTouchMove\n");

	// handle a single touch event
    var rect = canvas.getBoundingClientRect();
    var touchObj = event.changedTouches[0]; // first event
    var touchX = touchObj.clientX - rect.left;
    var touchY = touchObj.clientY - rect.top;

    engine.touchX = touchX;
    engine.touchY = touchY;

    if (gameState.onTouchMove) gameState.onTouchMove(event);
	event.preventDefault();
}

var gOnTouchEnd = function(event)
{
	debug("onTouchEnd\n");
	engine.touchX = undefined;
	engine.touchY = undefined;
	if (gameState.onTouchEnd) gameState.onTouchEnd(event);
	event.preventDefault();
}

//------------------------------------------------------------------//
// ORIENTATION (compass) AND ACCELERATION
//------------------------------------------------------------------//

var gOnOrientation = function(event)
{
	debug("onOrientation\n");
    var w = engine.canvas.width;
    var h = engine.canvas.height;

    var compassHeading = event.webkitCompassHeading;
    var alpha = event.alpha || 0;
    
    var angle = (-90-alpha) * Math.PI / 180.0;
    if (compassHeading) angle = (alpha-90) * Math.PI / 180.0;

    engine.angle = angle;
    if (gameState.onOrientation) gameState.onOrientation(event);

}

var gOnMotion = function(event)
{
	debug("onMotion\n");

	var dx = event.accelerationIncludingGravity.x || 0;
    var dy = event.accelerationIncludingGravity.y || 0;
    var dz = event.accelerationIncludingGravity.z || 0;
    
    // If not chrome, assume safari
    if (window.chrome === undefined) 
    {
    	dx = -dx;
    	dy = -dy;
    	dz = -dz;
    }

    engine.accelX = dx;
    engine.accelY = dy;
    engine.accelZ = dz;

    if (gameState.onMotion) gameState.onMotion(event);
}

//----------------------------------------------------------------------//
// PRINT A DEBUG MESSAGE
//----------------------------------------------------------------------//

var debug = function(message)
{
	console.log(message);
	if (engine.DEBUG)
	{
		var element = document.getElementById("debug");
		if (element === undefined) return;

		engine.debugText += message;
		var n = engine.debugText.length;
		if (n > 250) 
		{
			engine.debugText = engine.debugText.substring(n-250);
		}
		element.innerHTML = engine.debugText;
	}
}

//----------------------------------------------------------------------//
// GET THE ELAPSED TIME (SINCE THE PAGE LOADED) IN SECONDS
//----------------------------------------------------------------------//

var getElapsedTime = function()
{
	var d = new Date();
	var t = d.getTime() * 0.001 - engine.startTime;
	return t;
}

//----------------------------------------------------------------------//
// LOAD A SCENE (ASYNCHRONOUSLY)
// THE SCENE IS LOADED FROM THE SPECIFIED URL AS A STRING, AND THEN
// PARSED AS A JSON OBJECT.  AT THAT POINT parseScene IS CALLED ON
// IT, WHICH RECURSIVELY WALKS THE parseTree CREATING A Three.js scene.
//----------------------------------------------------------------------//

function loadScene(sceneURL)
{
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", sceneURL, true);
	httpRequest.send(null);
	httpRequest.onload = 
		function() {
			debug("loading " + sceneURL + " ...\n");
            var jsonParseTree = JSON.parse(httpRequest.responseText);
            debug("parsing\n");
            parseScene(jsonParseTree);
            debug("done.\n");
        }
}

//----------------------------------------------------------------------//
// ENTRY POINT TO RECURSIVE FUNCTION THAT TRAVERSES THE JSON PARSE
// TREE AND MAKES A SCENE. 
//----------------------------------------------------------------------//

function parseScene(jsonParseTree)
{
	debug("parseScene\n");

	var scene = new THREE.Scene();
	parseSceneNode(jsonParseTree, scene);
	gameState.scene = scene;
	//parseMusic();
}

//----------------------------------------------------------------------//
// THE MAIN RECURSIVE FUNCTION OF THE PARSER.  
// THE JOB OF parseSceneNode IS TO TRAVERSE THE JSON OBJECT jsonNode 
// AND POPULATE A CORRESPONDING Three.js SceneNode
//----------------------------------------------------------------------//

function parseSceneNode(jsonNode, sceneNode)
{
	debug("parseSceneNode " + jsonNode["name"] + ":" + jsonNode["type"] + "\n");
	if (jsonNode === undefined || sceneNode === undefined) return;

	// Handle the transform of the node (translation, rotation, etc.)
	parseTransform(jsonNode, sceneNode);

	// Load any script files (note that these are not scripts attached
	// to the current node, just files that contain code.)
	if ("scriptFiles" in jsonNode) {
		var scriptList = jsonNode["scriptFiles"];
		for (var i=0; i<scriptList.length; i++) {
			var scriptURL = scriptList[i];
			loadScript(scriptURL);
		}
	}

	// User data that will be placed in the node. Can be arbitrary.
	// Includes the names of any scripts attached to the node.
	if ("userData" in jsonNode) {
		sceneNode["userData"] = jsonNode["userData"];
	} else {
		sceneNode["userData"] = {};
	}

	// Load and play background music
	if ("backgroundMusic" in jsonNode) {
		var audio = new Audio(jsonNode["backgroundMusic"]);
		debug("playing " + jsonNode["backgroundMusic"] + "\n");
		audio.play();
	}

	// The name of the node (useful to look up later in a script)
	if ("name" in jsonNode) {
		sceneNode["name"] = jsonNode["name"];
	}

	// Whether the node starts out as visible.
	if ("visible" in jsonNode) {
		sceneNode.setVisible(jsonNode["visible"]);
	}

	// Traverse all the child nodes. The typical code pattern here is:
	//   1. call a special routine that creates the child based on its type.  
	//      This routine also deals with attributes specific to that node type. 
	//   2. Make a recursive call to parseSceneNode, which handles general
	//      properties that any node can include. 

	//Disable Firefox's cross domain web access or use python's http server
	if ("children" in jsonNode)
	{
		var children = jsonNode["children"];
		for (var i=0; i<children.length; i++)
		{
			var childJsonNode = children[i];
			var childType = childJsonNode["type"];
			
			if (childType == "node") { // empty object to hold a transform
				var childSceneNode = new THREE.Object3D();
				sceneNode.add(childSceneNode);
				parseSceneNode(childJsonNode, childSceneNode);
			}
			if (childType == "perspectiveCamera") {
				var camera = parsePerspectiveCamera(childJsonNode);
				sceneNode.add(camera);
				if (gameState.camera === undefined) gameState.camera = camera;
				parseSceneNode(childJsonNode, camera);
			}
			else if (childType == "directionalLight") {
				var light = parseDirectionalLight(childJsonNode);
				sceneNode.add(light);
				parseSceneNode(childJsonNode, light);
			}
			else if (childType == "ambientLight") {
				var light = parseAmbientLight(childJsonNode);
				sceneNode.add(light);
				parseSceneNode(childJsonNode, light);
			}
			else if (childType == "pointLight") {
				var light = parsePointLight(childJsonNode);
				sceneNode.add(light);
				parseSceneNode(childJsonNode, light);
			}
			else if (childType == "hemisphereLight") {
				var light = parseHemisphereLight(childJsonNode);
				sceneNode.add(light);
				parseSceneNode(childJsonNode, light);
			}
			else if (childType == "spotLight") {
				var light = parseSpotLight(childJsonNode);
				sceneNode.add(light);
				light.target = sceneNode.getObjectByName( "spotTarget" );
				sceneNode.add(light.target);
				//light.shadow = new THREE.LightShadow(sceneNode.getObjectByName( "camera1" ));
				parseSceneNode(childJsonNode, light);
			}
			else if (childType == "mesh") {
				var mesh = parseMesh(childJsonNode);
				sceneNode.add(mesh);
				parseSceneNode(childJsonNode, mesh);
			}
			else if(childType == "text")
			{
				parseText(childJsonNode, sceneNode);
				//sceneNode.add(txt);

			}
			else if(childType == "sprite")
			{
				var sprite = parseSprite(childJsonNode);
				sceneNode.add(sprite);
				parseSceneNode(childJsonNode, sprite);
			}
			else if(childType == "objFile")
			{
				parseObject(childJsonNode, sceneNode);
				//sceneNode.add(obj);
				//parseSceneNode(childJsonNode, obj);
			}
			else if(childType == "positionalAudio")
			{
				parsePositionalAudio(childJsonNode, sceneNode);
				parseSceneNode(childJsonNode, music);
			}
			else if(childType == "globalAudio")
			{
				parseGlobalAudio(childJsonNode, sceneNode);
				parseSceneNode(childJsonNode, music);
			}
			else if(childType == "music")
			{
				parseGlobalAudio(childJsonNode, sceneNode);
				parseSceneNode(childJsonNode, music);
			}
		}
	}	
}

//----------------------------------------------------------------------//
// PARSE A TRANSFORM
//----------------------------------------------------------------------//

function parseTransform(jsonNode, sceneNode)
{
	//debug("parseTransform\n");

	if ("translate" in jsonNode) {
		var translate = jsonNode["translate"];
		sceneNode.position.x += translate[0];
		sceneNode.position.y += translate[1];
		sceneNode.position.z += translate[2];
	}
	if ("scale" in jsonNode) {
		var scale = jsonNode["scale"];
		sceneNode.scale.x *= scale[0];
		sceneNode.scale.y *= scale[1];
		sceneNode.scale.z *= scale[2];
	}
	if ("rotate" in jsonNode) {
		var rotate = jsonNode["rotate"];
		var axis = new THREE.Vector3(rotate[0], rotate[1], rotate[2]);
		var radians = rotate[3];
		sceneNode.rotateOnAxis(axis, radians);
	}
}

//----------------------------------------------------------------------//
// PARSE A PERSPECTIVE CAMERA
//----------------------------------------------------------------------//

function parsePerspectiveCamera(jsonNode)
{
	//debug("parsePerspectiveCamera\n");

	// Start with default values
	var near = 0.2;
	var far = 10000.0;
	var aspect = engine.canvas.width / engine.canvas.height;
	var fovy = 60.0;
	var eye = [0.0, 0.0, 100.0];
	var vup = [0.0, 1.0, 0.0];
	var center = [0.0, 0.0, 0.0];
	var zoom = 1;

	// Replace with data from jsonNode
	if ("near"   in jsonNode) near   = jsonNode["near"];
	if ("far"    in jsonNode) far    = jsonNode["far"];
	if ("fov"    in jsonNode) fovy   = jsonNode["fov"];
	if ("eye"    in jsonNode) eye    = jsonNode["eye"];
	if ("vup"    in jsonNode) vup    = jsonNode["vup"];
	if ("center" in jsonNode) center = jsonNode["center"];
	if ("zoom" in jsonNode) zoom = jsonNode["zoom"];

	// Create and return the camera
	var camera = new THREE.PerspectiveCamera( fovy, aspect, near, far );
	camera.position.set( eye[0], eye[1], eye[2] );
	camera.up.set( vup[0], vup[1], vup[2] );
	camera.lookAt( new THREE.Vector3(center[0], center[1], center[2]) );
	camera.zoom = zoom;
	
	// if global audio set
	// add audio to camera
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	var sound = new THREE.Audio( listener );

	var audioLoader = new THREE.AudioLoader();

	//Load a sound and set it as the Audio object's buffer
	audioLoader.load( "memories.mp3", function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.5 );
		sound.play();
	});
	
	return camera;
}

//----------------------------------------------------------------------//
// PARSE A LIGHT- Directional, Ambient, Point, Hemisphere, and Spot
//----------------------------------------------------------------------//

function parseDirectionalLight(jsonNode)
{
	//debug("parseDirectionalLight\n");

	// Start with default values
	var color = [1.0, 1.0, 1.0];
	var position = [1.0, 1.0, 1.0];
	var intensity = 1;
	var castShadow = false;
	var target;
	var mapSize = 1024;
	var map;
	var bias = 0;
	var radius;

	// Replace with data from jsonNode
	if ("color"    in jsonNode) color    = jsonNode["color"];
	if ("position" in jsonNode) position = jsonNode["position"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];
	if ("castShadow" in jsonNode) castShadow = jsonNode["castShadow"];
	if ("target" in jsonNode) target = jsonNode["target"];
	if ("mapSize" in jsonNode) mapSize = jsonNode["mapSize"];
	if ("map" in jsonNode) map = jsonNode["map"];
	if ("bias" in jsonNode) bias = jsonNode["bias"];
	if ("radius" in jsonNode) radius = jsonNode["radius"];

	// Create the light and return it
	var c = new THREE.Color(color[0], color[1], color[2]);	
	var light = new THREE.DirectionalLight(c, intensity);
	light.position.set( position[0], position[1], position[2] );
	
	light.castShadow = castShadow;
	light.shadow.mapSize.width = mapSize;
	light.shadow.mapSize.height = mapSize;
	light.map = map;
	light.bias = bias;
	light.radius = radius;
	
	return light;
}

function parseAmbientLight(jsonNode)
{
	//debug("parseDirectionalLight\n");

	// Start with default values
	var color = [1.0, 1.0, 1.0];
	var position = [1.0, 1.0, 1.0];
	var intensity = 1;
	var castShadow = false;

	// Replace with data from jsonNode
	if ("color"    in jsonNode) color    = jsonNode["color"];
	if ("position" in jsonNode) position = jsonNode["position"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];
	if ("castShadow" in jsonNode) castShadow = jsonNode["castShadow"];
	
	// Create the light and return it
	var c = new THREE.Color(color[0], color[1], color[2]);	
	var light = new THREE.AmbientLight(c, intensity);
	light.position.set( position[0], position[1], position[2] );
	light.castShadow = castShadow;
	return light;
}

function parsePointLight(jsonNode)
{
	//debug("parseDirectionalLight\n");

	// Start with default values
	var color = [1.0, 1.0, 1.0];
	var position = [1.0, 1.0, 1.0];
	var intensity = 1;
	var decay = 1;
	var distance = 0;
	var power = 4*Math.PI;
	var castShadow = false;
	var map;
	var mapSize = 512;
	var bias = 0;
	var radius;

	// Replace with data from jsonNode
	if ("color"    in jsonNode) color    = jsonNode["color"];
	if ("position" in jsonNode) position = jsonNode["position"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];
	if ("power" in jsonNode) power = jsonNode["power"];
	if ("decay" in jsonNode) decay = jsonNode["decay"];
	if ("distance" in jsonNode) distance = jsonNode["distance"];
	if ("castShadow" in jsonNode) castShadow = jsonNode["castShadow"];
	if ("map" in jsonNode) map = jsonNode["map"];
	if ("mapSize" in jsonNode) mapSize = jsonNode["mapSize"];
	if ("bias" in jsonNode) bias = jsonNode["bias"];
	if ("radius" in jsonNode) radius = jsonNode["radius"];

	// Create the light and return it
	var c = new THREE.Color(color[0], color[1], color[2]);	
	var light = new THREE.PointLight(c, intensity, distance, decay);
	light.position.set( position[0], position[1], position[2] );
	
	light.castShadow = castShadow;
	light.shadow.mapSize.width = mapSize;
	light.shadow.mapSize.height = mapSize;
	light.map = map;
	light.bias = bias;
	light.radius = radius;
	
	return light;
}

function parseHemisphereLight(jsonNode)
{
	//debug("parseDirectionalLight\n");

	// Start with default values
	var skyColor = [1.0, 1.0, 1.0];
	var color = [1.0, 1.0, 1.0];
	var groundColor = [0, 0, 0];
	var intensity = 1;
	var position = [1.0, 1.0, 1.0];
	var castShadow = undefined;
	

	// Replace with data from jsonNode
	if ("skyColor"    in jsonNode) skyColor = jsonNode["skyColor"];
	if ("color"    in jsonNode) color = jsonNode["color"];
	if ("groundColor"    in jsonNode) groundColor = jsonNode["groundColor"];
	if ("intensity"    in jsonNode) intensity = jsonNode["intensity"];
	if ("position" in jsonNode) position = jsonNode["position"];
	
	if(color != [1.0, 1.0, 1.0])
	{
		skyColor = color;
	}
	
	// Create the light and return it
	var skyC = new THREE.Color(skyColor[0], skyColor[1], skyColor[2]);	
	var groundC = new THREE.Color(groundColor[0], groundColor[1], groundColor[2]);	
	var light = new THREE.HemisphereLight(skyC, groundC, intensity);
	light.position.set( position[0], position[1], position[2] );
	light.castShadow = castShadow;
	
	return light;
}

function parseSpotLight(jsonNode)
{
	//debug("parseDirectionalLight\n");

	// Start with default values
	var color = [1.0, 1.0, 1.0];
	var position = [1.0, 1.0, 1.0];
	var intensity = 1;
	var angle = Math.PI/3;
	var penumbra = 0;
	var decay = 1;
	var distance = 0;
	var castShadow = false;
	var mapSize = 1024;
	var target;
	var map;
	var bias = 0;
	var radius;

	// Replace with data from jsonNode
	if ("color"    in jsonNode) color    = jsonNode["color"];
	if ("position" in jsonNode) position = jsonNode["position"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];
	if ("angle" in jsonNode) angle= jsonNode["angle"];
	if ("penumbra" in jsonNode) penumbra = jsonNode["penumbra"];
	if ("decay" in jsonNode) decay = jsonNode["decay"];
	if ("distance" in jsonNode) distance = jsonNode["distance"];
	if ("castShadow" in jsonNode) castShadow = jsonNode["castShadow"];
	if ("mapSize" in jsonNode) mapSize = jsonNode["mapSize"];
	if ("target" in jsonNode) target = jsonNode["target"];
	if ("map" in jsonNode) map = jsonNode["map"];
	if ("bias" in jsonNode) bias = jsonNode["bias"];
	if ("radius" in jsonNode) radius = jsonNode["radius"];

	// Create the light and return it
	var c = new THREE.Color(color[0], color[1], color[2]);	
	var light = new THREE.SpotLight(c, intensity, distance, angle, penumbra, decay);
	light.position.set( position[0], position[1], position[2] );
	light.castShadow = castShadow;
	
	light.shadow.mapSize.width = mapSize;
	light.shadow.mapSize.height = mapSize;
	light.map = map;
	light.bias = bias;
	light.radius = radius;
    //
	//light.shadow.camera.near = 500;
	//light.shadow.camera.far = 4000;
	//light.shadow.camera.fov = 30;
	
	return light;
}

//----------------------------------------------------------------------//
// PARSE TEXT, OBJECTS, SPRITES, MESHES OR MUSIC
//----------------------------------------------------------------------//

function parseText(jsonNode, sceneNode)
{
	//debug("parseMesh\n");

	// Get the material
	var material = parseMaterial(jsonNode["material"]);
	
	// populate variables
	//var font;
	var loader = new THREE.FontLoader();
	var fontName = jsonNode["font"] || "helvetiker_regular";
	var fontURL = "../threejs/examples/fonts/" + fontName + ".typeface.json";
	var text = jsonNode["text"];
	
	// load the font
	loader.load(fontURL,
			    function (font) {
					console.log("Here?");
					// get variables
					var size = jsonNode["size"] || 1.0;
					var height = jsonNode["height"] || size*0.1;
					var curveSegments = jsonNode["curveSegments"] || 6;
					var bevelThickness = jsonNode["bevelThickness"]  || size * 0.01;
					var bevelSize = jsonNode["bevelSize"] || size * 0.01;
					var bevelEnabled = jsonNode["bevelEnabled"];
					var bevelSegments = jsonNode["bevelSegments"] || 4;
					if (bevelEnabled === undefined) bevelEnabled = true;
					// create geometry
					geometry = new THREE.TextBufferGeometry(text, 
							{
								font: font,
								size: size,
								height: height,
								curveSegments: curveSegments,
								bevelThickness: bevelThickness,
								bevelSize: bevelSize,
								bevelEnabled: bevelEnabled,
								bevelSegments: bevelSegments
							}
						);
					console.log("Past.");

					geometry.computeBoundingBox();
                    
					// centering
					var min = geometry.boundingBox.min;
					var max = geometry.boundingBox.max;
					geometry.translate(
						-(min.x+max.x)*0.5,
						-(min.y+max.y)*0.5,
						-(min.z+max.z)*0.5
					);
					geometry.computeBoundingBox();

					var object;
															
					// Create a point cloud or mesh
					if (material instanceof THREE.PointsMaterial) {
						object = new THREE.Points(geometry, material);
						object.sortParticles = true;
					}
					else {
						object = new THREE.Mesh( geometry, material );
						object.castShadow = true;
						object.receiveShadow = true;
					}
					
					// add to scene
					sceneNode.add(object);
					parseSceneNode(jsonNode, object);
				});
	
}

function parseObject(jsonNode, sceneNode)
{
	//Gets the material and url of the model
	var material = parseMaterial(jsonNode["material"]);
    var modelURL = jsonNode["url"];

    //Traverses and loads the mesh, then adds it to model.
    var onLoad = function(mesh) {
        mesh.traverse(onTraverse);
        sceneNode.add(mesh);
        parseSceneNode(jsonNode, mesh);
    }
	//Adds material to model.
    var onTraverse = function (child) {
        if (child instanceof THREE.Mesh) {
            child.material = material;
        }
    };
	//Fails 
    var onProgress = function (x) {
        // nothing
    };
	//Error message
    var onError = function (x) { 
        debug("Error! could not load " + modelURL);
    };

    //Loads the completed model.
    var loader = new THREE.OBJLoader(loadingManager);
    loader.load(modelURL, onLoad, onProgress, onError);
}

function parseSprite(jsonNode)
{
	// Get the material and create a new three.js sprite
	var material = parseMaterial(jsonNode["material"]);
	var sprite = new THREE.Sprite(material);
	return sprite;
}


function parseMesh(jsonNode)
{
	//debug("parseMesh\n");

	// Get the material
	var material = parseMaterial(jsonNode["material"]);
	
	// Create the mesh geometry
	var geometryType = jsonNode["geometry"];
	var geometry;

	if (geometryType == "cube") {
		var width = 2;
		var height = 2;
		var depth = 2;
		if ("width"  in jsonNode) width  = jsonNode["width"];
		if ("height" in jsonNode) height = jsonNode["height"];
		if ("depth"  in jsonNode) depth  = jsonNode["depth"]; 
		geometry = new THREE.BoxGeometry(width, height, depth);
	}
	else if (geometryType == "sphere") {
		var radius = 1;
		var widthSegments = 8;
		var heightSegments = 6;
		if ("radius"         in jsonNode) radius         = jsonNode["radius"];       
		if ("widthSegments"  in jsonNode) widthSegments  = jsonNode["widthSegments"];
		if ("heightSegments" in jsonNode) heightSegments = jsonNode["heightSegments"];
		geometry = new THREE.SphereGeometry(radius, heightSegments, widthSegments);
	}
	else if (geometryType == "cylinder") {
		var radiusTop = 1;
		var radiusBottom = 1;
		var height = 1;
		var radiusSegments = 8;
		var heightSegments = 1;
		if ("radiusTop"      in jsonNode) radiusTop      = jsonNode["radiusTop"];  
		if ("radiusBottom"   in jsonNode) radiusBottom   = jsonNode["radiusBottom"];   
		if ("height" in jsonNode) height = jsonNode["height"];
		if ("radiusSegments" in jsonNode) radiusSegments = jsonNode["radiusSegments"];
		if ("heightSegments" in jsonNode) heightSegments = jsonNode["heightSegments"];
		geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments);
	}
	else if (geometryType == "torus") {
		var radius = 8;
		var tube = 2;
		var radialSegments = 8;
		var tubularSegments = 6;
		if ("radius"          in jsonNode) radius          = jsonNode["radius"];  
		if ("tube"            in jsonNode) tube            = jsonNode["tube"];   		
		if ("radialSegments"  in jsonNode) radialSegments  = jsonNode["radialSegments"];
		if ("tubularSegments" in jsonNode) tubularSegments = jsonNode["tubularSegments"];
		geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
	}
	else if (geometryType == "plane") {
		var width = 2;
		var height = 2;
		var widthSegments = 1;
		var heightSegments = 1;
		if ("width"          in jsonNode) width          = jsonNode["width"];  
		if ("height"         in jsonNode) height         = jsonNode["height"];   		
		if ("widthSegments"  in jsonNode) widthSegments  = jsonNode["widthSegments"];
		if ("heightSegments" in jsonNode) heightSegments = jsonNode["heightSegments"];
		geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
	}
	else if (geometryType == "cone") {
		var radius = 1;
		var height = 1;
		var radiusSegments = 8;
		var heightSegments = 1;
		if ("radius"         in jsonNode) radius         = jsonNode["radius"];   
		if ("height"         in jsonNode) height         = jsonNode["height"];
		if ("radiusSegments" in jsonNode) radiusSegments = jsonNode["radiusSegments"];
		if ("heightSegments" in jsonNode) heightSegments = jsonNode["heightSegments"];
		geometry = new THREE.ConeGeometry(radius, height, radiusSegments, heightSegments);
	}
	
	// Create the mesh and return it
	var mesh = new THREE.Mesh( geometry, material );
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}

function parseGlobalAudio(jsonNode, camera)
{
	// variables
	var song;
	var loop;
	var volume;
	
	// populate variables
	if ("song" in jsonNode) song = jsonNode["song"];
	if ("loop" in jsonNode) loop = jsonNode["loop"];
	if ("volume" in jsonNode) volume = jsonNode["volume"];
	
	// add audio to camera
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	var sound = new THREE.Audio( listener );

	var audioLoader = new THREE.AudioLoader();

	//Load a sound and set it as the Audio object's buffer
	audioLoader.load( song, function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( loop );
		sound.setVolume( volume );
		sound.play();
	});
	
	return camera;
	
	//Positional:
	// AUDIO STUFF
    //var camera = gameState.camera;
    //var globe = gameState.scene.getObjectByName("globe", true);
    //
    //var listener = new THREE.AudioListener();
    //camera.add( listener );
    //
    ////Create the PositionalAudio object (passing in the listener)
    //var sound = new THREE.PositionalAudio( listener );
    //
    ////Load a sound and set it as the PositionalAudio object's buffer
    //var audioLoader = new THREE.AudioLoader();
    //audioLoader.load( 'sounds/ambient.ogg', function( buffer ) {
    //    sound.setBuffer( buffer );
    //    sound.setRefDistance( 4 );   // distance at which full volume
    //    sound.setRolloffFactor( 2 ); // falloff rate
    //    sound.setMaxDistance(1000);
    //    sound.play();
    //});
    //
    //globe.add( sound );
}

function parsePosiionaAudio(jsonNode, camera)
{
	//Positional:
	// AUDIO STUFF
    var camera = gameState.camera;
    var globe = gameState.scene.getObjectByName("globe", true);
    
    var listener = new THREE.AudioListener();
    camera.add( listener );
    
    //Create the PositionalAudio object (passing in the listener)
    var sound = new THREE.PositionalAudio( listener );
    
    //Load a sound and set it as the PositionalAudio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'sounds/ambient.ogg', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setRefDistance( 4 );   // distance at which full volume
        sound.setRolloffFactor( 2 ); // falloff rate
        sound.setMaxDistance(1000);
        sound.play();
    });
    
    globe.add( sound );
}

//----------------------------------------------------------------------//
// PARSE A MATERIAL - Lambert, Basic, and Phong
//----------------------------------------------------------------------//

function parseMaterial(jsonNode)
{
	//debug("parseMaterial\n");
	if (jsonNode === undefined) return new MeshLambertMaterial();
	var type = jsonNode["type"];

	// Lambertian material
	if (type == "meshLambertMaterial")
	{
		var material = new THREE.MeshLambertMaterial();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("diffuseColor" in jsonNode) {
			var d = jsonNode["diffuseColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("specularColor" in jsonNode) {
			var d = jsonNode["specularColor"];
			material.specular = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("emissiveColor" in jsonNode) {
			var d = jsonNode["emissiveColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("map" in jsonNode) {
			var tex = parseTexture( jsonNode["map"] );
			material.map = tex;
		}
		if ("diffuseMap" in jsonNode) {
			var tex = parseTexture( jsonNode["diffuseMap"] );
			material.map = tex;
		}
		if ("emissiveMap" in jsonNode) {
			var tex = parseTexture( jsonNode["emissiveMap"] );
			material.emissiveMap = tex;
		}
		if ("envMap" in jsonNode) {
			var tex = parseTexture( jsonNode["envMap"] );
			material.envMap = tex;
		}
		if ("alphaMap" in jsonNode) {
			var tex = parseTexture( jsonNode["alphaMap"] );
			material.alphaMap = tex;
		}
		if ("aoMap" in jsonNode) {
			var tex = parseTexture( jsonNode["aoMap"] );
			material.aoMap = tex;
		}
		if ("lightMap" in jsonNode) {
			var tex = parseTexture( jsonNode["lightMap"] );
			material.lightMap = tex;
		}
		if ("emissiveIntensity" in jsonNode) {
			material.emissiveIntensity = jsonNode["emissiveIntensity"];
		}
		if ("aoMapIntensity" in jsonNode) {
			material.aoMapIntensity = jsonNode["aoMapIntensity"];
		}
		if ("lightMapIntensity" in jsonNode) {
			material.lightMapIntensity = jsonNode["lightMapIntensity"];
		}
		if ("reflectivity" in jsonNode) {
			material.reflectivity = jsonNode["reflectivity"];
		}
		if ("skinning" in jsonNode) {
			material.skinning = jsonNode["skinning"];
		}
		if ("wireframe" in jsonNode) {
			material.wireframe = jsonNode["wireframe"];
		}
		if ("wireframeLinecap" in jsonNode) {
			material.wireframeLinecap = jsonNode["wireframeLinecap"];
		}
		if ("wireframeLinejoin" in jsonNode) {
			material.wireframeLinejoin = jsonNode["wireframeLinejoin"];
		}
		if ("wireframeLinewidth" in jsonNode) {
			material.wireframeLinewidth = jsonNode["wireframeLinewidth"];
		}
		if ("morphNormals" in jsonNode) {
			material.morphNormals = jsonNode["morphNormals"];
		}
		if ("morphTargets" in jsonNode) {
			material.morphTargets = jsonNode["morphTargets"];
		}
		//if ("refractionRatio" in jsonNode) {
		//	var s = jsonNode["refractionRatio"];
		//	material.skinning = s;
		//}
		//if ("combine" in jsonNode) {
		//	var intensity = jsonNode["lightMapIntensity"];
		//	material.intensity = intensity;
		//}
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}

	// Basic (unlit) material
	if (type == "meshBasic")
	{
		var material = new THREE.MeshBasic();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("diffuseColor" in jsonNode) {
			var d = jsonNode["diffuseColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("map" in jsonNode) {
			var tex = parseTexture( jsonNode["map"] );
			material.map = tex;
		}
		if ("diffuseMap" in jsonNode) {
			var tex = parseTexture( jsonNode["diffuseMap"] );
			material.map = tex;
		}
		if ("envMap" in jsonNode) {
			var tex = parseTexture( jsonNode["envMap"] );
			material.envMap = tex;
		}
		if ("alphaMap" in jsonNode) {
			var tex = parseTexture( jsonNode["alphaMap"] );
			material.alphaMap = tex;
		}
		if ("aoMap" in jsonNode) {
			var tex = parseTexture( jsonNode["aoMap"] );
			material.aoMap = tex;
		}
		if ("lightMap" in jsonNode) {
			var tex = parseTexture( jsonNode["lightMap"] );
			material.lightMap = tex;
		}
		if ("aoMapIntensity" in jsonNode) {
			material.aoMapIntensity = jsonNode["aoMapIntensity"];
		}
		if ("lightMapIntensity" in jsonNode) {
			material.lightMapIntensity = jsonNode["lightMapIntensity"];
		}
		if ("reflectivity" in jsonNode) {
			material.reflectivity = jsonNode["reflectivity"];
		}
		if ("skinning" in jsonNode) {
			material.skinning = jsonNode["skinning"];
		}
		if ("wireframe" in jsonNode) {
			material.wireframe = jsonNode["wireframe"];
		}
		if ("wireframeLinecap" in jsonNode) {
			material.wireframeLinecap = jsonNode["wireframeLinecap"];
		}
		if ("wireframeLinejoin" in jsonNode) {
			material.wireframeLinejoin = jsonNode["wireframeLinejoin"];
		}
		if ("wireframeLinewidth" in jsonNode) {
			material.wireframeLinewidth = jsonNode["wireframeLinewidth"];
		}
		if ("morphNormals" in jsonNode) {
			material.morphNormals = jsonNode["morphNormals"];
		}
		if ("morphTargets" in jsonNode) {
			material.morphTargets = jsonNode["morphTargets"];
		}
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}
	
	// Basic (unlit) material
	if (type == "meshBasicMaterial")
	{
		var material = new THREE.MeshBasicMaterial();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("diffuseColor" in jsonNode) {
			var d = jsonNode["diffuseColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("map" in jsonNode) {
			var tex = parseTexture( jsonNode["map"] );
			material.map = tex;
		}
		if ("diffuseMap" in jsonNode) {
			var tex = parseTexture( jsonNode["diffuseMap"] );
			material.map = tex;
		}
		if ("envMap" in jsonNode) {
			var tex = parseTexture( jsonNode["envMap"] );
			material.envMap = tex;
		}
		if ("alphaMap" in jsonNode) {
			var tex = parseTexture( jsonNode["alphaMap"] );
			material.alphaMap = tex;
		}
		if ("aoMap" in jsonNode) {
			var tex = parseTexture( jsonNode["aoMap"] );
			material.aoMap = tex;
		}
		if ("lightMap" in jsonNode) {
			var tex = parseTexture( jsonNode["lightMap"] );
			material.lightMap = tex;
		}
		if ("reflectivity" in jsonNode) {
			material.reflectivity = jsonNode["reflectivity"];
		}
		if ("skinning" in jsonNode) {
			material.skinning = jsonNode["skinning"];
		}
		if ("wireframe" in jsonNode) {
			material.wireframe = jsonNode["wireframe"];
		}
		if ("wireframeLinecap" in jsonNode) {
			material.wireframeLinecap = jsonNode["wireframeLinecap"];
		}
		if ("wireframeLinejoin" in jsonNode) {
			material.wireframeLinejoin = jsonNode["wireframeLinejoin"];
		}
		if ("wireframeLinewidth" in jsonNode) {
			material.wireframeLinewidth = jsonNode["wireframeLinewidth"];
		}
		if ("morphNormals" in jsonNode) {
			material.morphNormals = jsonNode["morphNormals"];
		}
		if ("morphTargets" in jsonNode) {
			material.morphTargets = jsonNode["morphTargets"];
		}
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}
	
	// Normal material maps RGB to normal vectors
	if (type == "meshNormalMaterial")
	{
		var material = new THREE.MeshNormalMaterial();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("map" in jsonNode) {
			var tex = parseTexture( jsonNode["map"] );
			material.map = tex;
		}
		if ("wireframe" in jsonNode) {
			material.wireframe = jsonNode["wireframe"];
		}
		if ("wireframeLinewidth" in jsonNode) {
			material.wireframeLinewidth = jsonNode["wireframeLinewidth"];
		}
		if ("morphTargets" in jsonNode) {
			material.morphTargets = jsonNode["morphTargets"];
		}
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}
	
	//Standard looks better than Phong or Lambert, but is more expensive.
	if (type == "meshStandardMaterial")
	{
		var material = new THREE.MeshStandardMaterial();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("diffuseColor" in jsonNode) {
			var d = jsonNode["diffuseColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("specularColor" in jsonNode) {
			var d = jsonNode["specularColor"];
			material.specular = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("emissiveColor" in jsonNode) {
			var d = jsonNode["emissiveColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("shininess" in jsonNode) {
			var d = jsonNode["shininess"];
			material.shininess = d;
		}
		if ("map" in jsonNode) {
			var tex = parseTexture( jsonNode["map"] );
			material.map = tex;
		}
		if ("diffuseMap" in jsonNode) {
			var tex = parseTexture( jsonNode["diffuseMap"] );
			material.map = tex;
		}
		if ("emissiveMap" in jsonNode) {
			var tex = parseTexture( jsonNode["emissiveMap"] );
			material.emissiveMap = tex;
		}
		if ("envMap" in jsonNode) {
			var tex = parseTexture( jsonNode["envMap"] );
			material.envMap = tex;
		}
		if ("alphaMap" in jsonNode) {
			var tex = parseTexture( jsonNode["alphaMap"] );
			material.alphaMap = tex;
		}
		if ("aoMap" in jsonNode) {
			var tex = parseTexture( jsonNode["aoMap"] );
			material.aoMap = tex;
		}
		if ("lightMap" in jsonNode) {
			var tex = parseTexture( jsonNode["lightMap"] );
			material.lightMap = tex;
		}
		if ("specularMap" in jsonNode) {
			var tex = parseTexture( jsonNode["specularMap"] );
			material.specularMap = tex;
		}
		if ("displacementMap" in jsonNode) {
			var tex = parseTexture( jsonNode["displacementMap"] );
			material.displacementMap = tex;
		}
		if ("bumpMap" in jsonNode) {
			var tex = parseTexture( jsonNode["bumpMap"] );
			material.bumpMap = tex;
		}
		if ("normalMap" in jsonNode) {
			var tex = parseTexture( jsonNode["normalMap"] );
			material.normalMap = tex;
		}
		if ("metalnessMap" in jsonNode) {
			var tex = parseTexture( jsonNode["metalnessMap"] );
			material.metalnessMap = tex;
		}
		if ("roughnessMap" in jsonNode) {
			var tex = parseTexture( jsonNode["roughnessMap"] );
			material.roughnessMap = tex;
		}
		if ("bumpScale" in jsonNode) {
			var d = jsonNode["bumpScale"];
			material.bumpScale = d;
		}
		if ("displacementScale" in jsonNode) {
			var d = jsonNode["displacementScale"];
			material.displacementScale = d;
		}
		if ("normalScale" in jsonNode) {
			var d = jsonNode["normalScale"];
			material.normalScale = d;
		}
		if ("displacementBias" in jsonNode) {
			var d = jsonNode["displacementBias"];
			material.displacementBias = d;
		}
		if ("emissiveIntensity" in jsonNode) {
			material.emissiveIntensity = jsonNode["emissiveIntensity"];
		}
		if ("aoMapIntensity" in jsonNode) {
			material.aoMapIntensity = jsonNode["aoMapIntensity"];
		}
		if ("lightMapIntensity" in jsonNode) {
			material.lightMapIntensity = jsonNode["lightMapIntensity"];
		}
		if ("envMapIntensity" in jsonNode) {
			material.envMapIntensity = jsonNode["envMapIntensity"];
		}
		if ("reflectivity" in jsonNode) {
			material.reflectivity = jsonNode["reflectivity"];
		}
		if ("skinning" in jsonNode) {
			material.skinning = jsonNode["skinning"];
		}
		if ("wireframe" in jsonNode) {
			material.wireframe = jsonNode["wireframe"];
		}
		if ("wireframeLinecap" in jsonNode) {
			material.wireframeLinecap = jsonNode["wireframeLinecap"];
		}
		if ("wireframeLinejoin" in jsonNode) {
			material.wireframeLinejoin = jsonNode["wireframeLinejoin"];
		}
		if ("wireframeLinewidth" in jsonNode) {
			material.wireframeLinewidth = jsonNode["wireframeLinewidth"];
		}
		if ("morphNormals" in jsonNode) {
			material.morphNormals = jsonNode["morphNormals"];
		}
		if ("morphTargets" in jsonNode) {
			material.morphTargets = jsonNode["morphTargets"];
		}
		if ("metal" in jsonNode) {
			material.metal = jsonNode["metal"];
		}
		if ("metalness" in jsonNode) {
			material.metalness = jsonNode["metalness"];
		}
		if ("roughness" in jsonNode) {
			material.roughness = jsonNode["roughness"];
		}
		if ("defines" in jsonNode) {
			material.defines = jsonNode["defines"];
		}
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}
	//Shiny material with specular highlights
	if (type == "meshPhongMaterial")
	{
		var material = new THREE.MeshPhongMaterial();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("diffuseColor" in jsonNode) {
			var d = jsonNode["diffuseColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("specularColor" in jsonNode) {
			var d = jsonNode["specularColor"];
			material.specular = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("emissiveColor" in jsonNode) {
			var d = jsonNode["emissiveColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("shininess" in jsonNode) {
			var d = jsonNode["shininess"];
			material.shininess = d;
		}
		if ("map" in jsonNode) {
			var tex = parseTexture( jsonNode["map"] );
			material.map = tex;
		}
		if ("diffuseMap" in jsonNode) {
			var tex = parseTexture( jsonNode["diffuseMap"] );
			material.map = tex;
		}
		if ("emissiveMap" in jsonNode) {
			var tex = parseTexture( jsonNode["emissiveMap"] );
			material.emissiveMap = tex;
		}
		if ("envMap" in jsonNode) {
			var tex = parseTexture( jsonNode["envMap"] );
			material.envMap = tex;
		}
		if ("alphaMap" in jsonNode) {
			var tex = parseTexture( jsonNode["alphaMap"] );
			material.alphaMap = tex;
		}
		if ("aoMap" in jsonNode) {
			var tex = parseTexture( jsonNode["aoMap"] );
			material.aoMap = tex;
		}
		if ("lightMap" in jsonNode) {
			var tex = parseTexture( jsonNode["lightMap"] );
			material.lightMap = tex;
		}
		if ("specularMap" in jsonNode) {
			var tex = parseTexture( jsonNode["specularMap"] );
			material.specularMap = tex;
		}
		if ("displacementMap" in jsonNode) {
			var tex = parseTexture( jsonNode["displacementMap"] );
			material.displacementMap = tex;
		}
		if ("bumpMap" in jsonNode) {
			var tex = parseTexture( jsonNode["bumpMap"] );
			material.bumpMap = tex;
		}
		if ("normalMap" in jsonNode) {
			var tex = parseTexture( jsonNode["normalMap"] );
			material.normalMap = tex;
		}
		if ("bumpScale" in jsonNode) {
			var d = jsonNode["bumpScale"];
			material.bumpScale = d;
		}
		if ("displacementScale" in jsonNode) {
			var d = jsonNode["displacementScale"];
			material.displacementScale = d;
		}
		if ("normalScale" in jsonNode) {
			var d = jsonNode["normalScale"];
			material.normalScale = d;
		}
		if ("displacementBias" in jsonNode) {
			var d = jsonNode["displacementBias"];
			material.displacementBias = d;
		}
		if ("emissiveIntensity" in jsonNode) {
			material.emissiveIntensity = jsonNode["emissiveIntensity"];
		}
		if ("aoMapIntensity" in jsonNode) {
			material.aoMapIntensity = jsonNode["aoMapIntensity"];
		}
		if ("lightMapIntensity" in jsonNode) {
			material.lightMapIntensity = jsonNode["lightMapIntensity"];
		}
		if ("reflectivity" in jsonNode) {
			material.reflectivity = jsonNode["reflectivity"];
		}
		if ("skinning" in jsonNode) {
			material.skinning = jsonNode["skinning"];
		}
		if ("wireframe" in jsonNode) {
			material.wireframe = jsonNode["wireframe"];
		}
		if ("wireframeLinecap" in jsonNode) {
			material.wireframeLinecap = jsonNode["wireframeLinecap"];
		}
		if ("wireframeLinejoin" in jsonNode) {
			material.wireframeLinejoin = jsonNode["wireframeLinejoin"];
		}
		if ("wireframeLinewidth" in jsonNode) {
			material.wireframeLinewidth = jsonNode["wireframeLinewidth"];
		}
		if ("morphNormals" in jsonNode) {
			material.morphNormals = jsonNode["morphNormals"];
		}
		if ("morphTargets" in jsonNode) {
			material.morphTargets = jsonNode["morphTargets"];
		}
		if ("metal" in jsonNode) {
			material.metal = jsonNode["metal"];
		}
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}
	//Variant of meshPhong that creates a cartoon-style material
	if (type == "meshToonMaterial")
	{
		var material = new THREE.MeshToonMaterial();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("diffuseColor" in jsonNode) {
			var d = jsonNode["diffuseColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("specularColor" in jsonNode) {
			var d = jsonNode["specularColor"];
			material.specular = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("emissiveColor" in jsonNode) {
			var d = jsonNode["emissiveColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("shininess" in jsonNode) {
			var d = jsonNode["shininess"];
			material.shininess = d;
		}
		if ("map" in jsonNode) {
			var tex = parseTexture( jsonNode["map"] );
			material.map = tex;
		}
		if ("diffuseMap" in jsonNode) {
			var tex = parseTexture( jsonNode["diffuseMap"] );
			material.map = tex;
		}
		if ("emissiveMap" in jsonNode) {
			var tex = parseTexture( jsonNode["emissiveMap"] );
			material.emissiveMap = tex;
		}
		if ("envMap" in jsonNode) {
			var tex = parseTexture( jsonNode["envMap"] );
			material.envMap = tex;
		}
		if ("alphaMap" in jsonNode) {
			var tex = parseTexture( jsonNode["alphaMap"] );
			material.alphaMap = tex;
		}
		if ("aoMap" in jsonNode) {
			var tex = parseTexture( jsonNode["aoMap"] );
			material.aoMap = tex;
		}
		if ("lightMap" in jsonNode) {
			var tex = parseTexture( jsonNode["lightMap"] );
			material.lightMap = tex;
		}
		if ("specularMap" in jsonNode) {
			var tex = parseTexture( jsonNode["specularMap"] );
			material.specularMap = tex;
		}
		if ("displacementMap" in jsonNode) {
			var tex = parseTexture( jsonNode["displacementMap"] );
			material.displacementMap = tex;
		}
		if ("bumpMap" in jsonNode) {
			var tex = parseTexture( jsonNode["bumpMap"] );
			material.bumpMap = tex;
		}
		if ("normalMap" in jsonNode) {
			var tex = parseTexture( jsonNode["normalMap"] );
			material.normalMap = tex;
		}
		if ("metalnessMap" in jsonNode) {
			var tex = parseTexture( jsonNode["metalnessMap"] );
			material.metalnessMap = tex;
		}
		if ("roughnessMap" in jsonNode) {
			var tex = parseTexture( jsonNode["roughnessMap"] );
			material.roughnessMap = tex;
		}
		if ("gradientMap" in jsonNode) {
			var tex = parseTexture( jsonNode["gradientMap"] );
			material.gradientMap = tex;
		}
		if ("bumpScale" in jsonNode) {
			var d = jsonNode["bumpScale"];
			material.bumpScale = d;
		}
		if ("displacementScale" in jsonNode) {
			var d = jsonNode["displacementScale"];
			material.displacementScale = d;
		}
		if ("normalScale" in jsonNode) {
			var d = jsonNode["normalScale"];
			material.normalScale = d;
		}
		if ("displacementBias" in jsonNode) {
			var d = jsonNode["displacementBias"];
			material.displacementBias = d;
		}
		if ("emissiveIntensity" in jsonNode) {
			material.emissiveIntensity = jsonNode["emissiveIntensity"];
		}
		if ("aoMapIntensity" in jsonNode) {
			material.aoMapIntensity = jsonNode["aoMapIntensity"];
		}
		if ("lightMapIntensity" in jsonNode) {
			material.lightMapIntensity = jsonNode["lightMapIntensity"];
		}
		if ("envMapIntensity" in jsonNode) {
			material.envMapIntensity = jsonNode["envMapIntensity"];
		}
		if ("reflectivity" in jsonNode) {
			material.reflectivity = jsonNode["reflectivity"];
		}
		if ("skinning" in jsonNode) {
			material.skinning = jsonNode["skinning"];
		}
		if ("wireframe" in jsonNode) {
			material.wireframe = jsonNode["wireframe"];
		}
		if ("wireframeLinecap" in jsonNode) {
			material.wireframeLinecap = jsonNode["wireframeLinecap"];
		}
		if ("wireframeLinejoin" in jsonNode) {
			material.wireframeLinejoin = jsonNode["wireframeLinejoin"];
		}
		if ("wireframeLinewidth" in jsonNode) {
			material.wireframeLinewidth = jsonNode["wireframeLinewidth"];
		}
		if ("morphNormals" in jsonNode) {
			material.morphNormals = jsonNode["morphNormals"];
		}
		if ("morphTargets" in jsonNode) {
			material.morphTargets = jsonNode["morphTargets"];
		}
		if ("metal" in jsonNode) {
			material.metal = jsonNode["metal"];
		}
		if ("metalness" in jsonNode) {
			material.metalness = jsonNode["metalness"];
		}
		if ("roughness" in jsonNode) {
			material.roughness = jsonNode["roughness"];
		}
		if ("defines" in jsonNode) {
			material.defines = jsonNode["defines"];
		}
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}
	
	//Draws wireframe geometry
	if (type == "LineBasicMaterial")
	{
		var material = new THREE.LineBasicMaterial();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("linewidth" in jsonNode) {
			material.linewidth = jsonNode["linewidth"];
		}
		if ("linecap" in jsonNode) {
			material.linecap = jsonNode["linecap"];
		}
		if ("linejoin" in jsonNode) {
			material.linejoin = jsonNode["linejoin"];
		}
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}
	//Draws dashed-line wireframe geometry
	if (type == "LineBasicMaterial")
	{
		var material = new THREE.LineBasicMaterial();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("linewidth" in jsonNode) {
			material.linewidth = jsonNode["linewidth"];
		}
		if ("dashSize" in jsonNode) {
			material.dashSize = jsonNode["dashSize"];
		}
		if ("gapSize" in jsonNode) {
			material.gapSize = jsonNode["gapSize"];
		}
		if ("scale" in jsonNode) {
			material.scale = jsonNode["scale"];
		}
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}
	//Allows sprites to be rendered
	if (type == "spriteMaterial")
	{
		var material = new THREE.SpriteMaterial();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("diffuseColor" in jsonNode) {
			var d = jsonNode["diffuseColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("map" in jsonNode) {
			var tex = parseTexture( jsonNode["map"] );
			material.map = tex;
		}
		if ("diffuseMap" in jsonNode) {
			var tex = parseTexture( jsonNode["diffuseMap"] );
			material.map = tex;
		}
		
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}
	//Renders point clouds/maps for particle effects
	if (type == "pointsMaterial")
	{
		var material = new THREE.PointsMaterial();
		if ("size" in jsonNode) {
			var d = jsonNode["size"];
			material.size = d;
		}
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("map" in jsonNode) {
			var tex = parseTexture( jsonNode["map"] );
			material.map = tex;
		}
		if ("transparent" in jsonNode) {
			var d = jsonNode["transparent"];
			material.transparent = d;
		}
		if ("sizeAttenuation" in jsonNode) {
			var d = jsonNode["sizeAttenuation"];
			material.sizeAttenuation = d;
		}
		
		if ("opacity" in jsonNode) {
			var o = jsonNode["opacity"];
			material.opacity = o;
		}
		if ("visible" in jsonNode) {
			var v = jsonNode["visible"];
			material.visible = v;
		}
		if ("flatShading" in jsonNode) {
			var f = jsonNode["flatShading"];
			material.flatShading = f;
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			var f = jsonNode["fog"];
			material.fog = f;
		}
		if ("wraparound" in jsonNode) {
			var w = jsonNode["wraparound"];
			material.wraparound = w;
		}
		if ("alphaTest" in jsonNode) {
			var a = jsonNode["alphaTest"];
			material.alphaTest = a;
		}
		if ("depthWrite" in jsonNode) {
			var d = jsonNode["depthWrite"];
			material.depthWrite = d;
		}
		if ("lights" in jsonNode) {
			var l = jsonNode["lights"];
			material.lights = l;
		}
		
		return material;
	}
	
	//Material that allows a custom shader to be created.
	if (type == "ShaderMaterial")
	{
		var material = new THREE.ShaderMaterial();
		if ("color" in jsonNode) {
			var d = jsonNode["color"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("diffuseColor" in jsonNode) {
			var d = jsonNode["diffuseColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("specularColor" in jsonNode) {
			var d = jsonNode["specularColor"];
			material.specular = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("emissiveColor" in jsonNode) {
			var d = jsonNode["emissiveColor"];
			material.color = new THREE.Color(d[0], d[1], d[2]);
		}
		if ("shininess" in jsonNode) {
			var d = jsonNode["shininess"];
			material.shininess = d;
		}
		if ("map" in jsonNode) {
			var tex = parseTexture( jsonNode["map"] );
			material.map = tex;
		}
		if ("diffuseMap" in jsonNode) {
			var tex = parseTexture( jsonNode["diffuseMap"] );
			material.map = tex;
		}
		if ("emissiveMap" in jsonNode) {
			var tex = parseTexture( jsonNode["emissiveMap"] );
			material.emissiveMap = tex;
		}
		if ("envMap" in jsonNode) {
			var tex = parseTexture( jsonNode["envMap"] );
			material.envMap = tex;
		}
		if ("alphaMap" in jsonNode) {
			var tex = parseTexture( jsonNode["alphaMap"] );
			material.alphaMap = tex;
		}
		if ("aoMap" in jsonNode) {
			var tex = parseTexture( jsonNode["aoMap"] );
			material.aoMap = tex;
		}
		if ("lightMap" in jsonNode) {
			var tex = parseTexture( jsonNode["lightMap"] );
			material.lightMap = tex;
		}
		if ("specularMap" in jsonNode) {
			var tex = parseTexture( jsonNode["specularMap"] );
			material.specularMap = tex;
		}
		if ("displacementMap" in jsonNode) {
			var tex = parseTexture( jsonNode["displacementMap"] );
			material.displacementMap = tex;
		}
		if ("bumpMap" in jsonNode) {
			var tex = parseTexture( jsonNode["bumpMap"] );
			material.bumpMap = tex;
		}
		if ("normalMap" in jsonNode) {
			var tex = parseTexture( jsonNode["normalMap"] );
			material.normalMap = tex;
		}
		if ("metalnessMap" in jsonNode) {
			var tex = parseTexture( jsonNode["metalnessMap"] );
			material.metalnessMap = tex;
		}
		if ("roughnessMap" in jsonNode) {
			var tex = parseTexture( jsonNode["roughnessMap"] );
			material.roughnessMap = tex;
		}
		if ("gradientMap" in jsonNode) {
			var tex = parseTexture( jsonNode["gradientMap"] );
			material.gradientMap = tex;
		}
		if ("bumpScale" in jsonNode) {
			var d = jsonNode["bumpScale"];
			material.bumpScale = d;
		}
		if ("displacementScale" in jsonNode) {
			var d = jsonNode["displacementScale"];
			material.displacementScale = d;
		}
		if ("normalScale" in jsonNode) {
			var d = jsonNode["normalScale"];
			material.normalScale = d;
		}
		if ("displacementBias" in jsonNode) {
			var d = jsonNode["displacementBias"];
			material.displacementBias = d;
		}
		if ("emissiveIntensity" in jsonNode) {
			material.emissiveIntensity = jsonNode["emissiveIntensity"];
		}
		if ("aoMapIntensity" in jsonNode) {
			material.aoMapIntensity = jsonNode["aoMapIntensity"];
		}
		if ("lightMapIntensity" in jsonNode) {
			material.lightMapIntensity = jsonNode["lightMapIntensity"];
		}
		if ("envMapIntensity" in jsonNode) {
			material.envMapIntensity = jsonNode["envMapIntensity"];
		}
		if ("reflectivity" in jsonNode) {
			material.reflectivity = jsonNode["reflectivity"];
		}
		if ("skinning" in jsonNode) {
			material.skinning = jsonNode["skinning"];
		}
		if ("wireframe" in jsonNode) {
			material.wireframe = jsonNode["wireframe"];
		}
		if ("wireframeLinecap" in jsonNode) {
			material.wireframeLinecap = jsonNode["wireframeLinecap"];
		}
		if ("wireframeLinejoin" in jsonNode) {
			material.wireframeLinejoin = jsonNode["wireframeLinejoin"];
		}
		if ("wireframeLinewidth" in jsonNode) {
			material.wireframeLinewidth = jsonNode["wireframeLinewidth"];
		}
		if ("morphNormals" in jsonNode) {
			material.morphNormals = jsonNode["morphNormals"];
		}
		if ("morphTargets" in jsonNode) {
			material.morphTargets = jsonNode["morphTargets"];
		}
		if ("metal" in jsonNode) {
			material.metal = jsonNode["metal"];
		}
		if ("metalness" in jsonNode) {
			material.metalness = jsonNode["metalness"];
		}
		if ("roughness" in jsonNode) {
			material.roughness = jsonNode["roughness"];
		}
		if ("clipping" in jsonNode) {
			material.clipping = jsonNode["clipping"];
		}
		if ("defaultAttributeValues" in jsonNode) {
			material.defaultAttributeValues = jsonNode["defaultAttributeValues"];
		}
		if ("defines" in jsonNode) {
			material.defines = jsonNode["defines"];
		}
		if ("extensions" in jsonNode) {
			//material.extensions = jsonNode["extensions"];
			material.derivatives = jsonNode["derivatives"];
			material.fragDepth = jsonNode["fragDepth"];
			material.drawBuffers = jsonNode["drawBuffers"];
			material.shaderTextureLOD = jsonNode["shaderTextureLOD"];
		}
		if ("fragmentShader" in jsonNode) {
			material.fragmentShader = jsonNode["fragmentShader"];
		}
		if ("index0AttributeName" in jsonNode) {
			material.index0AttributeName = jsonNode["index0AttributeName"];
		}
		if ("linewidth" in jsonNode) {
			material.linewidth = jsonNode["linewidth"];
		}
		if ("uniforms" in jsonNode) {
			//material.value = jsonNode["value"];
			material.uniforms = jsonNode["uniforms"];
		}
		if ("vertexColors" in jsonNode) {
			material.vertexColors = jsonNode["vertexColors"];
		}
		if ("vertexShader" in jsonNode) {
			material.vertexShader = jsonNode["vertexShader"];
		}
		//Common Material Properties
		if ("opacity" in jsonNode) {
			material.opacity = jsonNode["opacity"];
		}
		if ("transparent" in jsonNode) {
			material.transparent = jsonNode["transparent"];
		}
		if ("visible" in jsonNode) {
			material.visible = jsonNode["visible"];
		}
		if ("flatShading" in jsonNode) {
			material.flatShading = jsonNode["flatShading"];
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
			material.shading = s;
		}
		if ("fog" in jsonNode) {
			material.fog = jsonNode["fog"];
		}
		if ("wraparound" in jsonNode) {
			material.wraparound = jsonNode["wraparound"];
		}
		if ("alphaTest" in jsonNode) {
			material.alphaTest = jsonNode["alphaTest"];
		}
		if ("depthWrite" in jsonNode) {
			material.depthWrite = jsonNode["depthWrite"];
		}
		if ("lights" in jsonNode) {
			material.lights = jsonNode["lights"];
		}
		
		return material;
	}
	
	// Failed to make a material, so return a default
	//return new MeshLambertMaterial();
}

//----------------------------------------------------------------------//
// PARSE A TEXTURE MAP - ASYNCHRONOUSLY LOADS THE TEXTURE IMAGE
//----------------------------------------------------------------------//

function parseTexture(textureURL)
{
	debug("parseTexture: " + textureURL + "\n");

	var texture = new THREE.Texture;

	/*
	// textureURL is the id of an img element 
	if (document.getElementById(textureURL))
	{
		var imageElement = document.getElementById(textureURL);
		texture.image = imageElement;
		texture.needsUpdate = true;
		return texture;
	}
	*/

	// Otherwise, assume textureURL is an image name
	var loader = new THREE.ImageLoader(engine.loadingManager);
	loader.load( 
		textureURL, 
		function(image) { // callback function
			texture.image = image;
			texture.needsUpdate = true;
		} 
	);
	return texture;
}

//----------------------------------------------------------------------//
// ADD A SCRIPT TO THE RUNNING PAGE FROM AN EXTERNAL URL
//----------------------------------------------------------------------//

function loadScript(scriptURL)
{
	debug("loadScript " + scriptURL + "\n");
    
    // Create an element for the script
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = scriptURL;

    // Add the script element to the head of the page
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(script);
}

//----------------------------------------------------------------------//
// THE MAIN FUNCTION OF THE GAME (ANIMATION) LOOP
//----------------------------------------------------------------------//

function startGameLoop() 
{
	requestAnimationFrame(startGameLoop);	// schedules another call to animate
	animateFrame();					// updates the scene for the frame
	render();						// draws the scene
}

//----------------------------------------------------------------------//
// CONTROLS ANIMATING A SINGLE FRAME
//----------------------------------------------------------------------//

function animateFrame()
{
	// Update the current camera and scene
	if (gameState.camera !== undefined) gameState.camera.updateProjectionMatrix();
	if (gameState.scene  !== undefined) gameState.scene.traverse(runScripts);

	// Update previous mouse and touch states here because animateFrame 
	// out of sync with listeners 
	engine.mousePrevX = engine.mouseX;
	engine.mousePrevY = engine.mouseY;
	engine.mousePrevScroll =  engine.mouseScroll;
	//
	engine.touchPrevX = engine.touchX;
	engine.touchPrevY = engine.touchY;
}

//----------------------------------------------------------------------//
// CALLBACK TO RUN ALL THE SCRIPTS FOR A GIVEN sceneNode
//----------------------------------------------------------------------//

function runScripts(sceneNode)
{
	var scripts = sceneNode.userData.scripts;
	if (scripts === undefined) return;

	for (var i=0; i<scripts.length; i++) {
		var f = window[scripts[i]]; // look up function by name
		if (f !== undefined) f(sceneNode);
	}
}

//----------------------------------------------------------------------//
// RENDER CURRENT SCENE WITH CURRENT RENDERER USING CURRENT CAMERA
//----------------------------------------------------------------------//

function render() 
{
	var gs = gameState;
	if (gs.scene && gs.camera && gs.renderer) {
		gs.renderer.render(gs.scene, gs.camera);
	}
	else {
		var msg = "";
		if (!gs.scene) msg += "no scene. ";
		if (!gs.camera) msg += "no camera. ";
		if (!gs.renderer) msg += "no renderer."
		debug(msg + "\n");
	}
}

//----------------------------------------------------------------------//
