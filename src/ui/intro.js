import { lenis } from '../scroll'

const overlay = document.querySelector(".overlay")
const navbar = document.querySelector(".navbar")

export function hideIntro() {

    overlay.style.pointerEvents = "none"
    overlay.style.transition = "opacity 1.2s ease"
    overlay.style.opacity = "0"

    setTimeout(() => {

        navbar.classList.add("active")

        lenis.scrollTo("#about", {
            duration: 2
        })

    }, 1000)

}