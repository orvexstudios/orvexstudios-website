import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { meshopt, prune } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'

const variants = [
    ['desktop', 'assets-source/ORVEXLOGO-optimized.glb'],
    ['low', 'assets-source/ORVEXLOGO-low.glb']
]

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready])

const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
        'meshopt.decoder': MeshoptDecoder,
        'meshopt.encoder': MeshoptEncoder
    })

function fileExtension(texture, fallback) {
    if (texture?.getMimeType() === 'image/png') return 'png'
    if (texture?.getMimeType() === 'image/webp') return 'webp'
    return fallback
}

for (const [name, inputPath] of variants) {
    const outputDirectory = resolve(`public/logo/${name}`)
    const document = await io.read(resolve(inputPath))
    const materials = document.getRoot().listMaterials()
    const material = materials[0]

    if (!material) throw new Error(`No material found in ${inputPath}`)

    const textures = {
        baseColor: [material.getBaseColorTexture(), 'jpg'],
        normal: [material.getNormalTexture(), 'jpg'],
        metallicRoughness: [material.getMetallicRoughnessTexture(), 'png']
    }

    await mkdir(outputDirectory, { recursive: true })

    for (const [textureName, [texture, fallback]] of Object.entries(textures)) {
        const image = texture?.getImage()
        if (!image) throw new Error(`Missing ${textureName} texture in ${inputPath}`)
        await writeFile(
            join(outputDirectory, `${textureName}.${fileExtension(texture, fallback)}`),
            image
        )
    }

    for (const item of materials) {
        item.setBaseColorTexture(null)
        item.setNormalTexture(null)
        item.setMetallicRoughnessTexture(null)
        item.setEmissiveTexture(null)
        item.setOcclusionTexture(null)
    }

    await document.transform(
        prune(),
        meshopt({ encoder: MeshoptEncoder, level: 'high' })
    )

    await io.write(join(outputDirectory, 'geometry.glb'), document)
    console.log(`Built ${name} runtime logo.`)
}
