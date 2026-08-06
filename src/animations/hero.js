import gsap from "gsap"

export function heroAnimation(){

    const tl = gsap.timeline()

    tl.from(".navbar",{

        y:-60,

        opacity:0,

        duration:1,

        ease:"power4.out"

    })

    .from(".hero h1 span",{

        y:120,

        opacity:0,

        stagger:.15,

        duration:1.4,

        ease:"power4.out"

    })

    .from(".hero p",{

        opacity:0,

        y:40,

        duration:1

    },"-=.8")

    .from(".hero-buttons button",{

        opacity:0,

        y:35,

        stagger:.15,

        duration:.8,

        ease:"power3.out"

    },"-=.6")
}