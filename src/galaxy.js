import * as THREE from 'three'
import { scene } from './scene'

const galaxyGeometry = new THREE.BufferGeometry()

const count = 4000

const positions = new Float32Array(count * 3)

const colors = new Float32Array(count * 3)

const color = new THREE.Color()

for (let i = 0; i < count; i++) {

    const radius = Math.random() * 80

    const angle = radius * 0.35

    const random = (Math.random() - 0.5) * 8

    const i3 = i * 3

    positions[i3] = Math.cos(angle) * radius + random

    positions[i3 + 1] = (Math.random() - 0.5) * 8

    positions[i3 + 2] = Math.sin(angle) * radius + random - 40

    if (Math.random() < 0.7) {

        color.set("#ff8c3a")

    } else {

        color.set("#5d8dff")

    }

    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

}

galaxyGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
)

galaxyGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3)
)

const galaxyMaterial = new THREE.PointsMaterial({

    size: 0.35,

    transparent: true,

    opacity: 0.35,

    depthWrite: false,

    blending: THREE.AdditiveBlending,

    vertexColors: true

})

export const galaxy = new THREE.Points(
    galaxyGeometry,
    galaxyMaterial
)

scene.add(galaxy)