import canvas, { Canvas, Image, createCanvas, createImageData, loadImage } from "canvas"
import JsBarcode from "jsbarcode"
//@ts-ignore
import qrcode from "qrcode";

enum WatermarkAlign {
    DIAGONALTD,
    HORIZONTAL,
    VERTICAL,
    DIAGONALDT,
}

export const deepCopyObj = (obj: any) => {
  if (obj === undefined) return;
  const newObj = JSON.parse(JSON.stringify(obj));
  return newObj;
}

export const createBarcode = (value: string, format?: string) => {
  const baseBarcode = createCanvas(100, 100);
  value = value ? value : "EMPTY_BARCODE";
  JsBarcode(baseBarcode, value, { format: format ? format : "CODE128" });
  const barcode64 = baseBarcode.toDataURL("image/jpeg").split(",")[1]
  return barcode64;
}

export const createQrCode = async (value: string, url?: string) => {
  let code = undefined;
  await qrcode.toDataURL(value).then((url: string) => code = url);
  return code;
}

export const createWatermark = async (value: string, hexColor: string, align: WatermarkAlign, docSize: number[]) => {
  let watermark: Canvas = canvas.createCanvas(docSize[0], docSize[1]);
  const ctx = watermark.getContext("2d");
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = hexColor;
  let [x, y] = [0, 0];

  let length: number = 0;
  let fontSize: number = 0;

  const diagonalLength = Math.sqrt(Math.pow(docSize[0], 2) + Math.pow(docSize[1], 2))

  switch (align) {
    case WatermarkAlign.DIAGONALDT:
      x = -docSize[1]*0.4;
      y = docSize[0]*0.9;
      fontSize = diagonalLength / value.length
      ctx.rotate(Math.PI / -4);
      break;
    case WatermarkAlign.DIAGONALTD:
      fontSize = diagonalLength / value.length
      x = docSize[1] * 0.2;
      y = 90;
      ctx.rotate(Math.PI / 4);
      break;
    case WatermarkAlign.VERTICAL:
      fontSize = (docSize[1] / value.length)
      x = docSize[1]*0.2;
      y=-(docSize[0]*0.4);
      ctx.rotate(90 * Math.PI/180);
      break;
    case WatermarkAlign.HORIZONTAL:
      x = docSize[0] * 0.1;
      y = docSize[1] * 0.5;
      fontSize = (docSize[0]/value.length)*1.3
      //const stringWidth = Math.sqrt(fontSize)
      break;
  }

  //Pythagorus to calculate diag length, then calculating the font size accordingly.
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(value, x, y);
  return await watermark.toDataURL();
}

export const getPdfFontsMappings = (font: string) => {
  const fontMaps = {
    normal: "",
    italic: "",
    bold: "",
    isStandard: false
  }
  switch (font) {
    case "Cairo":
      fontMaps.normal = "Regular",
        fontMaps.italic = "Regular",
        fontMaps.bold = "Bold"
      break;
    case "Times":
      fontMaps.normal = "Roman",
        fontMaps.italic = "Italic",
        fontMaps.bold = "Bold"
      break;
    case "Helvetica":
    case "Roboto":
    case "Courier":
      fontMaps.normal = "",
        fontMaps.italic = "Oblique",
        fontMaps.bold = "Bold"
      break;
  }
  switch (font) {
    case "Times":
    case "Helvetica":
    case "Courier":
      fontMaps.isStandard = true;
      break;
    default:
      fontMaps.isStandard = false;
  }
  return fontMaps;
}
