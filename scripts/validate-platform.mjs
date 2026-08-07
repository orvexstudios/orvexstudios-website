import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const requiredFiles = [
    'assets-source/ORVEXLOGO-web.glb',
    'assets-source/ORVEXLOGO-optimized.glb',
    'assets-source/ORVEXLOGO-low.glb',
    'public/logo/desktop/geometry.glb',
    'public/logo/desktop/baseColor.jpg',
    'public/logo/low/geometry.glb',
    'public/logo/low/baseColor.jpg',
    'src/platform/assets.js',
    'src/platform/links.js',
    'src/settings.js',
    'src-tauri/tauri.conf.json',
    'src-tauri/capabilities/default.json'
]

for (const file of requiredFiles) {
    if (!existsSync(join(root, file))) throw new Error(`Missing platform file: ${file}`)
}

const logoSource = readFileSync(join(root, 'src/logo.js'), 'utf8')
if (/raw\.githubusercontent\.com|github\.com\/orvexstudios/.test(logoSource)) {
    throw new Error('The production logo loader still contains a GitHub fallback.')
}

const index = readFileSync(join(root, 'index.html'), 'utf8')
const inlineScripts = [...index.matchAll(/<script(?![^>]*\bsrc=)[^>]*>/gi)]
if (inlineScripts.length) throw new Error('Inline scripts remain in index.html.')

const tauri = JSON.parse(readFileSync(join(root, 'src-tauri/tauri.conf.json'), 'utf8'))
if (tauri.identifier !== 'com.orvexstudios.app') throw new Error('Unexpected Tauri identifier.')
if (!String(tauri.app?.security?.csp || '').includes("object-src 'none'")) {
    throw new Error('Tauri CSP is missing the object-src restriction.')
}

const capability = JSON.parse(readFileSync(join(root, 'src-tauri/capabilities/default.json'), 'utf8'))
const serializedCapability = JSON.stringify(capability)
for (const forbidden of ['shell:', 'fs:', 'process:']) {
    if (serializedCapability.includes(forbidden)) throw new Error(`Forbidden desktop permission detected: ${forbidden}`)
}

console.log('Platform validation passed: assets, CSP, identifier and minimal capabilities are present.')
