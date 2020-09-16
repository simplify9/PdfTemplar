import { deepCopyObj } from "../../util/generalUtils"
import { processText } from "./utils/textProcessing";
import { DocumentRoot } from 'src/userInterface/src/models/documentModels';

export default (canvasPage: DocumentRoot, dataObj: any): DocumentRoot => {
    const processedCanvasPage: DocumentRoot = deepCopyObj(canvasPage);
    if(dataObj)
        processedCanvasPage.metaData.templateDataSample = dataObj

    for(let element of Object.values(processedCanvasPage.elements))
        if((element.type === "text" || element.type === "barcode" || element.type === "qrcode") && element.props)
            element.props.value = processText(element.props.value, processedCanvasPage.metaData.templateDataSample)

    if(processedCanvasPage) return processedCanvasPage;
    else throw(new Error("Something went wrong"))
}
