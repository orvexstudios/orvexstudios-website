import * as THREE from 'three'

import { scene } from './scene'

const geometry = new THREE.SphereGeometry(

    28,

    128,

    128

)

const loader = new THREE.TextureLoader()

const planetTexture = loader.load('/planet_color.png')

const material = new THREE.MeshStandardMaterial({

    map: planetTexture,

    roughness: 0.92,

    metalness: 0.01

})

material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `#include <map_fragment>

        // Separate the existing orange lava from the neutral volcanic rock.
        float lavaChroma = diffuseColor.r - max(diffuseColor.g, diffuseColor.b);
        float lavaMask = smoothstep(0.045, 0.20, lavaChroma)
            * smoothstep(0.09, 0.42, diffuseColor.r)
            * (1.0 - smoothstep(0.30, 0.60, diffuseColor.b));

        vec3 darkRock = diffuseColor.rgb * 0.18;
        vec3 hotLava = diffuseColor.rgb * 1.08 + vec3(0.055, 0.006, 0.0);
        diffuseColor.rgb = mix(darkRock, hotLava, lavaMask);
        `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>

        // Emission remains strictly confined to the lava already in the texture.
        totalEmissiveRadiance += vec3(1.0, 0.13, 0.008) * lavaMask * 0.38;
        `
    )
}

material.customProgramCacheKey = () => 'orvex-dark-rock-bright-lava-v1'

export const planet = new THREE.Mesh(

    geometry,

    material

)

planet.position.set(

    -30,

    3,

    -50

)

scene.add(

    planet

)
const atmosphereGeometry = new THREE.SphereGeometry(

    8.2,

    128,

    128

)

const atmosphereMaterial = new THREE.MeshBasicMaterial({

    color:0xff8c3a,

    transparent:true,

    opacity:0.28,

    side:THREE.BackSide

})

export const atmosphere = new THREE.Mesh(

    atmosphereGeometry,

    atmosphereMaterial

)

atmosphere.position.copy(

    planet.position

)

scene.add(

    atmosphere

)
