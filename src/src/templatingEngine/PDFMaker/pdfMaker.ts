import templateEngine from '../templateEngine';
import path from "path"
import { createBarcode, getPdfFontsMappings, createWatermark } from '../../../util/generalUtils';
import jimp from "jimp";
import qrcode from "qrcode";
import { hasArabic } from '../utils/textChecking';
import { pixelToPt } from 'src/userInterface/src/utilities/unitConversion';
import {validateElement} from "../validation"
import { DocumentElement, LineElement, TextElement, DocumentSettings, DocumentRoot } from 'src/userInterface/src/models/documentModels';

const percentageToNumber = (percentage: string): number => {
  if (percentage)
    return Number((percentage).split('%')[0]);
  else
    throw (new Error("Invalid Percentage"));
}

const cssFontSizeToNumber = (size: string | number): number => {
  if (size && typeof size !== "number")
    return Number((size).split("pt")[0])

  return size != null && typeof size === "number" ? size : 14;
}

const wrapText = (text: string, charLimit: number): string[] => {
  const expression = new RegExp(`.{1,${charLimit}}`, 'g');
  const matches = text.match(expression);
  if (matches) return matches;
  return [text]
}

const processFont = (font: string, e: TextElement) => {
  const fontMappings = getPdfFontsMappings(font);
  if (e.props.fontWeight === "bold") {
    font += "-" + fontMappings.bold;
    if (e.props.fontStyle === "italic") {
      font += fontMappings.italic;
    }
  }
  else if (e.props.fontStyle === "italic") {
    font += "-" + fontMappings.italic;
  }
  else {
    if (fontMappings.normal)
      font += "-" + fontMappings.normal;
  }

  if (!fontMappings.isStandard) {
    font = path.join(__dirname, `fonts/${font}.ttf`)
  }

  return font;
}

const getCoordinates = (child: DocumentElement, settings: DocumentSettings) => {
  let processedLeft = -1, processedTop = -1;

  if (child.props) {
    processedLeft = child.props.position.leftOffset / 100;
    processedTop = child.props.position.topOffset / 100;
  }


  let width, height = 0
  if (child.type !== "text" && child.type !== "watermark") {
    width = child.props.width as number;
    height = child.props.height as number
  }

  const coords: { x: number, y: number, w?: number, h?: number } = {
    x: processedLeft * settings.size[0],
    y: processedTop * settings.size[1],
  }

  //Checking that both coordinates have been calculated
  // can't use !( top && left ) because they can be 0
  if (processedLeft === -1 || processedTop === -1)
    throw (new Error("Invalid style for coordinates"))

  if (width && height) {
    coords.w = width;
    coords.h = height;
  }
  return coords;

}


type Mutation = (doc: PDFKit.PDFDocument, settings: DocumentSettings) => void;
type MutationFactory = (e: DocumentElement) => Promise<Mutation>;

