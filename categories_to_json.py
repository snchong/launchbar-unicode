#!/usr/bin/env python3

"""
Convert the Categories.txt file (see xhttps://www.unicode.org/notes/tn36/) to a JSON file, and add in LaTeX info.
"""

from collections import OrderedDict
import json



latexfile = open("latex.txt", "r")
latex = {}
for l in latexfile:
    (ltx, ch,h) = l.rstrip('\n').split('\t')
    # if len(ch) == 1:
    #     h = hex(ord(ch))
    # elif len(ch)==2:
    #     h = hex(ord(ch[1]))
    # else:
    #     h = "XXX"
    # print("%s\t%s\t%s"%(ltx,ch,h))
    latex[int(h,16)] = ltx


out = []
used = set()

charinfo= open("Categories.txt", "r")
for r in charinfo:
    (code, gc, level1, level2, level3, level4, name) = r.rstrip('\n').split('\t')
    d = OrderedDict()
    d['code'] = code
    d['name'] = name
    d['gc'] = gc
    d['level1'] = level1
    d['level2'] = level2
    d['level3'] = level3
    d['level4'] = level4
    ch = int(code, 16)
    if ch in latex:
        d['latex'] = latex[ch]
        used.add(ch)

    out.append(d)


charinfo.close()

print(json.dumps(out))

for ltx in latex:
    if ltx not in used:
        print("Unused: %s, %s"%(ltx, latex[ltx]))