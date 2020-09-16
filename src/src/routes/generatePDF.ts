import pdfMaker from "../templatingEngine/PDFMaker/pdfMaker";
import validator from "../templatingEngine/validation";
import { Router } from 'express';
import { OK, BAD_REQUEST } from 'http-status-codes';
import pdfCaller from '../../src/templatingEngine/PDFMaker/pdfCaller';


const router = Router();

router.options('/', async (req, res) => {
    return res.end()
})

router.post('/', async (req, res) => {
  try {
    let template = req.body.template;
    let dataObj = req.body.dataObj;
    if(typeof req.body.template === "string"){
        template = JSON.parse(req.body.template);
        if(template.template) template = template.template;
    }

    const errors = validator(template);
    if (errors.length > 0){
        return res.status(400).end(String(errors));
    }

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "inline; filename=generatedPDF.pdf")
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(OK);


    const doc = await pdfCaller(template, dataObj)
    doc!.pipe(res);
  }
  catch(err) {
    console.log(String(err));
      res.status(500).end(String(err));
  }

});

export default router;
