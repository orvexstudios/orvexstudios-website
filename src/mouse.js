export const mouse = {

    x: 0,

    y: 0,

    enabled: true

}

window.addEventListener("mousemove", (event) => {

    if (!mouse.enabled) return

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1

    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

})