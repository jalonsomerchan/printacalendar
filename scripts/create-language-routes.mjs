import { mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const distDir = 'dist'
const indexPath = join(distDir, 'index.html')
const languages = ['es', 'en', 'fr', 'ca', 'pt', 'eu']

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html was not found. Run vite build before creating language routes.')
}

for (const lang of languages) {
  const langDir = join(distDir, lang)
  mkdirSync(langDir, { recursive: true })
  copyFileSync(indexPath, join(langDir, 'index.html'))
}
