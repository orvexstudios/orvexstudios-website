import * as THREE from 'three'

import { stars } from './stars'
import { planet, atmosphere } from './planet'
import { logo, updateLogo } from './logo'
import { camera } from './camera'
import { composer } from './renderer'
import { mouse } from './mouse'
import { scene, cameraTarget } from './scene'

const timer = new THREE.Timer()
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

export function animate() {

    requestAnimationFrame(animate)

    if (document.hidden) return

    timer.update()

    const elapsed = timer.getElapsed()
    const motionTime = reducedMotion.matches ? elapsed * .18 : elapsed

    stars.rotation.y = elapsed * 0.01
    stars.rotation.x = elapsed * 0.002

    planet.rotation.y += 0.0004
    atmosphere.rotation.y += 0.0004

    updateLogo(motionTime)

    logo.position.y =
        Math.sin(elapsed * 0.35) * 0.12

    cameraTarget.position.y =
        Math.sin(elapsed * 0.8) * 0.05  

    camera.position.x +=
    (mouse.x * 0.15 - camera.position.x) * 0.02

    camera.position.y +=
    (mouse.y * 0.10 - camera.position.y) * 0.02

    camera.lookAt(cameraTarget.position)


    composer.render()

}
