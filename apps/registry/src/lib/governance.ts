import fs from 'fs'
import path from 'path'

export function getGovernanceMarkdown(): string {
  const filePath = path.join(process.cwd(), 'content', 'governance.md')
  return fs.readFileSync(filePath, 'utf8')
}

export function extractHeadings(markdown: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const lines = markdown.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (!match) continue

    const level = match[1].length
    const text = match[2].replace(/\*\*/g, '').trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    headings.push({ id, text, level })
  }

  return headings
}
