/**

 	Simple additive blend - sum the rgb values of 2 input textures

 	tDiffuse: 	base texture
 	tAdd: 		texture to add
 	amount: 	amount to add 2nd texture

 	@author felixturner / http://airtight.cc/

 */

// THREE.AdditiveBlendShader = {
	AdditiveBlendShader = {

	uniforms: {

		'tDiffuse': { type: 't', value: null },
		'tAdd': { type: 't', value: null },
		'amount': { type: 'f', value: 1.0 }

	},

	vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

			'vUv = uv;',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'

	].join('\n'),

	fragmentShader: [


		'uniform sampler2D tDiffuse;',
		'uniform sampler2D tAdd;',
		'uniform float amount;',

		'varying vec2 vUv;',

		'void main() {',

			'vec4 texelBase = texture2D( tDiffuse, vUv );',
			'vec4 texelAdd = texture2D( tAdd, vUv );',
			'gl_FragColor = texelBase + texelAdd * amount;',

		'}'

	].join('\n')

};
