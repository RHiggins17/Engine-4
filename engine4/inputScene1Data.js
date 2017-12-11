var objects = { 

"type": "node",
"name": "rootNode",

"children":
[
	// CAMERA
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 2, 9],
		"center": [0, 0, 0],
		"vup": [0, 1, 0],
		"fov": 60
	},
	{
		"type": "perspectiveCamera",
		"name": "camera2",
		"eye": [3, 8, -4],
		"center": [1, 1, 0],
		"vup": [0, 1, 0],
		"fov": 30,
		"zoom": 5
	},
	// LIGHTS
	{
		"type": "directionalLight",
		"name": "dlight1",
		"color": [1, 1, 0.5],
		"position": [1, 2, 1]
	},
	{
		"type": "directionalLight",
		"name": "dlight2",
		"color": [0.1, 0.1, 0.3],
		"position": [-1, 0.1, 0.5]
	},
	{
		"type": "hemisphereLight",
		"name": "hlight",
		"skyColor": [0.3, 0.3, 0.6],
		"groundColor": [0.2, 0.3, 0],
		"intensity": 1.0
	},
	
	{
		"type": "mesh",
		"name": "globe1",
		"scale": [1.2, 1.2, 1.2],
		"translate": [0, 3.0, 0],
		"geometry": "sphere",
		"widthSegments": 20,
		"heightSegments": 10,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [1, 1, 1],
			"specularColor": [0.04, 0.04, 0.04],
			"diffuseMap": "earth2k.jpg",
			"bumpMap": "earth2k.jpg",
			"bumpScale": 0.01,
			"shininess": 200
		},
		"userData": 
		{ 
			"scripts": ["rotateScript", "uniformsScript"],
			"rotationSpeed": 0.5
		},
		
	},
	
	{
		"type": "mesh",
		"name": "globe2",
		"scale": [1.2, 1.2, 1.2],
		"translate": [0, -3,0, 0],
		"geometry": "sphere",
		"widthSegments": 20,
		"heightSegments": 10,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [1, 1, 1],
			"specularColor": [0.04, 0.04, 0.04],
			"diffuseMap": "earth2k.jpg",
			"bumpMap": "earth2k.jpg",
			"bumpScale": 0.01,
			"shininess": 200
		},
		"userData": 
		{ 
			"scripts": ["rotateScript"],
			"rotationSpeed": 0.5
		},
		
	},
	
	{
		"type": "node",
		"name": "particleSystem",
		"userData": 
		{ 
			"scripts": ["particleScript"],
		},
		"children":
		[
			// sprite
			{
				"type": "sprite",
				"name": "s",
				"scale": [0.1, 0.1, 0.1],
				"translate": [0, 1, 0],
				"material":
				{
					"type": "spriteMaterial",
					"name": "smat1",
					"color": [1.0, 0.0, 0.0],
					"map": "dot.png",
				},
				"userData":
				{
					"vx": 0.0,
					"vy": 0.0,
					"vz": 0.0,
					"life": 100,
				}
			},
		]
	},
	
	
	// obj file
	{
		"type": "objFile",
		"name": "osuBot",
		"scale": [1.2, 1.2, 1.2],
		"translate": [0, -1.0, 0],
		"url": "osubot.obj",
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [1, 1, 1],
			"specularColor": [0.01, 0.01, 0.01],
			"diffuseMap": "osubotAObake.png",
			"bumpMap": "osubotAObake.png",
			"bumpScale": 0.002,
			"shininess": 100
		},
		"userData": 
		{ 
			"scripts": ["moveGuyScript", "thirdPersonScript"]
		}
	}
]
}