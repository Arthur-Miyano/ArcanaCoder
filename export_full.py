import re

def fmt_block(block):
    """Extract human-readable fields from a raw TS question block"""
    def gf(field):
        m = re.search(rf"\b{re.escape(field)}: '([^']*)'", block)
        return m.group(1).replace("\\n", "\n")[:200] if m else ""
    
    def gl(field):
        m = re.search(rf"{re.escape(field)}: \[([^\]]+)\]", block)
        return [x.strip(" '") for x in m.group(1).split(",")] if m else []
    
    lines = []
    qid = (re.search(r"id: '(\w+)'", block) or type("", (), {"group": lambda s: "?"})()).group(1)
    qtype = gf("type")
    
    lines.append(f"\n## {qid} ({qtype})")
    
    nt = gf("narrativeTitle")
    nd = gf("narrativeDesc")
    ne = gf("narrativeExplanation")
    
    if nt: lines.append(f"\n**叙事标题**: {nt}")
    if nd: lines.append(f"\n**叙事描述**: {nd}")
    
    desc = gf("description")
    if desc: lines.append(f"\n**题目**: {desc}")
    
    opts = gl("options")
    if opts:
        co = gf("correctOption")
        lines.append(f"\n**选项**:")
        for i, opt in enumerate(opts):
            lines.append(f"  {i}. {opt} {'✅' if str(i) == co else ''}")
    
    ic = gf("initialCode")
    if ic:
        lines.append(f"\n**初始源语**:")
        lines.append(f"```python\n{ic}\n```")
    
    cc = gf("correctCode")
    if cc:
        lines.append(f"\n**正确源语**:")
        lines.append(f"```python\n{cc}\n```")
    
    eo = gf("expectedOutput")
    if eo: lines.append(f"\n**预期回响**: `{eo}`")
    
    tcs = re.findall(r"\{ input: '([^']+)', expected: '([^']+)' \}", block)
    if tcs:
        lines.append(f"\n**试炼验证**:")
        for inp, exp in tcs:
            lines.append(f"  - `{inp}` → `{exp}`")
    
    exp = gf("explanation")
    if exp: lines.append(f"\n**解析**: {exp[:200]}")
    
    if ne: lines.append(f"\n**魔法解析**: {ne[:200]}")
    else: lines.append(f"\n**魔法解析**: ❌ 缺失")
    
    h = gf("hint")
    hr = gf("hintRoleplay")
    hd = gf("hintDirect")
    if h or hr or hd:
        lines.append(f"\n**诺克斯指引**:")
        if h: lines.append(f"  引导: {h}")
        if hr: lines.append(f"  朋友: {hr[:150]}")
        if hd: lines.append(f"  明示: {hd[:150]}")
    
    ce = re.findall(r"\{ pattern: '([^']+)', message: '([^']+)', noxHint: '([^']+)' \}", block)
    if ce:
        lines.append(f"\n**常见反噬**:")
        for pat, msg, nx in ce:
            lines.append(f"  - \"{pat}\": {msg}")
    
    lines.append("\n---")
    return "\n".join(lines)

# Read sections - BRACKET COUNTING approach
qts = open("F:/Agent/ArcanaCoder/src/data/questions.ts", encoding="utf-8").read()
# Find sections array start
ch_blocks = re.findall(r"id: '(\w+)',\s*\n\s*name: '([^']+)',", qts)
ch_ids = [b[0] for b in ch_blocks]
ch_names = [b[1] for b in ch_blocks]

# Parse sections using bracket counting
sections_data = {}
for ch_id in ch_ids:
    # Find this chapter's sections
    start = qts.find(f"id: '{ch_id}'")
    sec_start = qts.find("sections: [", start)
    if sec_start < 0:
        sections_data[ch_id] = []
        continue
    # Count brackets to find closing ]
    depth = 0
    secs = []
    for i in range(sec_start + 10, len(qts)):
        c = qts[i]
        if c == '[': depth += 1
        elif c == ']':
            if depth == 0:
                break
            depth -= 1
    sec_block = qts[sec_start:sec_start + i - sec_start + 1]
    # Extract individual section blocks
    sec_matches = re.findall(r"\{([^}]+)\}", sec_block)
    ch_secs = []
    for sm in sec_matches:
        sid = re.search(r"id: '(\w+)'", sm)
        sn = re.search(r"name: '([^']+)'", sm)
        unlock = re.search(r"unlockAfter: '(\w+)'", sm)
        qids = re.findall(r"'(\w+)'", sm[sm.find("questionIds:"):] if "questionIds:" in sm else "")
        if sid and sn:
            ch_secs.append((sid.group(1), sn.group(1), qids, unlock.group(1) if unlock else None))
    sections_data[ch_id] = ch_secs

def extract_questions(source_text):
    """Extract question blocks from a TS array, returning dict of {id: block_text}"""
    result = {}
    # Find all id declarations and extract surrounding blocks
    for m in re.finditer(r"id: '(\w+)'", source_text):
        qid = m.group(1)
        if qid in ("ch1_variables","ch2_lists","s1_vars","s1_types","s1_ops","s1_strings","s2_lists"):
            continue  # skip non-question IDs
        # Find the enclosing { } block by counting braces
        start = source_text.rfind("{", 0, m.start())
        if start < 0: continue
        depth = 0
        end = start
        for i in range(start, len(source_text)):
            if source_text[i] == '{': depth += 1
            elif source_text[i] == '}':
                depth -= 1
                if depth == 0:
                    end = i
                    break
        if end > start:
            result[qid] = source_text[start:end+1]
    return result

stage1 = extract_questions(open("F:/Agent/ArcanaCoder/src/data/stage1_questions.ts", encoding="utf-8").read())
backup = extract_questions(open("F:/Agent/ArcanaCoder/src/data/backup_questions.ts", encoding="utf-8").read())

# Generate output
out = []
def L(s=""): out.append(s)

L("# ArcanaCoder 完整题目清单")
L()

for ch_id in ch_ids:
    ch_name = {"ch1_variables":"语法圣殿 - 变量与类型","ch2_lists":"数据库森林 - 列表与循环"}.get(ch_id, ch_id)
    L(f"## {ch_name}")
    L()
    for sec_id, sec_name, qids, unlock in sections_data.get(ch_id, []):
        L(f"### {sec_name}（{len(qids)}试炼, {unlock or '无条件开放'}）")
        for qid in qids:
            block = stage1.get(qid) or backup.get(qid)
            if block:
                L(fmt_block(block))
            else:
                L(f"\n```\n{qid}: 数据缺失\n```\n---\n")

L("\n# 备用题库")
for qid in sorted(backup.keys()):
    if qid not in [q for secs in sections_data.values() for q in [x for s in secs for x in s[2]]]:
        L(fmt_block(backup[qid]))

open("F:/Agent/ArcanaCoder/题目审核清单_完整版.md", "w", encoding="utf-8").write("\n".join(out))
print(f"Done. {len(stage1)} stage1 + {len(backup)} backup questions written")
