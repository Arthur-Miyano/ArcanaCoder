import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import type { Extension } from '@codemirror/state'

export const pythonExtensions: Extension[] = [python(), oneDark]
