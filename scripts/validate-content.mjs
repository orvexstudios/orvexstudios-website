import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataRoot = join(projectRoot, 'src', 'data')

const files = {
  site: 'site.json',
  projects: 'projects.json',
  creatures: 'creatures.json',
  news: 'news.json',
  careers: 'careers.json',
  contacts: 'contacts.json',
  media: 'media.json'
}

const content = {}
const failures = []

for (const [key, filename] of Object.entries(files)) {
  try {
    content[key] = JSON.parse(await readFile(join(dataRoot, filename), 'utf8'))
  } catch (error) {
    failures.push(`${filename}: ${error.message}`)
  }
}

function requireValue(value, path) {
  if (typeof value !== 'string' || value.trim() === '') {
    failures.push(`${path} must be a non-empty string`)
  }
}

function validateCollection(name, collection, requiredFields) {
  if (!collection || collection.schemaVersion !== 1 || !Array.isArray(collection.items)) {
    failures.push(`${name}.json must contain schemaVersion 1 and an items array`)
    return
  }

  const ids = new Set()
  const slugs = new Set()
  collection.items.forEach((item, index) => {
    const path = `${name}.items[${index}]`
    requiredFields.forEach((field) => requireValue(item[field], `${path}.${field}`))
    if (ids.has(item.id)) failures.push(`${path}.id duplicates ${item.id}`)
    ids.add(item.id)
    if ('slug' in item) {
      if (slugs.has(item.slug)) failures.push(`${path}.slug duplicates ${item.slug}`)
      slugs.add(item.slug)
    }
  })
}

if (content.site) {
  if (content.site.schemaVersion !== 1) failures.push('site.schemaVersion must be 1')
  if (content.site.brand?.defaultLocale !== 'en') failures.push('site.brand.defaultLocale must be en')
  const expectedNavigation = [
    'home', 'about', 'projects', 'creatures', 'media', 'news', 'technology', 'careers', 'contact'
  ]
  const actualNavigation = content.site.navigation?.map((item) => item.id) ?? []
  if (JSON.stringify(actualNavigation) !== JSON.stringify(expectedNavigation)) {
    failures.push('site.navigation does not match the approved app navigation')
  }
}

validateCollection('projects', content.projects, ['id', 'slug', 'title', 'status', 'engine'])
validateCollection('creatures', content.creatures, ['id', 'slug', 'name', 'species', 'status', 'rigStatus'])
validateCollection('news', content.news, ['id', 'slug', 'title', 'category', 'body', 'status'])
validateCollection('careers', content.careers, ['id', 'slug', 'title', 'status', 'description'])
validateCollection('contacts', content.contacts, ['id', 'label', 'email', 'description'])

const requiredEmails = new Set([
  'founder@orvexstudios.com',
  'contact@orvexstudios.com',
  'business@orvexstudios.com',
  'careers@orvexstudios.com',
  'support@orvexstudios.com'
])
const actualEmails = new Set(content.contacts?.items?.map((item) => item.email) ?? [])
for (const email of requiredEmails) {
  if (!actualEmails.has(email)) failures.push(`contacts.json is missing ${email}`)
}
if (content.careers?.applicationEmail !== 'careers@orvexstudios.com') {
  failures.push('careers.applicationEmail must use the official careers address')
}
if (!Array.isArray(content.media?.categories)) {
  failures.push('media.categories must be an array')
}

if (failures.length) {
  console.error('Content validation failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exitCode = 1
} else {
  console.log(
    `Content validation passed: ${content.projects.items.length} project, ` +
    `${content.creatures.items.length} creatures, ${content.news.items.length} news entries, ` +
    `${content.careers.items.length} career entries and ${content.contacts.items.length} contacts.`
  )
}
