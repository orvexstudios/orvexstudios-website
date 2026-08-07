import gsap from "gsap"

export function heroAnimation(){

    const tl = gsap.timeline()
    const navbar = document.querySelector('.navbar')
    const heroTitle = document.querySelector('.hero h1')
    const heroCopy = document.querySelectorAll('.hero p')
    const heroButtons = document.querySelectorAll('.hero-buttons button')

    if (navbar) {
        tl.from(navbar,{

            y:-60,

            opacity:0,

            duration:1,

            ease:"power4.out"

        })
    }

    if (heroTitle) {
        tl.from(heroTitle,{

            y:80,

            opacity:0,

            duration:1.25,

            ease:"power4.out"

        }, "-=.55")
    }

    if (heroCopy.length) {
        tl.from(heroCopy,{

            opacity:0,

            y:40,

            duration:1

        }, "-=.8")
    }

    if (heroButtons.length) {
        tl.from(heroButtons,{

            opacity:0,

            y:35,

            stagger:.15,

            duration:.8,

            ease:"power3.out"

        }, "-=.6")
    }

}
