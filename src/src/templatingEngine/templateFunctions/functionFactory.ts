import { templateForEach, templateIf, templateDate } from './templateFunctions'
import { MetaData } from 'src/userInterface/src/models/documentModels'

type FunctionFactory = (text: string | string[], canvasPageProps: MetaData) => string

export const handlers: { [functionType: string]: FunctionFactory } = {
  "FOREACH": (text, canvasPageProps) => templateForEach(text as string, canvasPageProps),
  "IF": (text, canvasPageProps) => templateIf(text as string, canvasPageProps),
  "DATE": (text, canvasPageProps) => templateDate(text as string, canvasPageProps),
  "FOR": (text, canvasPageProps) => "NOT IMPLEMENTED"
}
