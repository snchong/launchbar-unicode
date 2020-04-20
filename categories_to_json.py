#!/usr/bin/env python3

"""
Convert the Categories.txt file (see xhttps://www.unicode.org/notes/tn36/) to a JSON file
"""

from collections import OrderedDict
import json

out = []

charinfo= open("Categories.txt", "r")
for r in charinfo:
    (code, gc, level1, level2, level3, level4, name) = r.rstrip('\n').split('\t')
    d = OrderedDict()
    d['code'] = code
    d['name'] = name
    d['level1'] = level1
    d['level2'] = level2
    d['level3'] = level3
    d['level4'] = level4

    out.append(d)


charinfo.close()

print(json.dumps(out))