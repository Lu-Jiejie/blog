const HEADING_OFFSET = 25

export function scrollToHeading(event: Event, id: string) {
  event.preventDefault()

  const el = document.getElementById(id)
  if (!el)
    return

  const targetTop = el.getBoundingClientRect().top + window.scrollY - HEADING_OFFSET
  window.scrollTo({ top: targetTop, behavior: 'smooth' })
  history.replaceState(null, '', `#${id}`)
}
