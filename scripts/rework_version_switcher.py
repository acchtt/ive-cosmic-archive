from pathlib import Path
import re

css_path = Path('revive-member-sets.css')
css = css_path.read_text(encoding='utf-8')
css = re.sub(r'/\* SWITCHER REDESIGN v[\s\S]*? END \*/\s*$', '', css).rstrip()
override = r'''

/* SWITCHER REDESIGN v0.12.0 START */
.member-set-switcher.member-set-switcher-top {
  width: min(calc(100% - 32px), 1280px) !important;
  margin: 10px auto 0 !important;
  grid-template-columns: minmax(150px, .46fr) minmax(430px, 1.45fr) minmax(210px, .7fr);
  gap: 12px;
  align-items: center;
  padding: 9px 11px;
  border-color: color-mix(in srgb, var(--member-set-accent) 17%, rgba(255,255,255,.08));
  border-radius: 16px;
  background: linear-gradient(112deg, color-mix(in srgb, var(--set-bg) 89%, transparent), color-mix(in srgb, var(--set-panel) 86%, transparent));
  box-shadow: 0 10px 30px rgba(0, 0, 0, .18), inset 0 1px 0 rgba(255, 255, 255, .025);
  backdrop-filter: blur(20px) saturate(1.08);
}
.member-set-switcher.member-set-switcher-top::before {
  content: "";
  position: absolute;
  left: 0;
  top: 13px;
  bottom: 13px;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--member-set-accent), var(--member-set-secondary));
  box-shadow: 0 0 18px color-mix(in srgb, var(--member-set-accent) 30%, transparent);
}
.member-set-switcher.member-set-switcher-top::after { display: none; }
.member-set-switcher.member-set-switcher-top .member-set-switcher-copy { gap: 2px; padding-left: 10px; }
.member-set-switcher.member-set-switcher-top .member-set-switcher-copy > span {
  color: color-mix(in srgb, var(--set-muted) 72%, transparent);
  font-size: .46rem;
  letter-spacing: .18em;
}
.member-set-switcher.member-set-switcher-top .member-set-switcher-copy > strong {
  font-size: clamp(.86rem, 1.35vw, 1.02rem);
  letter-spacing: .045em;
  text-transform: uppercase;
}
.member-set-switcher.member-set-switcher-top .member-set-options {
  gap: 4px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, .065);
  border-radius: 12px;
  background: rgba(255, 255, 255, .022);
}
.member-set-switcher.member-set-switcher-top .member-set-options button {
  min-height: 34px;
  padding: 7px 9px 7px 24px;
  border-color: transparent;
  border-radius: 9px;
  color: color-mix(in srgb, var(--set-paper) 54%, transparent);
  background: transparent;
  font-size: clamp(.48rem, .62vw, .56rem);
  letter-spacing: .085em;
  box-shadow: none;
  transition: color .18s ease, background .18s ease, box-shadow .18s ease;
}
.member-set-switcher.member-set-switcher-top .member-set-options button::before {
  left: 9px;
  width: 6px;
  height: 6px;
  box-shadow: 0 0 8px color-mix(in srgb, var(--option-a) 52%, transparent);
}
.member-set-switcher.member-set-switcher-top .member-set-options button:hover,
.member-set-switcher.member-set-switcher-top .member-set-options button:focus-visible {
  border-color: transparent;
  color: var(--set-paper);
  background: rgba(255, 255, 255, .045);
  transform: none;
}
.member-set-switcher.member-set-switcher-top .member-set-options button[aria-pressed="true"] {
  border-color: color-mix(in srgb, var(--option-a) 32%, rgba(255,255,255,.07));
  color: var(--set-paper);
  background: linear-gradient(90deg, color-mix(in srgb, var(--option-a) 18%, transparent), color-mix(in srgb, var(--option-b) 8%, transparent));
  box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--option-a) 84%, white 8%), 0 0 18px color-mix(in srgb, var(--option-a) 10%, transparent);
}
.member-set-switcher.member-set-switcher-top .member-set-options button[aria-pressed="true"]::before {
  background: var(--option-a);
  box-shadow: 0 0 10px color-mix(in srgb, var(--option-a) 66%, transparent);
}
.member-set-switcher.member-set-switcher-top > p {
  grid-column: 3;
  margin: 0;
  padding-left: 14px;
  border-left: 1px solid rgba(255, 255, 255, .075);
  color: color-mix(in srgb, var(--set-muted) 68%, transparent);
  font-size: .6rem;
  line-height: 1.38;
}
html[data-page="members"] .member-set-switcher.member-set-switcher-top { margin-top: 10px !important; }
@media (max-width: 1080px) {
  .member-set-switcher.member-set-switcher-top { grid-template-columns: minmax(145px, .42fr) minmax(0, 1.58fr); }
  .member-set-switcher.member-set-switcher-top > p { display: none; }
}
@media (max-width: 760px) {
  .member-set-switcher.member-set-switcher-top { grid-template-columns: 1fr; gap: 8px; padding: 10px; }
  .member-set-switcher.member-set-switcher-top .member-set-switcher-copy {
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 0 2px 0 8px;
  }
  .member-set-switcher.member-set-switcher-top .member-set-switcher-copy > strong { font-size: .82rem; }
}
@media (max-width: 560px) {
  .member-set-switcher.member-set-switcher-top {
    width: min(calc(100% - 20px), 1280px) !important;
    margin-top: 8px !important;
    border-radius: 14px;
  }
  .member-set-switcher.member-set-switcher-top .member-set-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .member-set-switcher.member-set-switcher-top .member-set-options button { min-height: 33px; }
}
/* SWITCHER REDESIGN v0.12.0 END */
'''
css_path.write_text(css + override, encoding='utf-8')

js_path = Path('revive-member-sets.js')
js = js_path.read_text(encoding='utf-8')
js = re.sub(r"const ARCHIVE_VERSION = '[^']+';", "const ARCHIVE_VERSION = '0.12.0';", js, count=1)
js = re.sub(r"const ARCHIVE_BUILD = '[^']+';", "const ARCHIVE_BUILD = '012';", js, count=1)
js = js.replace("    switcher.style.margin = '18px auto 0';\n", '')
js = js.replace("    switcher.style.width = 'min(calc(100% - 40px), var(--max))';\n", '')
js = js.replace('<span>REVIVE+ version theme</span>', '<span>REVIVE+ edition</span>')
js_path.write_text(js, encoding='utf-8')

for html_name in ['index.html', 'members.html', 'eras.html', 'media.html']:
    path = Path(html_name)
    text = path.read_text(encoding='utf-8')
    match = re.search(r'<p class="footer-code">(.*?)</p>', text, flags=re.S)
    if not match:
        continue
    value = match.group(1).strip()
    value = re.sub(r'Archive build\s*·\s*\d+', 'Archive build · 012', value)
    value = re.sub(r'\s*·\s*v\d+(?:\.\d+){1,2}.*$', '', value)
    value = f'{value} · v0.12.0'
    text = text[:match.start()] + f'<p class="footer-code">{value}</p>' + text[match.end():]
    path.write_text(text, encoding='utf-8')
