const STORAGE_KEY = 'orvex.settings.v1'

function defaultQuality() {
    const lowPowerDevice = window.matchMedia('(max-width: 780px)').matches
        || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    return lowPowerDevice ? 'low' : 'desktop'
}

const defaults = {
    quality: defaultQuality(),
    disable3d: false,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    appearance: 'cinematic'
}

function readSettings() {
    try {
        return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
    } catch {
        return { ...defaults }
    }
}

let current = readSettings()

export function getSettings() {
    return { ...current }
}

export function updateSettings(changes) {
    current = { ...current, ...changes }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    applySettings()
    window.dispatchEvent(new CustomEvent('orvex:settings-changed', { detail: getSettings() }))
    return getSettings()
}

export function applySettings() {
    document.documentElement.dataset.quality = current.quality
    document.documentElement.dataset.appearance = current.appearance
    document.documentElement.classList.toggle('reduce-motion', current.reduceMotion)
    document.documentElement.classList.toggle('disable-3d', current.disable3d)
}

applySettings()
