export interface ParsedError {
  type: string
  chineseType: string
  message: string
  lineNumber: number | null
  traceback: string
}

export interface ErrorLine {
  lineNumber: number
  userLine: string
  correctLine: string
}

const ERROR_TRANSLATIONS: Record<string, string> = {
  NameError: '变量未定义',
  SyntaxError: '语法错误',
  TypeError: '类型错误',
  ValueError: '值错误',
  IndexError: '索引越界',
  KeyError: '键不存在',
  AttributeError: '属性不存在',
  ImportError: '导入失败',
  ModuleNotFoundError: '模块未安装',
  IndentationError: '缩进错误',
  TabError: '缩进混用了空格和 Tab',
  ZeroDivisionError: '除以了零',
  FileNotFoundError: '文件不存在',
  RecursionError: '递归太深了',
  StopIteration: '迭代器已结束',
  OverflowError: '数值超出范围',
  RuntimeError: '运行时错误',
  NotImplementedError: '这个方法还没实现',
  AssertionError: '断言失败',
}

const NOX_EXPLANATIONS: Record<string, string> = {
  NameError: "你用了一个没定义的变量名。Python 找不到这个名字，就像你喊一个不存在的人。检查一下变量名有没有拼错，或者忘记赋值了。",
  SyntaxError: "代码的语法写错了，Python 看不懂。常见原因：少了冒号、括号不匹配、字符串没加引号。仔细看看出错的那一行。",
  TypeError: "你对某种类型的值做了不合适的操作。比如用数字和字符串相加，或者调用了不存在的方法。检查一下变量的类型。",
  IndentationError: "缩进不对！Python 用缩进来表示代码块，该缩进的地方没缩进，或者缩进多少不一致。同一代码块要对齐。",
  ValueError: "你给函数传了一个合法类型但值不合适的参数。比如 int('abc')，'abc' 不能转换成数字。",
  IndexError: "你想访问列表或元组中不存在的索引位置。比如列表只有 3 个元素，你却取第 5 个。索引从 0 开始。",
  KeyError: "你想从字典里取一个不存在的键。用 dict.get(key) 可以安全地取值，键不存在时返回 None 而不是报错。",
}

export function parsePythonError(errorDetail: string): ParsedError {
  const lines = errorDetail.split('\n')
  const lastLine = lines[lines.length - 1]?.trim() || ''

  const lineMatch = errorDetail.match(/line\s+(\d+)/)
  const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : null

  const errorMatch = lastLine.match(/^(\w+Error):\s*(.+)/)
  const errorType = errorMatch ? errorMatch[1] : 'Error'
  const errorMessage = errorMatch ? errorMatch[2] : lastLine

  return {
    type: errorType,
    chineseType: ERROR_TRANSLATIONS[errorType] || errorType,
    message: errorMessage,
    lineNumber,
    traceback: errorDetail,
  }
}

export function findErrorLines(
  userCode: string,
  correctCode: string,
  errorLineNumber: number | null,
): ErrorLine[] {
  if (!errorLineNumber) return []

  const userLines = userCode.split('\n')
  const correctLines = correctCode.split('\n')
  const idx = errorLineNumber - 1

  if (idx < 0 || idx >= userLines.length) return []

  return [
    {
      lineNumber: errorLineNumber,
      userLine: userLines[idx] || '',
      correctLine: correctLines[idx] || '',
    },
  ]
}

export function getNoxExplanation(errorType: string): string {
  return NOX_EXPLANATIONS[errorType] || '看起来代码有点小问题，仔细检查一下出错的地方，想想应该怎么写才对。'
}
