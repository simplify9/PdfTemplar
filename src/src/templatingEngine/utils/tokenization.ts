import { isTemplateVariable, getFunction } from "./textChecking"
import { MetaData } from 'src/userInterface/src/models/documentModels';

interface TextToken {
  stringValue: string,
  type: "variable" | "simple" | "functional",
  functionType?: string
  functionBody?: string
}

//let currentFuncTokenArr: string[] = [];

export const getTextTokens = (text: string, canvasPageProps: MetaData): TextToken[] => {
  let currentFuncBody: string | null = "";
  const tokens: TextToken[] = [];
  const textArr = text.split(' ');
  let isRedundant = false;

  let counter = 0;

  for (let textPiece of textArr) {
    // TODO: Make a smarter counter
    //if(counter >= currentFuncBody.split(" ").length) currentFuncBody = "";

    if (`(${currentFuncBody})`.includes(textPiece)) {
      continue;
    }


    if (isTemplateVariable(textPiece)) {
      tokens.push(
        {
          type: "variable",
          stringValue: textPiece
        }
      )
    }
    else if (getFunction(textPiece)) {
      const inBetween = getInBetween(text, "(", ")", text.indexOf(getFunction(textPiece)!));
      currentFuncBody = inBetween
      if (currentFuncBody && currentFuncBody.length > 1)
        tokens.push(
          {
            type: "functional",
            stringValue: getFunction(textPiece) + currentFuncBody,
            functionType: getFunction(textPiece)!,
            functionBody: currentFuncBody
          }
        )
      else throw (`Invalid Function:\n Function body invalid: Check brackets at ${textPiece}`)
    }
    else {
      //ignore space tokens, spaces should be embedded in simple tokens
      if (textPiece === " ") continue;
      //if the textPiece is part of the function, ignore it.
      if (!isRedundant) {
        tokens.push(
          {
            type: "simple",
            stringValue: textPiece
          }
        )
      } else isRedundant = false;
    }
    counter++;
  }
  return tokens;
}

let lastIdx = -1;
export const getInBetween = (
  subject: string, begSegment: string,
  endSegment: string, startIdx: number = 0
): string | null => {
  /*
      Example:
      IF(1 == 1, a, b) IF(2 == 2, a, b) IF(3 == 3, a, b)
      It would return the first one, add 1 to lastidx so that the next time
      the function is called, it would return the second, and so on for the third one.
      When eventually, lastIdx+1 is equal to the matches it would reset.
  */
  let result;
  if (startIdx) subject = subject.slice(startIdx);
  const regEx = new RegExp(`\\${begSegment}.*?\\${endSegment}`, "g")
  let match = subject.match(regEx);
  if (match) {
    if (getFunction(match[0])) {
      //To pull in the whole inner function
      const regEx = new RegExp(`\\${begSegment}.*\\${endSegment}`, "g")
      match = subject.match(regEx)!;
    }
    if (match.length > 1) {
      result = match[lastIdx++]
      if (lastIdx === match.length)
        lastIdx = 0;
    } else {
      lastIdx = 0;
      result = match[0];
    }
    result = result.replace(begSegment, "").replace(endSegment, "");
  }
  else return null

  return result;
}
