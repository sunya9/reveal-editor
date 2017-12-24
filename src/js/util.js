import marked, { Renderer } from 'marked'
import removeMd from 'remove-markdown'
import store from './store'
import uuid from 'uuid/v4'
import emojione from 'emojione'
emojione.emojiSize = 128

marked.setOptions({
  breaks: true,
  renderer: new Renderer()
})

export const MD_SEPARATOR = '\n\n----------\n\n'
export const revealEvents = [
  'slidechanged',
  'fragmentshown',
  'fragmenthidden',
  'paused',
  'resumed'
]

export function makeBlobRenderer(assetsPrefix) {
  const renderer = new Renderer()
  renderer.image = function(href, title, text) {
    const url = assetsPrefix
      ? !/^https?/.test(href) ? store.getters['file/getAssetPath'](href) : href
      : store.getters['file/assetsMap'](assetsPrefix)[href] || href
    let out = `<img src="${url}" alt="${text}"`
    if (title) {
      out += ` title="${title}"`
    }
    out += this.options.xhtml ? '/>' : '>'
    return out
  }
  return renderer
}

export function makeSections(options = {}) {
  const renderer = makeBlobRenderer(options.assetsPrefix)
  return store.state.file.slides.map(slide => `
<section>${marked(emojione.toImage(slide.body), { renderer })}</section>
`).join('')
}

export function previewTemplate(popup = false, options = {}) {
  const slides = store.state.file.slides
  const title = slides.length
    ? getPlainTitleFromBody(slides[0].body)
    : 'No title'
  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://unpkg.com/reveal.js@3/css/reveal.css">
    ${popup ? makeHead(options) : ''}
    <style>
    .emojione {
      border: 0 !important;
      box-shadow: none !important;
      display: inline-block !important;
      vertical-align: middle !important;
      background: none !important;
      max-height: 1.3em !important;
      max-width: auto !important;
    }
    </style>
    <title>${title}</title>
  </head>
  <body>
    <div class="reveal" id="reveal-container">
      <div class="slides" id="inner-slides">
        ${makeSections(options)}
      </div>
    </div>
    <script src="https://unpkg.com/reveal.js@3"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"><\/script>
    ${popup ? makeFoot(options) : ''}
    ${!options.export ? disableAnchors() : ''}
  </body>
</html>`
}

function disableAnchors() {
  return `
  <script>
  document.addEventListener('click', e => {
    if(e.target.tagName !== 'A') return
    const base = location.href.replace(location.hash, '')
    if(!e.target.href.replace(base, '').startsWith('#/'))
      e.preventDefault()
    return true
  })
  </script>
  `
}

function makeHead(options) {
  let html = `<link rel="stylesheet" href="${getThemeURL()}">
<link rel="stylesheet" href="${getSyntaxThemeURL()}">`
  if(options.export === 'pdf') {
    html += '<link rel="stylesheet" href="https://unpkg.com/reveal.js@3/css/print/pdf.css">'
  }
  return html
}

function makeFoot(options) {
  const json = JSON.stringify(revealOptions({
    postMessageEvents: true,
    pdfMaxPagesPerSlide: 1
  }))
  let html = `<script>
Reveal.initialize(${json})
hljs.initHighlightingOnLoad()
</script>`
  return html
}

export function getPlainTitleFromBody(mdBody) {
  return removeMd(mdBody.trim().split('\n')[0])
}

export function revealOptions(override) {
  return {
    width: 1920,
    height: 1080,
    minScale: 0.5,
    maxScale: 1,
    ...store.state.file.options,
    ...override
  }
}

export function getThemeURL() {
  return `https://unpkg.com/reveal.js@3/css/theme/${store.state.file.theme}.css`
}

export function getSyntaxThemeURL() {
  return `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/${store.state.file.syntaxTheme}.min.css`
}


export function md2ary(md, separator = MD_SEPARATOR) {
  return md.split(separator).map(rawSlide => {
    const [body = '', note = ''] = rawSlide.split(/\n\n^Note:\n/m)
    return {
      body, note
    }
  })
}

export function generateIframe(fileURL) {
  return `
<iframe src="${fileURL}"
  frameborder="0"
  style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;">
</iframe>
<script>
const { remote } = require('electron')
const win = remote.getCurrentWindow()
win.setFullScreen(true)
const frame = window.frames[0]
const events = ${JSON.stringify(revealEvents)}
events.forEach(event => {
  frame.addEventListener(event, e => {
    const state = frame.Reveal.getState()
    delete state.overview
    window.opener.frames[0].postMessage(JSON.stringify({ method: 'setState', args: [state]}), '*')
  })
})
frame.addEventListener('load', () => {
  const { Reveal } = frame
  Reveal.registerKeyboardShortcut('Ctrl+W', 'Exit')
})
frame.addEventListener('keydown', event => {
  switch (event.key) {
    case 'w': {
      if(event.ctrlKey) {
        win.close()
        return false
      }
      break
    }
    case 'f':
    case 'F11': {
      const current = win.isFullScreen()
      win.setFullScreen(!current)
    }
  }
}, true)
</script>
`
}
