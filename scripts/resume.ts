// Builds docs/resume.html from docs/resume.md, the resume's single source of truth.
// Markdown conventions: `## Section`, `### Entry`, a trailing ` | Date` on a heading, list item or
// paragraph right-aligns the date, `code` = stack tag.
import { marked } from 'marked'

const dir = new URL('../docs/', import.meta.url)
const md = await Bun.file(new URL('resume.md', dir)).text()

const DATE = '(?:[A-Z][a-z]{2} )?\\d{4}'
const dated = new RegExp(`<(h3|li|p)>(.*) \\| (${DATE}(?: – (?:${DATE}|Present))?)</\\1>`, 'g')

const body = (await marked.parse(md)).replace(
  dated,
  '<$1><span class="row"><span>$2</span><span class="date">$3</span></span></$1>',
)
const stray = body.match(/ \| [^|<]*\d{4}[^|<]*<\//)
if (stray)
  throw new Error(`Unrecognized date "${stray[0]}": use "Mon YYYY – Mon YYYY" or "YYYY – Present"`)

const svg = (d: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`
const ICONS = {
  location: svg(
    '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  ),
  email: svg(
    '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  ),
  phone: svg(
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  ),
  web: svg(
    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  ),
  linkedin: svg(
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  ),
}
const icon = (item: string) =>
  item.includes('mailto:')
    ? ICONS.email
    : item.includes('linkedin')
      ? ICONS.linkedin
      : item.includes('<a ')
        ? ICONS.web
        : /^\+?[\d ]+$/.test(item)
          ? ICONS.phone
          : ICONS.location

const name = body.match(/<h1>(.*?)<\/h1>/)?.[1] ?? 'Resume'
const [head, ...sections] = body.split(/(?=<h2>)/)
// The line under the name is the contact line: ` · `-separated items, each gets an icon.
const contact = head.replace(
  /<p>(.*?)<\/p>/,
  (_, items: string) =>
    `<p class="contact">${items
      .split(' · ')
      .map((item) => `<span>${icon(item)}${item}</span>`)
      .join('')}</p>`,
)
const main = [
  `<header>${contact}</header>`,
  ...sections.map((s) => {
    const id = (s.match(/<h2>(.*?)<\/h2>/)?.[1] ?? '').toLowerCase().replace(/\W+/g, '-')
    return `<section id="${id}">${s}</section>`
  }),
].join('\n')

const css = `
  @page { size: A4; margin: 9mm 11mm; }
  :root {
    --ink: #1b1f24;
    --accent: #004f90;
    --desk: #dfe3e8;
    --serif: "Charis SIL", Charter, "Bitstream Charter", Georgia, serif;
  }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0;
    padding: 20px 16px;
    background: var(--desk);
    color: var(--ink);
    font: 400 9.2pt/1.2 var(--serif);
  }
  main {
    max-width: 210mm;
    margin: 0 auto;
    padding: 9mm 11mm;
    background: #fff;
    box-shadow: 0 1px 6px rgba(27, 31, 36, .18);
    display: grid;
    grid-template-columns: 5fr 6fr;
    gap: 5pt 14pt;
  }
  main > * { grid-column: 1 / -1; }
  #education { grid-column: 1; }
  #certifications { grid-column: 2; }
  a { color: var(--accent); text-decoration: none; }
  p, ul, h1, h2, h3 { margin: 0; }

  header { text-align: center; display: grid; gap: 2pt; }
  h1 { font-size: 20pt; line-height: 1.1; color: var(--accent); }
  .contact { display: flex; flex-wrap: wrap; justify-content: center; gap: 0 14pt; }
  .contact span { display: inline-flex; align-items: center; gap: 3pt; }
  .contact svg { width: 9pt; height: 9pt; fill: none; stroke: var(--accent); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

  section { display: grid; gap: 1.5pt; align-content: start; }
  h2 { font-size: 11pt; color: var(--accent); border-bottom: .75pt solid var(--accent); margin-bottom: 1.5pt; }
  h3 { font: inherit; }
  * + h3:not(h2 + h3) { margin-top: 3pt; }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 12pt; }
  .row > :first-child { min-width: 0; }
  .date { white-space: nowrap; }
  ul { padding-left: 12pt; display: grid; gap: 1.5pt; }
  li ul { margin-top: 1.5pt; list-style-type: circle; }
  code { display: inline-block; padding: 0 3.5pt; font: 7.6pt/1.45 var(--serif); color: var(--accent); background: #eaf1f7; border-radius: 2pt; }

  @media print {
    body { padding: 0; background: #fff; }
    main { max-width: none; padding: 0; box-shadow: none; }
  }
  @media (max-width: 560px) {
    main { padding: 20px 16px; grid-template-columns: 1fr; }
    #education, #certifications { grid-column: 1; }
    .row { flex-wrap: wrap; }
  }
`

const html = `<!doctype html>
<!-- Generated from resume.md by scripts/resume.ts. Edit the Markdown, then run \`bun run resume\`. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name} - CV</title>
<meta name="author" content="${name}">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Charis+SIL:ital,wght@0,400;0,700;1,400;1,700&display=swap">
<style>${css}</style>
</head>
<body>
<main>
${main}
</main>
</body>
</html>
`

await Bun.write(new URL('resume.html', dir), html)
console.log('wrote docs/resume.html')
