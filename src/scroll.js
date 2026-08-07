import Lenis from 'lenis'

export const lenis = new Lenis({

    duration: 1.4,

    smoothWheel: true,

})

function raf(time) {

    lenis.raf(time)

    frameId = requestAnimationFrame(raf)

}

let frameId = requestAnimationFrame(raf)

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(frameId)
        lenis.stop()
        return
    }

    lenis.start()
    frameId = requestAnimationFrame(raf)
})
