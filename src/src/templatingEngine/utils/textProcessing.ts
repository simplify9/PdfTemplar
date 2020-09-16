import { getFunction } from './textChecking';
import { handlers } from '../templateFunctions/functionFactory';
import { getFromDataList } from './dataListUtils';
import { getTextTokens } from './tokenization';
import { DocumentSettings, MetaData } from 'src/userInterface/src/models/documentModels';

const verifyFunction = (funcBody: string): string => {
  for (let i = 0; i < funcBody.length; i++)
    if (funcBody[i] === "")
      console.warn("Invalid function string");

  return funcBody;
}

export const runFunctionalText = (funcType: string, funcBody: string, canvasPageProps: MetaData): string => {
  funcBody = verifyFunction(funcBody);
  if (!funcBody) throw new Error("Invalid Function: - \n");
  let processedString = "";
  const functionToRun = handlers[funcType]
  try {
    processedString += functionToRun(funcBody, canvasPageProps);
  }
  catch (err) {
    throw new Error(err)
  }
  return processedString;
}

export const processText = (text: string, canvasPageProps: MetaData) => {
  const tokens = getTextTokens(text, canvasPageProps);
  const processedText: string[] = [];
  for (let token of tokens) {
    switch (token.type) {
      case "variable":
        processedText.push(fillText(token.stringValue, canvasPageProps));
        break;
      case "functional":
        processedText.push(runFunctionalText(token.functionType!, token.functionBody!, canvasPageProps));
        break;
      case "simple":
        processedText.push(token.stringValue)
        break;
    }
  }

  return processedText.join(' ');
}


export const fillText = (text: string, canvasPageProps: any): string => {
  let processedString = "";

  //getting the text in between double curly braces
  const lookUp = text.slice(2, -2);

  const filledText = getFromDataList(lookUp, canvasPageProps)

  //if the lookup was valid, fill it in. Otherwise, return empty string.
  if (filledText) processedString += filledText;

  return processedString;
}
