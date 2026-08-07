import * as THREE from 'three'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import { camera } from './camera'
import { logo } from './logo'
import { mouse } from './mouse'
import { scene } from './scene'

gsap.registerPlugin(ScrollTrigger)

const contactSection = document.querySelector('#contact')
const contactStage = contactSection?.querySelector('.contact-cinematic')
const revealItems = contactSection?.querySelectorAll('[data-contact-reveal]') ?? []

const state = { progress: 0 }
const defaultBackground = new THREE.Color(0x050608)
const hopefulBackground = new THREE.Color(0x030914)

const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 12),
    new THREE.Vector3(-5, 1, -4),
    new THREE.Vector3(-15, 3, -18),
    new THREE.Vector3(-17, 6, -35),
    new THREE.Vector3(-14, 5, -60),
    new THREE.Vector3(3, 3, -76),
    new THREE.Vector3(19, 1, -43)
], false, 'catmullrom', .62)

const targetPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-22, 2, -25),
    new THREE.Vector3(-42, 3, -48),
    new THREE.Vector3(-48, 3, -50),
    new THREE.Vector3(-20, 1, -64),
    new THREE.Vector3(12, -1, -75),
    new THREE.Vector3(28, -1.5, -82)
], false, 'catmullrom', .58)

const desiredCameraPosition = new THREE.Vector3()
const desiredTarget = new THREE.Vector3()
const currentTarget = new THREE.Vector3(0, 0, 0)

let earthApi
let earthRequest

function requestEarth() {
    if (earthRequest) return earthRequest

    earthRequest = import('./earth').then(async (module) => {
        earthApi = module
        await module.loadEarth()
        return module
    })

    return earthRequest
}

if (contactSection && contactStage) {
    gsap.set(revealItems, {
        autoAlpha: 0,
        y: 34,
        filter: 'blur(9px)'
    })

    gsap.timeline({
        scrollTrigger: {
            trigger: contactSection,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1.65,
            invalidateOnRefresh: true,
            onEnter: requestEarth,
            onEnterBack: requestEarth
        }
    })
        .to(state, {
            progress: 1,
            duration: 1,
            ease: 'power2.inOut'
        }, 0)
        .to(contactStage, {
            '--contact-light': 1,
            duration: .38,
            ease: 'power2.out'
        }, .48)
        .to(revealItems, {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: .20,
            stagger: .035,
            ease: 'power3.out'
        }, .59)

    ScrollTrigger.create({
        trigger: contactSection,
        start: 'top 145%',
        once: true,
        onEnter: requestEarth
    })
}

export function updateContactCinematic(elapsed) {
    const progress = THREE.MathUtils.clamp(state.progress, 0, 1)

    if (progress <= .0005) {
        scene.background.copy(defaultBackground)
        logo.visible = true
        mouse.enabled = true
        earthApi?.updateEarth(elapsed, 0)
        return false
    }

    mouse.enabled = false

    cameraPath.getPoint(progress, desiredCameraPosition)
    targetPath.getPoint(progress, desiredTarget)

    camera.position.lerp(desiredCameraPosition, .075)
    currentTarget.lerp(desiredTarget, .075)
    camera.lookAt(currentTarget)

    const hope = THREE.MathUtils.smoothstep(progress, .48, .96)
    scene.background.lerpColors(defaultBackground, hopefulBackground, hope)

    logo.visible = progress < .41

    const earthReveal = THREE.MathUtils.smoothstep(progress, .39, .72)
    earthApi?.updateEarth(elapsed, earthReveal)

    return true
}
