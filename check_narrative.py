import re

f = open("F:/Agent/ArcanaCoder/src/data/stage1_questions.ts", encoding="utf-8")
s = f.read()
f.close()

ids = re.findall(r"id: '([^']+)'", s)
titles = re.findall(r"narrativeTitle: '([^']+)'", s)
descs = re.findall(r"narrativeDesc: '([^']+)'", s)

print(f"总题数: {len(ids)}")
print(f"有 narrativeTitle: {len(titles)}")
print(f"有 narrativeDesc: {len(descs)}")

# check which IDs have no narrative
has_title = set()
has_desc = set()
for m in re.finditer(r"id: '(\w+)'.*?narrativeTitle:", s, re.DOTALL):
    # find the id that precedes this narrativeTitle
    block = s[:m.start()]
    prev_id = re.findall(r"id: '(\w+)'", block)
    if prev_id:
        has_title.add(prev_id[-1])

# Simpler approach: just find all question blocks and check
import json
