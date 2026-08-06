import * as THREE from 'three'

import { scene } from './scene'

const loader = new THREE.TextureLoader()

const logoTexture = loader.load('/logo.png')

const logoGeometry = new THREE.PlaneGeometry(

    4,

    4

)

const logoMaterial = new THREE.MeshBasicMaterial({

    map: logoTexture,

    transparent: true,

    alphaTest: 0.5,

    side: THREE.DoubleSide

})

export const logo = new THREE.Mesh(

    logoGeometry,

    logoMaterial

)

scene.add(

    logo

)