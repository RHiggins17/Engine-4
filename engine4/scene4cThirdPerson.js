var level0 = { 
"COMMENT": "A spot light and bouncing globe",
"type": "node",
"name": "rootNode",

"children":
[
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 2, 9],
		"center": [0, 1, 0],
		"vup": [0, 1, 0],
		"fov": 30,
		"userData": 
		{ 
			"scripts": [],
		}
	},
	{
		"type": "hemisphereLight",
		"name": "hlight",
		"skyColor": [0.7, 0.7, 1.0],
		"groundColor": [0.2, 0.0, 0.1],
		"intensity": 0.6
	},
	{
		"type": "node",
		"name": "spotTarget",
		"translate": [0,0,0]
	},
	{
		"type": "spotLight",
		"name": "slight", 
		"position": [-1.5,30,1],
		"target": "spotTarget",
		"color": [1.5, 1.3, 0.9],
		"intensity": 1.0,
		"angle": 0.7,
		"penumbra": 0.1,
		"decay": 1.0,
		"distance": 100,
		"castShadow": true,
		"mapSize": 1024
	},

	// obj file
	{
		"type": "objFile",
		"name": "osuBot",
		"scale": [1, 1, 1],
		"translate": [0, 0.1, 4],
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
	},

	{
		"type": "mesh",
		"name": "theCube",
		"scale": [50, 0.07, 50],
		"translate": [0, 0, 0],
		"geometry": "cube",
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "cubeMat",
			"diffuseColor": [0.5, 0.4, 0.4],
			"specularColor": [0.01, 0.01, 0.01],
			"bumpMap": "earth2k.jpg",
			"bumpScale": 0.25,
			"shininess": 200
		}
	},

	{
		"type": "mesh",
		"name": "globe",
		"scale": [1.2, 1.2, 1.2],
		"translate": [0, 1.3, 0],
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
			"scripts": ["rotateScript", "bounceScript"],
			"rotationSpeed": 0.5,
			"bounceBottom": 1.22,
			"bounceHeight": 0.5
		}
	},

	{
		"type": "mesh",
		"name": "sphere1",
		"scale": [0.5, 0.5, 0.5],
		"translate": [-2.5, 0.6, 0],
		"geometry": "sphere",
		"widthSegments": 16,
		"heightSegments": 8,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [1.0, 0.2, 0.2],
			"specularColor": [0.04, 0.04, 0.04],
			"shininess": 100
		}
	},

	{
		"type": "mesh",
		"name": "sphere2",
		"scale": [0.5, 0.5, 0.5],
		"translate": [2.5, 0.6, 0],
		"geometry": "sphere",
		"widthSegments": 16,
		"heightSegments": 8,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [0.2, 0.2, 1.0],
			"specularColor": [0.04, 0.04, 0.04],
			"shininess": 100
		}
	},

	{
		"type": "mesh",
		"name": "sphere3",
		"scale": [0.5, 0.5, 0.5],
		"translate": [0.0, 0.6, 2.5],
		"geometry": "sphere",
		"widthSegments": 16,
		"heightSegments": 8,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [0.2, 1.0, 0.2],
			"specularColor": [0.04, 0.04, 0.04],
			"shininess": 100
		}
	},

	{
		"type": "mesh",
		"name": "sphere3",
		"scale": [0.5, 0.5, 0.5],
		"translate": [0.0, 0.6, -2.5],
		"geometry": "sphere",
		"widthSegments": 16,
		"heightSegments": 8,
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [0.7, 0.7, 0.1],
			"specularColor": [0.04, 0.04, 0.04],
			"shininess": 100
		}
	}

]
}


