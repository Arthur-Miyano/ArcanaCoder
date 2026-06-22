import subprocess, sys

# 验证所有 code_fill 题的正确代码是否能跑通
tests = [
    ("ch1_02", 'spell = "Python"\nprint(spell)', "Python"),
    ("ch1_03", 'a = "你好"\nb = "世界"\nprint(f"{a}{b}")', "你好世界"),
    ("ch1_08", 'power_str = "100"\npower = int(power_str)\nprint(power + 50)', "150"),
    ("ch1_12", 'item = "魔法药水"\ncount = 3\nprice = 25\nprint(f"购买{count}瓶{item}，共需{count * price}金币")', "购买3瓶魔法药水，共需75金币"),
    ("ch1_15", 'r = 5\npi = 3.14\narea = pi * r ** 2\nprint(f"法阵半径{r}，覆盖面积{area}")', "法阵半径5，覆盖面积78.5"),
    # code_fix 题
    ("ch1_07", 'result = int("25") + 10\nprint(result)', "35"),
    ("ch1_10", 'print(f"我的魔力值是{80}")', "我的魔力值是80"),
    ("ch1_14", 'exp = 44\nexpToNext = 100\nprint(f"经验值：{exp}/{expToNext}")', "经验值：44/100"),
    # output_predict 题
    ("ch1_04", 'name = "诺克斯"\nprint(f"{name}正在注视着你")', "诺克斯正在注视着你"),
    ("ch1_09", 'a = 5\nb = "5"\nprint(a + int(b))', "10"),
    ("ch1_13", 'level = 1\nexp = 44\nprint(f"贤者Lv.{level} [{exp}/100]")', "贤者Lv.1 [44/100]"),
]

all_pass = True
for qid, code, expected in tests:
    r = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True)
    out = r.stdout.strip()
    err = r.stderr.strip()
    passed = out == expected and not err
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"[{status}] {qid}: expected={expected!r}, got={out!r}" + (f", err={err[:60]}" if err else ""))

print(f"\n{'ALL PASS' if all_pass else 'SOME FAILED'}")
