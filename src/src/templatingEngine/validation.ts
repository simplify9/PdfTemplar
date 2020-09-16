import templateRunner from "../templatingEngine/templateEngine"
import { DocumentRoot, DocumentElement } from 'src/userInterface/src/models/documentModels';


const templateValidation = (templateData: DocumentRoot) => {
  let errors: Error[] = [];
  try {
    const { elements, name } = templateData;

    if (!elements) errors.push(new Error("Invalid children\n"))

    for (let element of Object.values(elements)) {
      const elemErrors = validateElement(element, element.type);
      if (elemErrors.length > 0) errors = errors.concat(elemErrors);
    }
  }
  catch (err) {
    errors.push(new Error("Missing root properties\n" + err))
  }
  return errors;
}

export const validateElement =
  (element: DocumentElement,
    type: "image" | "text" | "qrcode" |
      "barcode" | "rectangle" | "line" | "watermark"): Error[] => {

    const errors: Error[] = [];
    const missingProps: string[] = [];

    const textProps =
      ["value", "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontColor", "hyperLink"];
    const drawnProps =
      ["width", "height", "rotation", "transformOrigin", "aspectRatio"];
    const rectangleProps =
      ["aspectRatio", "strokeWidth", "width", "height", "fillColor", "strokeColor"];
    const imageProps =
      drawnProps.concat(["value"]);
    const codeProps =
      drawnProps.concat(["value", "codeFormat"]);
    const lineProps =
      ["strokeWidth", "strokeColor", "width", "aspectRatio", "height", "coordinates"];

    if (!element.props) errors.push(new Error("No props"));

    const propKeys = Object.keys(element.props);
    let valid = true;
    switch (type) {
      case "barcode":
      case "qrcode":
        codeProps.forEach(key => {
          if (!propKeys.includes(key)) {
            missingProps.push(key)
          }
        })
        break;
      case "image":
        imageProps.forEach(key => {
          if (!propKeys.includes(key)) {
            missingProps.push(key)
          }
        });
        break;
      case "text":
        textProps.forEach(key => {
          if (!propKeys.includes(key)) {
            missingProps.push(key)
          }
        });
        break;
      case "rectangle":
        rectangleProps.forEach(key => {
          if (!propKeys.includes(key)) {
            missingProps.push(key)
          }
        });
        break;
      case "line":
        lineProps.forEach(key => {
          if (!propKeys.includes(key)) {
            missingProps.push(key)
          }
        });
        break;
      default:
        valid = false;
    }

    if (missingProps.length > 0) {
      errors.push(
        new Error(`${element.name} with index ${element.index} is not a valid element, it is missing properties: ${missingProps.toString()}`)
      )
    }

    return errors;


  }

export default (template: any) => {
  let errors: Error[] = [];

  let templateData: any = null;
  try {
    if (typeof template === "string")
      templateData = JSON.parse(template);
    else templateData = template;
  }
  catch (err) {
    errors.push(new Error("Invalid JSON for template\n" + template))
  }
  if (templateData) {
    errors = errors.concat(templateValidation(templateData))
  }

  return errors;
}
