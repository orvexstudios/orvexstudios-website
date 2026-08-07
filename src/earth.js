import * as THREE from 'three'

import { scene } from './scene'

const EARTH_POSITION = new THREE.Vector3(34, -2, -82)
const EARTH_RADIUS = 12

const earthGroup = new THREE.Group()
earthGroup.position.copy(EARTH_POSITION)
earthGroup.rotation.z = -.16
earthGroup.visible = false
scene.add(earthGroup)

let earthSurface
let cloudLayer
let atmosphere
let keyLight
let loadPromise

const textureLoader = new THREE.TextureLoader()

function createAtmosphereMaterial() {
    return new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uOpacity: { value: 0 }
        },
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
            uniform float uOpacity;
            varying vec3 vWorldNormal;
            varying vec3 vWorldPosition;

            void main() {
                vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                float fresnel = 1.0 - abs(dot(normalize(vWorldNormal), viewDirection));
                float rim = pow(clamp(fresnel, 0.0, 1.0), 3.25);
                vec3 colour = mix(vec3(0.055, 0.20, 0.48), vec3(0.30, 0.72, 1.0), rim);
                gl_FragColor = vec4(colour, rim * 0.42 * uOpacity);
            }
        `
    })
}

export function loadEarth() {
    if (loadPromise) return loadPromise

    loadPromise = Promise.all([
        textureLoader.loadAsync('/earth/earth_atmos_2048.jpg'),
        textureLoader.loadAsync('/earth/earth_normal_2048.jpg'),
        textureLoader.loadAsync('/earth/earth_clouds_1024.png')
    ]).then(([dayMap, normalMap, cloudMap]) => {
        dayMap.colorSpace = THREE.SRGBColorSpace
        cloudMap.colorSpace = THREE.SRGBColorSpace

        dayMap.anisotropy = 4
        normalMap.anisotropy = 4
        cloudMap.anisotropy = 4

        earthSurface = new THREE.Mesh(
            new THREE.SphereGeometry(EARTH_RADIUS, 96, 64),
            new THREE.MeshPhysicalMaterial({
                map: dayMap,
                normalMap,
                normalScale: new THREE.Vector2(.62, .62),
                roughness: .66,
                metalness: 0,
                clearcoat: .08,
                clearcoatRoughness: .38,
                transparent: true,
                opacity: 0
            })
        )

        cloudLayer = new THREE.Mesh(
            new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 96, 64),
            new THREE.MeshStandardMaterial({
                map: cloudMap,
                alphaMap: cloudMap,
                transparent: true,
                opacity: 0,
                depthWrite: false,
                roughness: .92,
                metalness: 0
            })
        )

        atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(EARTH_RADIUS * 1.075, 80, 48),
            createAtmosphereMaterial()
        )

        earthGroup.add(earthSurface, cloudLayer, atmosphere)

        keyLight = new THREE.DirectionalLight(0xfff1d6, 0)
        keyLight.position.copy(EARTH_POSITION).add(new THREE.Vector3(-18, 11, 22))
        keyLight.target.position.copy(EARTH_POSITION)
        scene.add(keyLight, keyLight.target)

        return earthGroup
    }).catch((error) => {
        console.error('Unable to load the Earth cinematic.', error)
        throw error
    })

    return loadPromise
}

export function updateEarth(elapsed, reveal) {
    if (!earthSurface) return

    const visibility = THREE.MathUtils.smoothstep(reveal, 0, 1)
    earthGroup.visible = visibility > .004

    earthGroup.rotation.y = -1.42 + elapsed * .018
    cloudLayer.rotation.y = elapsed * .024
    cloudLayer.rotation.x = Math.sin(elapsed * .025) * .008

    earthSurface.material.opacity = visibility
    earthSurface.material.depthWrite = visibility > .92
    cloudLayer.material.opacity = visibility * .58
    atmosphere.material.uniforms.uOpacity.value = visibility
    keyLight.intensity = visibility * 3.8
}

export { EARTH_POSITION }
