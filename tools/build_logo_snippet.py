"""Builds snippets/logo.liquid from the VELOURA logo kit SVG (outlined vector paths).
Usage: python3 tools/build_logo_snippet.py <path/to/Veloura_Signature.svg> veloura-theme/snippets/logo.liquid
Paints are driven by CSS custom properties so one vector logo serves Noir, Rosé and Signature treatments."""
import re, sys, xml.etree.ElementTree as ET
NS = '{http://www.w3.org/2000/svg}'
src, out = sys.argv[1], sys.argv[2]
root = ET.parse(src).getroot()
kids = [k for k in root if k.tag != NS + 'defs']
v_mark, swoosh, star, word, tagline, lines = kids

def paths(el, cls):
    res = []
    items = [el] if el.tag == NS + 'path' else list(el)
    for p in items:
        a = f' d="{p.get("d")}"'
        if p.get('transform'): a += f' transform="{p.get("transform")}"'
        sw = p.get('stroke-width') or el.get('stroke-width')
        if sw: a += f' stroke-width="{sw}"'
        res.append(f'<path class="{cls}"{a}/>')
    return ''.join(res)

parts = {
  'v': paths(v_mark, 'vl-paint'),
  'swoosh': '<g class="vl-stroke">' + paths(swoosh, 'vl-swoosh') + '</g>',
  'star': paths(star, 'vl-paint vl-star'),
  'word': paths(word, 'vl-paint'),
  'tag': paths(tagline, 'vl-solid'),
  'lines': f'<path class="vl-line" d="{lines.get("d")}" stroke-width="2"/>',
}
liquid = '''{%- comment -%}
  VELOURA vector logo (outlined paths from the brand logo kit).
  Params:
    variant: 'full' (monogram + wordmark + MINI PERFUMES) | 'mark' (V monogram) | 'wordmark' (VELOURA) | 'stacked' (monogram + wordmark)
    tone: 'theme' (follows active world) | 'noir' | 'rose' | 'signature' | 'ink' | 'light'
    class, label
  Colour is applied through CSS (assets/veloura-base.css → .vl-logo) using gradients defined once in snippets/svg-defs.liquid.
{%- endcomment -%}
{%- liquid
  assign variant = variant | default: 'wordmark'
  assign tone = tone | default: 'theme'
  case variant
    when 'full'
      assign vb = '230 56 1140 670'
    when 'mark'
      assign vb = '600 56 463 319'
    when 'stacked'
      assign vb = '230 56 1140 556'
    else
      assign vb = '232 448 1136 162'
  endcase
-%}
<svg class="vl-logo vl-logo--{{ variant }} vl-tone--{{ tone }}{% if class %} {{ class }}{% endif %}" viewBox="{{ vb }}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{{ label | default: shop.name | escape }}" focusable="false">
  {%- if variant == 'full' or variant == 'mark' or variant == 'stacked' -%}
    <g class="vl-logo__mark">__V____SWOOSH____STAR__</g>
  {%- endif -%}
  {%- if variant != 'mark' -%}<g class="vl-logo__word">__WORD__</g>{%- endif -%}
  {%- if variant == 'full' -%}<g class="vl-logo__tag">__TAG____LINES__</g>{%- endif -%}
</svg>
'''
for k, key in [('v','__V__'),('swoosh','__SWOOSH__'),('star','__STAR__'),('word','__WORD__'),('tag','__TAG__'),('lines','__LINES__')]:
    liquid = liquid.replace(key, parts[k])
open(out, 'w').write(liquid)
print('wrote', out, len(liquid))
