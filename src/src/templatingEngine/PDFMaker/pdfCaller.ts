import pdfkit from "pdfkit"
import pdfMaker from './pdfMaker';
import { DocumentRoot } from 'src/userInterface/src/models/documentModels';

export default async (canvasPage: DocumentRoot, dataObjs: any) => {
    const doc = new pdfkit({
        bufferPages: false,
        autoFirstPage: true,
        margin: 0,
        size: canvasPage.metaData.documentSettings.size,
        compress: false,
        info: {
            Author: "PDF-Templar",
            Title: "Generated PDF",
            CreationDate: new Date()
        }
    });

    //for preview
    if(!dataObjs) dataObjs = [canvasPage.metaData.templateDataSample];

    if(!dataObjs.length) dataObjs = [dataObjs]

    for(let i = 0; i < dataObjs.length; i++){
        await pdfMaker(doc, canvasPage, canvasPage.metaData.documentSettings, dataObjs[i]);
        if(i === dataObjs.length - 1) break;
        doc.addPage();
    }
    doc.end();
    return doc;
}
