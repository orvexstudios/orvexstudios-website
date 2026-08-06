import * as THREE from 'three'

import { scene } from './scene'

const ambientLight = new THREE.AmbientLight(

    0xffffff,

    1

)

scene.add(

    ambientLight

)

const orangeLight = new THREE.PointLight(

    0xff7a1a,

    5,

    50

)

orangeLight.position.set(

    5,

    3,

    8

)

scene.add(

    orangeLight
)
const planetLight = new THREE.DirectionalLight(

    0xff8c3a,

    4

)

planetLight.position.set(

    15,

    8,

    12

)

scene.add(

    planetLight
)