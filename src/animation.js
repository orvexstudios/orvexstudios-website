import * as THREE from 'three'

import { stars } from './stars'
import { planet, atmosphere } from './planet'
import { logo, updateLogo } from './logo'
import { camera } from './camera'
import { composer } from './renderer'
import { mouse } from './mouse'
import { scene, cameraTarget } from './scene'
import { updateContactCinematic } from './contactCinematic'
import { getSettings } from './settings'

const timer = new THREE.Timer()
const settings = getSettings()
const reducedFrameInterval = settings.reduceMotion ? 1000 / 20 : 0

let frameId
let running = false
let windowActive = !document.hidden
let previousFrameTime = 0

function schedule() {
    frameId = requestAnimationFrame(renderLoop)
}

function renderLoop(frameTime) {
    if (!running) return
    schedule()

    if (!windowActive || (reducedFrameInterval && frameTime - previousFrameTime < reducedFrameInterval)) return
    previousFrameTime = frameTime

    timer.update()

    const elapsed = timer.getElapsed()

    stars.rotation.y = elapsed * 0.01
    stars.rotation.x = elapsed * 0.002

    planet.rotation.y += 0.0004
    atmosphere.rotation.y += 0.0004

    updateLogo(elapsed)

    logo.position.y =
        Math.sin(elapsed * 0.35) * 0.12

    const contactCinematicActive = updateContactCinematic(elapsed)

    if (!contactCinematicActive) {
        cameraTarget.position.y =
            Math.sin(elapsed * 0.8) * 0.05

        camera.position.x +=
            (mouse.x * 0.15 - camera.position.x) * 0.02

        camera.position.y +=
            (mouse.y * 0.10 - camera.position.y) * 0.02

        camera.lookAt(cameraTarget.position)
    }


    composer.render()

}

function syncDocumentVisibility() {
    windowActive = !document.hidden
}

document.addEventListener('visibilitychange', syncDocumentVisibility)
window.addEventListener('blur', () => { windowActive = false })
window.addEventListener('focus', () => { windowActive = !document.hidden })

export function startAnimation() {
    if (running) return
    running = true
    schedule()
}

export function stopAnimation() {
    running = false
    if (frameId) cancelAnimationFrame(frameId)
}
