import { useState, useEffect } from "react";
import JsBarcode from "jsbarcode"
import { createCanvas, Canvas} from "canvas"
import { CanvasState } from "../models/stateModels";
import { DocumentElement, WatermarkAlign } from "../models/documentModels";
import qrcode from "qrcode";
import { pixelToPt } from "./unitConversion";

export const deepCopyObj = (obj: any) => {
    if(obj === undefined) return;
    const newObj = JSON.parse(JSON.stringify(obj));
    return newObj;
}


export const createWatermark = async (value: string, hexColor: string, align: WatermarkAlign, docSize: number[]) => {
  let watermark: Canvas = createCanvas(docSize[0], docSize[1]);
  const ctx = watermark.getContext("2d");
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = hexColor;
  let [x, y] = [0, 0];

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

export const handleImageInputChange = (
  url: string, 
  callback: Function,
  docSize: number[]): void => {
  //Creating a file reader and an image, to easily scale down the image
  const img = new Image()
  let dimensions = [0,0]
  img.onload = function(){
      dimensions = [pixelToPt(img.naturalWidth), pixelToPt(img.naturalHeight)]
      let multiple;
      if (dimensions[0] > docSize[0]/1.5){
          multiple = docSize[0]/1.5/dimensions[0];
      }
      else if (dimensions[1]/1.5 > docSize[1]){
          multiple = docSize[1]/1.5/dimensions[1];
      }

      if (multiple) dimensions = [dimensions[0] * multiple, dimensions[1] * multiple];

      callback(dimensions);
      return dimensions
  }
  img.src = url;
}

export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] 
  );
  return debouncedValue;
}

export const getFocusedElement = (canvas: CanvasState) => {
  return canvas.document.elements[canvas.focusedElement];
}

export const cssPtToNum = (css: any): number => {
  if(typeof(css) === "string"){
    if(css.includes("pt"))
      return Number(css.split("pt")[0]);
    else
      throw Error("Not a pt")
  }
  if(typeof(css) === "number"){
    return css;
  }
  if(css === null){
    return 0;
  }

  throw Error("Not valid CSS")

}

export const refreshIndices = (arr: DocumentElement[]) => {
  for(let i = 0; i < arr.length; i++){
    arr[i].index = i;
    arr[i].name = arr[i].name.slice(0, -1) + String(i);
  }
  
  return arr;
}

export const createQrCode = async (value: string, url?: string) => {
  let code = "";
  await qrcode.toDataURL(value).then((url: string) => code = url);
  return code;
}

export const createBarcode = (value: string, format?: string) => {
  const baseBarcode = createCanvas(100, 100);
  try{
    JsBarcode(baseBarcode, value, {format: format? format : "CODE128"});
    const barcode64 = baseBarcode.toDataURL("image/jpeg")
    return barcode64;
  }catch(err){
    JsBarcode(baseBarcode, "placeholder")
    const barcode64 = baseBarcode.toDataURL("image/jpeg")
    return barcode64;
  }
}

export const hexColorToRGB = (hex: string | null | undefined) => {
  let [r, g, b] = [255, 255, 255]
  if(hex){
    r = parseInt(hex.slice(1,3), 16)
    g = parseInt(hex.slice(3,5), 16)
    b = parseInt(hex.slice(5,7), 16)
  }
  return [r, g, b]
}

export const cssPercentageToNumber = (size: string | number) => {
  if(typeof size !== "number") size = Number(size.split("%")[0]);
  return size;
}
 

export function throttle(fn: Function, delay: number) {
  let lastCall = 0;
  return function (...args: any) {
    args[0].stopPropagation();
    const now = (new Date()).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}
