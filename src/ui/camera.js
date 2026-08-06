import { camera } from '../camera'
import { logo } from '../logo'
import { mouse } from '../mouse'
import gsap from 'gsap'

export function startExplore() {

    // Maussteuerung deaktivieren
    mouse.enabled = false

    // Kamera fährt sanft nach vorne
    gsap.to(camera.position, {

        duration: 3,

        x: 0,

        y: 0.4,

        z: 1.2,

        ease: "power3.inOut"

    })

    // Logo verschwindet
    gsap.to(logo.scale, {

        duration: 2,

        x: 0,

        y: 0,

        z: 0,

        ease: "power2.inOut"

    })

}