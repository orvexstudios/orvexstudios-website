import * as THREE from 'three'

export const scene = new THREE.Scene()

scene.background = new THREE.Color(0x050608)

export const cameraTarget = new THREE.Object3D()

cameraTarget.position.set(0, 0, 0)

scene.add(cameraTarget)