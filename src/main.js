import './style.css'
import { heroAnimation } from "./animations/hero"

import './scene'
import './camera'
import './renderer'
import './scroll'

import './lights'
import './stars'
import './planet'
import './logo'
import './mouse'

import { animate } from './animation'

import { hideIntro } from './ui/intro'
import { startExplore } from './ui/camera'

animate()

heroAnimation()

const exploreButton = document.querySelector('.primary')

exploreButton.addEventListener('click', () => {

    hideIntro()
    startExplore()

})