import re
import json

data = open('data.js', 'r', encoding='utf-8').read()

styles = {
  'Swift': 'bottom: 23%; left: 51%; transform: translateX(-50%) rotate(-3deg);',
  'i20': 'bottom: 25%; left: 52%; transform: translateX(-50%) rotate(2deg);',
  'Nexon EV': 'bottom: 21%; left: 51%; transform: translateX(-50%) rotate(-3deg);',
  'City': 'bottom: 22%; left: 52%; transform: translateX(-50%) rotate(3deg);',
  'Baleno': 'bottom: 23%; left: 50%; transform: translateX(-50%) rotate(-2deg);',
  'XUV700': 'bottom: 12%; left: 75%; transform: translateX(-50%) rotate(2deg);',
  'Seltos': 'bottom: 15%; left: 25%; transform: translateX(-50%) rotate(-3deg);',
  'Innova Crysta': 'bottom: 21%; left: 49%; transform: translateX(-50%) rotate(-3deg);',
  'Ertiga': 'bottom: 22%; left: 50%; transform: translateX(-50%) rotate(-3deg);',
  'Taigun': 'bottom: 21%; left: 50%; transform: translateX(-50%) rotate(-3deg);',
  'Punch': 'bottom: 21%; left: 52%; transform: translateX(-50%) rotate(3deg);',
  'Hector': 'bottom: 20%; left: 50%; transform: translateX(-50%) rotate(-3deg);',
  'Creta': 'bottom: 20%; left: 50%; transform: translateX(-50%) rotate(-3deg);',
  'Jazz': 'bottom: 23%; left: 49%; transform: translateX(-50%) rotate(-3deg);',
  'Harrier': 'bottom: 21%; left: 50%; transform: translateX(-50%) rotate(-3deg);'
}

for model, style in styles.items():
    pattern = r'(model:\s*\"' + model + r'\"[\s\S]*?image:\s*\"[^\"]+\",)'
    replacement = r'\1\n    plateStyle: "' + style + '",'
    data = re.sub(pattern, replacement, data)

open('data.js', 'w', encoding='utf-8').write(data)
print('Updated data.js')
