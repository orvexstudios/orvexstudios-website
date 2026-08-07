export function isTauriRuntime() {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

function shouldOpenExternally(anchor) {
    const rawHref = anchor.getAttribute('href')
    if (!rawHref || rawHref === '#' || rawHref.startsWith('#')) return false

    const url = new URL(anchor.href, window.location.href)
    return url.protocol === 'mailto:'
        || (url.protocol === 'https:' && url.origin !== window.location.origin)
}

export function installExternalLinkAdapter() {
    if (!isTauriRuntime()) return

    document.addEventListener('click', async (event) => {
        const anchor = event.target.closest('a[href]')
        if (!anchor || !shouldOpenExternally(anchor)) return

        event.preventDefault()

        try {
            const { openUrl } = await import('@tauri-apps/plugin-opener')
            await openUrl(anchor.href)
        } catch (error) {
            console.error('Unable to open the external link.', error)
        }
    })
}
