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
			"scripts": ["firstPersonScript"],
		}
	},
	{
		"type": "perspectiveCamera",
		"name": "camera2",
		"eye": [3, 8, -4],
		"center": [1, 1, 0],
		"vup": [0, 1, 0],
		"fov": 30
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
]
}


