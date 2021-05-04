import * as THREE from 'three';
import { UniformsUtils } from '../node_modules/three/src/renderers/shaders/UniformsUtils.js'
import { UniformsLib } from '../node_modules/three/src/renderers/shaders/UniformsLib.js'

export default {

  uniforms: UniformsUtils.merge([
    UniformsLib.lights,
    UniformsLib.fog,
    UniformsLib.shadowmap,
    {
        u_mouse: { value: { x: window.innerWidth / 2, y: window.innerHeight / 2 } },
        u_resolution: { value: { x: window.innerWidth, y: window.innerHeight } },
        u_time: { value: 0.0 },
        u_color: { value: new THREE.Color(0xFF0000) },
        positions: { type: "t", value: null },
        pointSize: { type: "f", value: 1 },
        color1: { type: 'c', value: ( new THREE.Color( 0x2095cc) ) },
        color2: { type: 'c', value: ( new THREE.Color( 0x20cc31) ) }
    }
  ]),

  vertexShader: `
    #include <common>
    #include <fog_pars_vertex>
    #include <shadowmap_pars_vertex>

    varying vec2 v_uv;

    attribute float displacement;
    varying float pos;
    
    void main() {
        pos = displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
       
        #include <begin_vertex>
        #include <project_vertex>
        #include <worldpos_vertex>
        #include <shadowmap_vertex>
        #include <fog_vertex>
    }
  `,

  fragmentShader: `
    #include <common>
    #include <packing>
    #include <fog_pars_fragment>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>
    #include <dithering_pars_fragment>

    varying vec2 v_uv;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform vec3 u_color;
    uniform float u_time;

    uniform vec3 color1;
    uniform vec3 color2;
    varying float pos;

    void main() {
        // CHANGE THAT TO YOUR NEEDS
        // ------------------------------
        // vec3 finalColor = vec3(0, 0.75, 0);
        // vec3 shadowColor = vec3(0, 0, 0);
        // float shadowPower = 0.5;
        // ------------------------------
        
        // it just mixes the shadow color with the frag color
        // gl_FragColor = vec4( mix(finalColor, shadowColor, (1.0 - getShadowMask() ) * shadowPower), 1.0);
        
        vec3 color1 = vec3(134.0/255.0, 37.0/255.0, 25.0/255.0);
        vec3 color2 = vec3(174.0/255.0, 95.0/255.0, 57.0/255.0);

        vec3 outgoingLight = mix(color1, color2, smoothstep(0.9, 0.1, pos));

        float shadowMask = max(getShadowMask(), 0.75);
        outgoingLight *= shadowMask;

        gl_FragColor = vec4(outgoingLight, 1.0);

        #include <fog_fragment>
        #include <dithering_fragment>
    }
  `
};