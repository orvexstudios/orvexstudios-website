import site from './site.json'
import projects from './projects.json'
import creatures from './creatures.json'
import news from './news.json'
import careers from './careers.json'
import contacts from './contacts.json'
import media from './media.json'

export const bundledContent = Object.freeze({
  site,
  projects,
  creatures,
  news,
  careers,
  contacts,
  media
})

export function createBundledContentRepository() {
  return {
    async getSite() { return site },
    async getProjects() { return projects.items },
    async getCreatures() { return creatures.items },
    async getNews() { return news.items },
    async getCareers() { return careers.items },
    async getContacts() { return contacts.items },
    async getMedia() { return media.categories }
  }
}
