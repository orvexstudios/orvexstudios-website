import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
    base: mode === 'desktop' ? './' : '/',
    clearScreen: false,
    server: {
        port: 5173,
        strictPort: true,
        watch: {
            ignored: ['**/src-tauri/**']
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/three')) return 'three-runtime'
                    if (id.includes('node_modules/gsap')) return 'motion-runtime'
                    if (id.includes('node_modules/lenis')) return 'smooth-scroll'
                }
            }
        }
    }
}))
