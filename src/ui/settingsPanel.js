import { getSettings, updateSettings } from '../settings'

export function initSettingsPanel() {
    const toggle = document.createElement('button')
    toggle.className = 'display-settings-toggle'
    toggle.type = 'button'
    toggle.setAttribute('aria-expanded', 'false')
    toggle.setAttribute('aria-controls', 'display-settings')
    toggle.textContent = 'Display'

    const panel = document.createElement('aside')
    panel.id = 'display-settings'
    panel.className = 'display-settings'
    panel.setAttribute('aria-label', 'Display settings')
    panel.hidden = true
    panel.innerHTML = `
        <div class="display-settings-heading">
            <div><span>ORVEX SYSTEM</span><strong>Display settings</strong></div>
            <button type="button" data-close-settings aria-label="Close display settings">Close</button>
        </div>
        <label>
            <span>3D quality</span>
            <select data-setting="quality">
                <option value="desktop">Desktop</option>
                <option value="low">Mobile / Low</option>
            </select>
        </label>
        <label class="display-settings-check">
            <span><strong>Disable 3D</strong><small>Use the lightweight static background.</small></span>
            <input type="checkbox" data-setting="disable3d">
        </label>
        <label class="display-settings-check">
            <span><strong>Reduce animations</strong><small>Limits continuous and interface motion.</small></span>
            <input type="checkbox" data-setting="reduceMotion">
        </label>
        <label>
            <span>Appearance</span>
            <select data-setting="appearance">
                <option value="cinematic">Cinematic</option>
                <option value="high-contrast">High contrast</option>
            </select>
        </label>
        <p class="display-settings-note">3D changes apply after the experience reloads.</p>
    `

    document.body.append(toggle, panel)

    const sync = () => {
        const settings = getSettings()
        panel.querySelector('[data-setting="quality"]').value = settings.quality
        panel.querySelector('[data-setting="disable3d"]').checked = settings.disable3d
        panel.querySelector('[data-setting="reduceMotion"]').checked = settings.reduceMotion
        panel.querySelector('[data-setting="appearance"]').value = settings.appearance
    }

    const close = () => {
        panel.hidden = true
        toggle.setAttribute('aria-expanded', 'false')
    }

    toggle.addEventListener('click', () => {
        panel.hidden = !panel.hidden
        toggle.setAttribute('aria-expanded', String(!panel.hidden))
        if (!panel.hidden) sync()
    })

    panel.querySelector('[data-close-settings]').addEventListener('click', close)
    panel.addEventListener('change', (event) => {
        const input = event.target.closest('[data-setting]')
        if (!input) return

        const key = input.dataset.setting
        const value = input.type === 'checkbox' ? input.checked : input.value
        const requiresReload = key === 'quality' || key === 'disable3d'
        updateSettings({ [key]: value })

        if (requiresReload) window.setTimeout(() => window.location.reload(), 180)
    })

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close()
    })

    sync()
}
