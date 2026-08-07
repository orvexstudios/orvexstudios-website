import { installExternalLinkAdapter } from '../platform/links'

function initCopyButtons() {
    document.querySelectorAll('[data-copy-email]').forEach((button) => {
        button.addEventListener('click', async () => {
            const email = button.dataset.copyEmail
            const container = button.closest('.contact-cinematic-copy, .contact-command-copy, .contact-card')
            const status = container?.querySelector('.copy-status')
            const label = button.querySelector('.copy-label')

            try {
                await navigator.clipboard.writeText(email)
            } catch {
                const field = document.createElement('textarea')
                field.value = email
                field.className = 'copy-fallback-field'
                document.body.appendChild(field)
                field.select()
                document.execCommand('copy')
                field.remove()
            }

            if (label) label.textContent = 'Copied'
            if (status) status.textContent = `${email} copied to clipboard.`
            button.classList.add('is-copied')

            window.setTimeout(() => {
                if (label) label.textContent = 'Copy email'
                if (status) status.textContent = ''
                button.classList.remove('is-copied')
            }, 2200)
        })
    })
}

function initStudioReveal() {
    const revealItems = document.querySelectorAll(
        '.about-container > *, .project-header, .project-card, .creature-card, .tech-card, .pipeline-card, .roadmap-card, .why-card, .stat-card, .news-card, .media-box, .career-card, .footer'
    )

    revealItems.forEach((item) => item.classList.add('studio-reveal'))

    if (document.documentElement.classList.contains('reduce-motion')) {
        revealItems.forEach((item) => item.classList.add('is-visible'))
        return
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
        })
    }, { threshold: 0.12 })

    revealItems.forEach((item) => observer.observe(item))
}

export function initSite() {
    initCopyButtons()
    initStudioReveal()
    installExternalLinkAdapter()
}
