import './scene'
import './camera'
import './renderer'
import './scroll'
import './lights'
import './stars'
import './planet'
import './logo'
import './mouse'

import { startAnimation } from './animation'
import { hideIntro } from './ui/intro'
import { startExplore as flyCamera } from './ui/camera'

let started = false

export function startExperience() {
    if (started) return
    started = true
    startAnimation()
}

export function startExplore() {
    hideIntro()
    flyCamera()
}
