import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { scene } from './scene'

export const logo = new THREE.Group()

const energyField = new THREE.Group()
energyField.position.z = -0.28
logo.add(energyField)

const coreMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
            vec2 p = vUv - .5;
            float radius = length(p) * 2.0;
            float angle = atan(p.y, p.x);
            float turbulence = sin(angle * 7.0 - uTime * .16 + radius * 13.0) * .026;
            float innerRing = exp(-pow(radius - .34 - turbulence, 2.0) * 165.0);
            float outerRing = exp(-pow(radius - .62 + turbulence, 2.0) * 36.0) * .42;
            float plasma = smoothstep(.92, .2, radius) * (.42 + .58 * sin(angle * 3.0 + radius * 10.0 + uTime * .1));
            float energy = max(innerRing * 1.35, outerRing) + plasma * .11;
            float fade = smoothstep(1.0, .18, radius);
            vec3 color = mix(vec3(.92, .11, .008), vec3(1.0, .72, .22), clamp(energy * 1.25, 0.0, 1.0));
            color += vec3(1.0, .24, .015) * outerRing;
            float alpha = energy * fade;
            gl_FragColor = vec4(color, alpha);
        }
    `
})

const core = new THREE.Mesh(new THREE.PlaneGeometry(3.25, 3.25), coreMaterial)
core.renderOrder = -2
energyField.add(core)

const eventHorizon = new THREE.Mesh(
    new THREE.CircleGeometry(.29, 64),
    new THREE.MeshBasicMaterial({ color: 0x020101, transparent: true, opacity: .98, depthWrite: false })
)
eventHorizon.position.z = .02
energyField.add(eventHorizon)

const accretionMaterial = new THREE.MeshBasicMaterial({
    color: 0xff8a32,
    transparent: true,
    opacity: .34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
})

const innerDisk = new THREE.Mesh(new THREE.RingGeometry(.58, 1.16, 96), accretionMaterial)
innerDisk.rotation.x = 1.1
innerDisk.rotation.z = -.24
energyField.add(innerDisk)

const outerDisk = new THREE.Mesh(
    new THREE.RingGeometry(1.22, 1.5, 96),
    accretionMaterial.clone()
)
outerDisk.material.opacity = .12
outerDisk.rotation.x = 1.1
outerDisk.rotation.z = .38
energyField.add(outerDisk)

const particleCount = 90
const particlePositions = new Float32Array(particleCount * 3)

for (let index = 0; index < particleCount; index += 1) {
    const angle = Math.random() * Math.PI * 2
    const radius = .66 + Math.random() * .82
    const offset = index * 3

    particlePositions[offset] = Math.cos(angle) * radius
    particlePositions[offset + 1] = Math.sin(angle) * radius * .46
    particlePositions[offset + 2] = (Math.random() - .5) * .2
}

const particleGeometry = new THREE.BufferGeometry()
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
    color: 0xffb36e,
    size: .028,
    transparent: true,
    opacity: .62,
    blending: THREE.AdditiveBlending,
    depthWrite: false
}))
energyField.add(particles)

const energyLight = new THREE.PointLight(0xff7626, 4.5, 13, 2)
energyLight.position.set(0, 0, 2)
logo.add(energyLight)

const loader = new GLTFLoader()

loader.load(
    '/orvex-logo.glb',
    (gltf) => {
        const model = gltf.scene
        const bounds = new THREE.Box3().setFromObject(model)
        const size = bounds.getSize(new THREE.Vector3())
        const center = bounds.getCenter(new THREE.Vector3())
        const largestDimension = Math.max(size.x, size.y, size.z) || 1

        model.position.sub(center)
        model.scale.setScalar(4.25 / largestDimension)

        model.traverse((child) => {
            if (!child.isMesh) return

            child.castShadow = false
            child.receiveShadow = false

            const materials = Array.isArray(child.material) ? child.material : [child.material]
            materials.forEach((material) => {
                material.transparent = material.transparent || material.opacity < 1
                material.needsUpdate = true
            })
        })

        logo.add(model)
        logo.userData.model = model
    },
    undefined,
    (error) => console.error('Unable to load the ORVEX logo model.', error)
)

scene.add(logo)

export function updateLogo(elapsed) {
    coreMaterial.uniforms.uTime.value = elapsed
    innerDisk.rotation.z = -.24 + elapsed * .025
    outerDisk.rotation.z = .38 - elapsed * .015
    particles.rotation.z = elapsed * .035
    energyField.rotation.z = Math.sin(elapsed * .09) * .018

    const pulse = 1 + Math.sin(elapsed * .48) * .025
    core.scale.setScalar(pulse)
    energyLight.intensity = 4.25 + Math.sin(elapsed * .52) * .35

    if (logo.userData.model) {
        logo.userData.model.rotation.y = Math.sin(elapsed * .12) * .055
    }
}
