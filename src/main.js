import './style.css'
import { heroAnimation } from "./animations/hero"
import { getSettings } from './settings'
import { initSettingsPanel } from './ui/settingsPanel'
import { initSite } from './ui/site'

const settings = getSettings()

if (!settings.reduceMotion) heroAnimation()
initSite()
initSettingsPanel()

let experiencePromise

function loadExperience() {
    if (settings.disable3d) return Promise.resolve(null)
    if (!experiencePromise) {
        experiencePromise = import('./experience').then((experience) => {
            experience.startExperience()
            return experience
        })
    }
    return experiencePromise
}

loadExperience()

const exploreButton = document.querySelector('.primary')

exploreButton.addEventListener('click', () => {

    loadExperience().then((experience) => {
        if (experience) {
            experience.startExplore()
            return
        }

        document.querySelector('.overlay')?.classList.add('is-dismissed')
        document.querySelector('#about')?.scrollIntoView({ behavior: settings.reduceMotion ? 'auto' : 'smooth' })
    })

})
