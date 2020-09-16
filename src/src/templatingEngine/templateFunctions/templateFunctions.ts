import { getFromDataList } from '../utils/dataListUtils';
import { processText, runFunctionalText } from '../utils/textProcessing';
import { MetaData } from 'src/userInterface/src/models/documentModels';
import { isTemplateVariable } from '../utils/textChecking';

const calculateCondition = (condition: string, canvasPageProps: MetaData): boolean | null => {
  const getOp = (condition: string): string | undefined => {
    const operators = [">", ">=", "<", "<=", "==", "!="];
    for (let i = 0; i < operators.length; i++)
      if (condition.includes(operators[i]))
        return operators[i];
  }

  const isEmpty = (variable: any) => {
    // 0 is handled by previous handlers
    if (variable.length) if (variable.length > 0) return false;
    if (variable) return false;
    return true;
  }

  const operator = getOp(condition);
  if (!operator) {
    return condition ? true : false;
  }

  let [variable1, variable2]: any[] = condition.split(operator);

  variable1 = processText(variable1, canvasPageProps);
  variable2 = processText(variable2, canvasPageProps);

  if (Number(variable1)) {
    variable1 = Number(variable1);
  }
  if (Number(variable2)) {
    variable2 = Number(variable2);
  }
  else if (variable2 == "EMPTY") {
    switch (operator) {
      case "==":
        return isEmpty(variable1);
      case "!=":
        return !isEmpty(variable2);
      default:
        throw new Error("Invalid EMPTY usage");
    }
  }

  switch (operator) {
    case ">":
      if (variable1 > variable2)
        return true;
      return false;
    case ">=":
      if (variable1 >= variable2)
        return true;
      return false;
    case "<":
      if (variable1 < variable2)
        return true;
      return false;
    case "<=":
      if (variable1 <= variable2)
        return true;
      return false;
    case "==":
      if (variable1 == variable2)
        return true;
      return false;
    case "!=":
      if (variable1 != variable2)
        return true;
      return false;
    default:
      return false;
  }
}

export const templateIf = (funcBody: string, canvasPageProps: MetaData): string => {
  // IF(condition, ifTrue, ifFalse)
  // conditions:
  // '>' | '<' | ">=" | "<=" | "==" | "!="

  let processedText = "";

  const parameteres = funcBody.split(",");
  const [condition, ifTrue, ifFalse, ...extra] = parameteres;

  const processedCondition = processText(condition, canvasPageProps)

  const conditionResult = calculateCondition(processedCondition, canvasPageProps);
  if (conditionResult === null) {
    throw (`Invalid Condition operator at function IF(${funcBody})\n
               Refer to the guide for valid operators`)
  }

  if (conditionResult) processedText = processText(ifTrue, canvasPageProps);
  else processedText = processText(ifFalse, canvasPageProps);

  return processedText;
}

export const templateForEach = (funcBody: string, canvasPageProps: MetaData): string => {
  // FOREACH(element, array, action)
  // action could be another faction, or text. 
  // If the text contains the element, 
  // it would replace the element with array elements.


  let processedText = "";
  const parameteres = funcBody.split(",");

  const space = parameteres.slice(-1)[0] === '' ? ' ' : '';
  const [element, elements, action, ...extra] = parameteres;

  let processedAction = action;
  for (let segment of extra) {
    processedAction += ',' + segment;
  }

  let i = 0;
  const elementArray: any[] = getFromDataList(elements.trim(), canvasPageProps);

  if (elementArray) {
    for (let elementPiece of elementArray) {
      processedText += processedAction.replace(new RegExp(element, "g"), elementPiece)
        .replace('&&', String(i)) + space;
      i++;
    }
  }
  else throw (`Invalid array: Array ${elements.trim()} does not exist in data object\n`)

  return processText(processedText, canvasPageProps)
}


const formatDate = (dateTime: string, formatCode: string): string => {
  const dateObj = new Date(dateTime);
  let date: string;

  switch (formatCode) {
    case "f":
      date = dateObj.toTimeString();
    default:
      date = dateObj.toUTCString().slice(0, -3);
  }

  return date;
}

export const templateDate = (funcBody: string, canvasPageProps: MetaData): string => {
  // DATE(originalDate, dateFormat)
  //Reformat date to be human friendly 

  const parameteres = funcBody.split(",");
  if (funcBody.length < 1) throw new Error("Invalid parameters for Date");
  let originalDate = parameteres[0].trim();


  let dateFormat = "xx";
  if(funcBody.length > 1)
    dateFormat = funcBody[1].trim()

  if (isTemplateVariable(originalDate)){
    originalDate = processText(originalDate, canvasPageProps)
  }

  let date = formatDate(originalDate, dateFormat);

  return date;
}
