import * as THREE from 'three'

import { scene } from './scene'

const loader = new THREE.TextureLoader()

const starTexture = loader.load('/star.png')

const starCount = 15000

const starGeometry = new THREE.BufferGeometry()

const positions = new Float32Array(

    starCount * 3

)

const colors = new Float32Array(

    starCount * 3

)

const color = new THREE.Color()

for(let i=0;i<starCount;i++){

    const i3 = i * 3

    positions[i3]=(Math.random()-0.5)*500
    positions[i3+1]=(Math.random()-0.5)*500
    positions[i3+2]=(Math.random()-0.5)*500

    const random=Math.random()

    if(random<0.72){

        color.set("#ffffff")

    }

    else if(random<0.88){

        color.set("#c8dbff")

    }

    else if(random<0.96){

        color.set("#ffe6a6")

    }

    else{

        color.set("#ffb66b")

    }

    colors[i3]=color.r
    colors[i3+1]=color.g
    colors[i3+2]=color.b

}

starGeometry.setAttribute(

    "position",

    new THREE.BufferAttribute(

        positions,

        3

    )

)

starGeometry.setAttribute(

    "color",

    new THREE.BufferAttribute(

        colors,

        3

    )

)

const starMaterial = new THREE.PointsMaterial({

    map:starTexture,

    size:1.2,

    transparent:true,

    alphaTest:0.5,

    depthWrite:false,

    blending:THREE.AdditiveBlending,

    vertexColors:true

})

export const stars = new THREE.Points(

    starGeometry,

    starMaterial

)

scene.add(

    stars

)