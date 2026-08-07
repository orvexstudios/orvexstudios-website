import * as THREE from 'three'

import { scene } from './scene'
import { camera } from './camera'
import { getSettings } from './settings'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const settings = getSettings()
const lowQuality = settings.quality === 'low'

export const renderer = new THREE.WebGLRenderer({

    antialias: !lowQuality,

    alpha: false

})

renderer.setSize(

    window.innerWidth,

    window.innerHeight

)

renderer.setPixelRatio(

    Math.min(

        window.devicePixelRatio,

        lowQuality ? 1 : 2

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

    lowQuality ? .72 : 1.2,

    lowQuality ? .22 : 0.35,

    0.85

)

composer.addPass(

    bloomPass

)

window.addEventListener('resize', () => {

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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowQuality ? 1 : 2))

})
