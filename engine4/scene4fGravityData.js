var level0 = { 
"COMMENT": "A spot light and bouncing globe",
"type": "node",
"name": "rootNode",

"children":
[
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [15, 5, 30],
		"center": [15, 5, 0],
		"vup": [0, 1, 0],
		"fov": 50,
	},
	{
		"type": "node",
		"name": "gravitySimulation",
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
				"scale": [0.2, 0.2, 0.2],
				"translate": [0, 0, 0],
				"material":
				{
					"type": "spriteMaterial",
					"name": "smat1",
					"color": [1.0, 1.0, 0.0],
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


