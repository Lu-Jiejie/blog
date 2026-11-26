import MarkdownIt from 'markdown-it'
import MDLinkAttributes from 'markdown-it-link-attributes'

let renderer: MarkdownIt | null = null

// html:false —— 正文不解析原始 HTML，v-html 里不会出现用户塞进来的标签
// breaks:true —— 随想是手写短句，换行就该换行，不该并成一段
function getRenderer() {
  if (!renderer) {
    renderer = new MarkdownIt({
      html: false,
      linkify: true,
      breaks: true,
      quotes: '""\'\'',
    })
    renderer.use(MDLinkAttributes as any, {
      matcher: (link: string) => link.startsWith('http'),
      attrs: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    })
  }
  return renderer
}

/** 渲染随想正文 */
export function renderMarkdown(text: string) {
  return getRenderer().render(text)
}
