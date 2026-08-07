import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

import { scene } from './scene'
import { assetUrl } from './platform/assets'
import { getSettings } from './settings'

export const logo = new THREE.Group()

const energyShaders = []

function enhanceLogoMaterial(material, textures) {
    if (!material) return

    material.map = textures.baseColor
    material.normalMap = textures.normal
    material.roughnessMap = textures.metallicRoughness
    material.metalnessMap = textures.metallicRoughness

    // Preserve the original maps and colours. Only their surface response changes.
    material.metalness = Math.max(material.metalness ?? 0, .48)
    material.roughness = Math.min(material.roughness ?? 1, .46)
    material.dithering = true

    material.onBeforeCompile = (shader) => {
        shader.uniforms.uLogoTime = { value: 0 }

        shader.fragmentShader = `uniform float uLogoTime;\n${shader.fragmentShader}`

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>

            // Mask derived exclusively from orange/red pixels in the original texture.
            float orangeChroma = diffuseColor.r - max(diffuseColor.g, diffuseColor.b);
            float orangeMask = smoothstep(0.055, 0.22, orangeChroma)
                * (1.0 - smoothstep(0.28, 0.62, diffuseColor.b))
                * smoothstep(0.10, 0.34, diffuseColor.r);

            // Slow, compressed plasma filaments contained by the texture mask.
            vec2 plasmaUv = vMapUv;
            float slowFlow = uLogoTime * 0.055;
            float magneticWarp = sin(plasmaUv.y * 54.0 - slowFlow) * 1.8;
            magneticWarp += sin(plasmaUv.x * 31.0 + plasmaUv.y * 19.0 + slowFlow * 0.7) * 0.75;
            float filaments = 0.5 + 0.5 * sin(plasmaUv.x * 92.0 + magneticWarp + slowFlow);
            filaments = pow(filaments, 7.0);

            float cells = sin(plasmaUv.x * 47.0 + slowFlow * 0.6)
                * sin(plasmaUv.y * 61.0 - slowFlow * 0.45);
            cells = smoothstep(0.42, 0.92, cells * 0.5 + 0.5);

            float pulse = 0.94 + sin(uLogoTime * 0.32) * 0.06;
            float plasmaEnergy = (0.34 + filaments * 0.72 + cells * 0.18) * pulse;
            vec3 fusionColour = mix(vec3(1.0, 0.105, 0.006), vec3(1.0, 0.62, 0.075), filaments);

            totalEmissiveRadiance += fusionColour * plasmaEnergy * orangeMask;
            `
        )

        energyShaders.push(shader)
    }

    material.customProgramCacheKey = () => 'orvex-contained-plasma-v1'
    material.needsUpdate = true
}

const loader = new GLTFLoader()
loader.setMeshoptDecoder(MeshoptDecoder)

const textureLoader = new THREE.TextureLoader()
const qualityDirectory = getSettings().quality === 'low' ? 'logo/low' : 'logo/desktop'
const logoSource = assetUrl(`${qualityDirectory}/geometry.glb`)

function mountLogo(gltf, textures) {
        const model = gltf.scene
        const bounds = new THREE.Box3().setFromObject(model)
        const size = bounds.getSize(new THREE.Vector3())
        const center = bounds.getCenter(new THREE.Vector3())
        const largestDimension = Math.max(size.x, size.y, size.z) || 1

        // Keep the existing website placement and proportional scaling unchanged.
        model.position.sub(center)
        model.scale.setScalar(4.25 / largestDimension)

        model.traverse((child) => {
            if (!child.isMesh) return

            child.castShadow = false
            child.receiveShadow = false

            const materials = Array.isArray(child.material) ? child.material : [child.material]
            materials.forEach((material) => enhanceLogoMaterial(material, textures))
        })

        logo.add(model)
        logo.userData.model = model
}

async function loadLogo() {
    try {
        const [gltf, baseColor, normal, metallicRoughness] = await Promise.all([
            loader.loadAsync(logoSource),
            textureLoader.loadAsync(assetUrl(`${qualityDirectory}/baseColor.jpg`)),
            textureLoader.loadAsync(assetUrl(`${qualityDirectory}/normal.jpg`)),
            textureLoader.loadAsync(assetUrl(`${qualityDirectory}/metallicRoughness.png`))
        ])

        baseColor.colorSpace = THREE.SRGBColorSpace

        for (const texture of [baseColor, normal, metallicRoughness]) {
            texture.flipY = false
            texture.anisotropy = 4
        }

        mountLogo(gltf, { baseColor, normal, metallicRoughness })
    } catch (error) {
        console.error('Unable to load the ORVEX logo model.', error)
    }
}

loadLogo()

scene.add(logo)

export function updateLogo(elapsed) {
    for (const shader of energyShaders) {
        shader.uniforms.uLogoTime.value = elapsed
    }

    if (logo.userData.model) {
        const model = logo.userData.model

        // Slow lateral 3D turn around the vertical axis — no flat clock-like spin.
        model.rotation.x = 0
        model.rotation.y = elapsed * .035
        model.rotation.z = 0
    }
}