const handlers: { [k: string]: MutationFactory } = {
  "qrcode": (e) => e.type === "qrcode" && e.props.value? qrcode.toDataURL(e.props.value).then(
    (url: string) => {
      const source = url.split(",")[1];
      const imageBuffer = new Buffer(source, "base64");
      return jimp.read(imageBuffer).then(
        (img: any) => (doc: PDFKit.PDFDocument, settings: DocumentSettings) => {
          let { x, y, w, h } = getCoordinates(e, settings);
          img.getBase64(jimp.MIME_JPEG, (err: any, res: any) => {
            if (!err)
              doc.image(res,
                x, y, {
                width: w,
                height: h
              })
          })
        }
      )
    }

  ) : Promise.resolve((doc, settings) => { throw new Error(`${e.name} is not a valid QR element.`) }),

  "image": (e) =>
    e.type === "image"?
      e.props.value.includes("default://") ?
        Promise.resolve((doc, settings) => {
          let source = "";
          let { x, y, w, h } = getCoordinates(e, settings);
          const rotation = e.props.rotation;
          source = e.props.value.replace("default://", "");
          doc.image(source, x, y, {
            width: Number(w),
            height: Number(h)
          })
        }) :

        e.props.value.includes("http") ?
          jimp.read(e.props.value).then(
            (img: any) => (doc: PDFKit.PDFDocument, settings: DocumentSettings) => {
              let { x, y, w, h } = getCoordinates(e, settings);
              const rotation = e.props.rotation;
              if (img.bitmap.width > 1200) img.resize(1200, jimp.AUTO);
              if (img.bitmap.height > 1200) img.resize(jimp.AUTO, 1200);
              img.rotate(rotation);
              if (rotation / 90 % 2 !== 0) [w, h] = [h, w];

              img.getBase64(jimp.MIME_PNG, (err: any, res: any) => {
                img.quality(100);
                if (!err) {
                  doc.image(res, x, y, {
                    width: Number(w),
                    height: Number(h)
                  })
                }
              })
            }
          ) :
          Promise.resolve((doc, settings) => { if (e.props.value) throw new Error(`${e.props.value} is not a valid image source`) }) :
      Promise.resolve((doc, settings) => { throw new Error(`${e.name} is not a valid image element`) }),

  "text": (e) => e.type === "text" ? Promise.resolve((doc, settings) => {
    let font = processFont(e.props.fontFamily, e);
    const { x, y } = getCoordinates(e, settings);
    let align = "left";
    let text = e.props.value as string;
    let textArr: string[] = [];

    if (hasArabic(text)) {
      //align = "right";
      if (!font.includes("Cairo")) {
        font = processFont("Cairo", e);
      }
      text = text.split(" ").reverse().join("  ");
    }
    const splitText: string[] = e.props.value!.split("\\n")
    for (let parText of splitText) {
      if (e.props.charLimit && parText.length > e.props.charLimit) {
        for (let wrapped of wrapText(parText, e.props.charLimit))
          textArr.push(wrapped);
      }
      else textArr.push(parText);
    }

    doc.font(font)
      .fontSize(e.props.fontSize)
      .fillColor(e.props.fontColor);

    if (textArr && textArr.length > 0) {
      let newLineY = 0;
      for (let textPiece of textArr) {
        doc.text(textPiece, x, y + newLineY, { lineBreak: true, align: align })
        newLineY += e.props.fontSize + 2;
      }
    }
    else doc.text(text, x, y, { lineBreak: true, align: align });

  }) : Promise.resolve((doc, settings) => { throw new Error(`${e.name} is not a valid text element`) }),

  "barcode": (e) => e.type === "barcode" ? Promise.resolve(
    (doc: PDFKit.PDFDocument, settings: DocumentSettings) => {
      const { x, y, w, h } = getCoordinates(e, settings);
      const barcode64 = createBarcode(e.props.value, e.props.codeFormat)
      const barcodeBuffer = new Buffer(barcode64, "base64")
      doc.image(barcodeBuffer, x, y, {
        width: w,
        height: h
      });
    }) : Promise.resolve((doc, settings) => { throw new Error(`${e.name} is not a valid barcode element`) }),

  "line": (e) => e.type === "line" ? Promise.resolve(
    (doc: PDFKit.PDFDocument, settings: DocumentSettings) => {
      const { x, y, w, h } = getCoordinates(e, settings);

      doc.moveTo(x, y)
      if (h! > w!) doc.lineTo(x, y + h!)
      else doc.lineTo(x + w!, y);

      doc
        .strokeColor(e.props.strokeColor)
        .lineWidth(e.props.strokeWidth / 2)
        .stroke()
    }
  ) : Promise.resolve((doc, settings) => { throw new Error(`${e.name} is not a valid line element`) }),

  "rectangle": (e) => e.type === "rectangle" ? Promise.resolve(
    (doc, settings) => {
      const { x, y, w, h } = getCoordinates(e, settings);
      doc
        .rect(x, y, w!, h!)
        .strokeColor(e.props.strokeColor)
        .fillColor(e.props.fillColor)
        .lineWidth(cssFontSizeToNumber(e.props.strokeWidth))
        .fillAndStroke()
    }
  ) : Promise.resolve((doc, settings) => { throw new Error(`${e.name} is not a valid rectangle element`) }),
  "watermark": (e) => e.type === "watermark"? Promise.resolve(
    (doc,settings) => {
      const { x, y, w, h } = getCoordinates(e, settings);
      createWatermark(e.props.value, e.props.color, e.props.align, settings.size).then(val => {
        doc.image(val, x, y, {});
      });
    }
  ) : Promise.resolve((doc,settings) => { throw new Error(`${e.name} is not a valid watermark element`) })
}

export default async (doc: PDFKit.PDFDocument, canvasPage: DocumentRoot | String, canvasSettings: DocumentSettings, dataObj?: any) => {
  if (typeof canvasPage === "string") {
    canvasSettings = JSON.parse(canvasPage as string).settings
    canvasPage = JSON.parse(canvasPage as string).template
  }
  canvasSettings = canvasSettings as DocumentSettings;
  canvasPage = canvasPage as DocumentRoot;

  const processedCanvas: DocumentRoot = dataObj && typeof canvasPage !== "string"
    ? templateEngine(canvasPage, dataObj)
    : templateEngine(canvasPage, canvasPage.metaData.templateDataSample);


  const promises: Promise<Mutation>[] = Object.values(processedCanvas.elements).map(c => handlers[c.type](c));

  const mutations = await Promise.all(promises);

  for (const m of mutations) m(doc, canvasSettings);

  return doc;

}




