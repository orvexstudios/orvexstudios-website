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

    -48,

    3,

    -50

)

scene.add(

    planet

)
const atmosphereGeometry = new THREE.SphereGeometry(

    28.34,

    96,

    96

)

const atmosphereMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.NormalBlending,
    vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
            vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
            float rim = 1.0 - abs(dot(normalize(vWorldNormal), viewDirection));
            float softEdge = pow(clamp(rim, 0.0, 1.0), 2.4);

            float haze = sin(vWorldPosition.x * 0.72 + vWorldPosition.y * 0.46);
            haze *= sin(vWorldPosition.z * 0.63 - vWorldPosition.y * 0.31);
            haze = haze * 0.5 + 0.5;

            vec3 colour = mix(
                vec3(0.018, 0.022, 0.029),
                vec3(0.075, 0.085, 0.098),
                softEdge * 0.55
            );
            float alpha = 0.055 + softEdge * 0.035 + haze * 0.012;

            gl_FragColor = vec4(colour, alpha);
        }
    `
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
