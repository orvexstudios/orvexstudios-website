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

    roughness: 0.85,

    metalness: 0.02,

    emissive: 0xff5a1f,

    emissiveIntensity: 0.15

})

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