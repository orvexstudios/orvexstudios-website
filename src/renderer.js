import * as THREE from 'three'

import { scene } from './scene'
import { camera } from './camera'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export const renderer = new THREE.WebGLRenderer({

    antialias: true,

    alpha: false

})

renderer.setSize(

    window.innerWidth,

    window.innerHeight

)

renderer.setPixelRatio(

    Math.min(

        window.devicePixelRatio,

        window.innerWidth < 768 ? 1.35 : 1.75

    )

)

document.body.appendChild(

    renderer.domElement

)

export const composer = new EffectComposer(

    renderer

)

composer.addPass(

    new RenderPass(

        scene,

        camera

    )

)

const bloomPass = new UnrealBloomPass(

    new THREE.Vector2(

        window.innerWidth,

        window.innerHeight

    ),

    1.2,

    0.35,

    0.85

)

composer.addPass(

    bloomPass

)

window.addEventListener('resize', () => {

    renderer.setPixelRatio(

        Math.min(

            window.devicePixelRatio,

            window.innerWidth < 768 ? 1.35 : 1.75

        )

    )

    camera.aspect =

        window.innerWidth /

        window.innerHeight

    camera.updateProjectionMatrix()

    renderer.setSize(

        window.innerWidth,

        window.innerHeight

    )

    composer.setSize(

        window.innerWidth,

        window.innerHeight

    )

    bloomPass.setSize(

        window.innerWidth,

        window.innerHeight

    )

})
