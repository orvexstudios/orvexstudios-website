import * as THREE from 'three'

import { scene } from './scene'

const geometry = new THREE.PlaneGeometry(

    80,

    80

)

const material = new THREE.MeshBasicMaterial({

    color:0x2d1b12,

    transparent:true,

    opacity:0.08,

    depthWrite:false

})

export const nebula = new THREE.Mesh(

    geometry,

    material

)

nebula.position.set(

    0,

    0,

    -40

)

scene.add(

    nebula
)