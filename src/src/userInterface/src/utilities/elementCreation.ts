import { DocumentElement, LineElement } from "../models/documentModels"
import { pixelToPt, ptToPixel } from "./unitConversion";


const getCoordinatesNoEvent = (node: DocumentElement, heightOffSet: number = 0, widthOffSet: number = 0) => {
    const pdfCreator = document.getElementById("PdfCreator")!;
    const elem = document.getElementById(node.name)!;

    heightOffSet = ptToPixel(heightOffSet)
    widthOffSet = ptToPixel(widthOffSet)

    const [x, y] = [
        elem.offsetLeft - widthOffSet,
        elem.offsetTop  - heightOffSet
    ]

    return [x/pdfCreator.offsetWidth * 100, y/pdfCreator.offsetHeight * 100]
}


const getCoordinates = (event: React.DragEvent<HTMLDivElement>, getAsPixels?: boolean) => {
    const canvasData = document.getElementById("PdfCreator")!.getBoundingClientRect();
    const canvasElem = document.getElementById("PdfCreator")!.offsetTop;
    const [x, y] = [
        event.pageX - canvasData.left,
        event.pageY - canvasElem
    ]

    if(getAsPixels)
        return [pixelToPt(x),pixelToPt(y)]
    
    return [x/canvasData.width * 100, y/canvasData.height * 100]
}

export const getRelativeCoordinates = (event: MouseEvent, node: DocumentElement, id?: string) => {
    const [x, y] = [pixelToPt(event.offsetX), pixelToPt(event.offsetY)]
    return [x,y]
}

export const createQrNode = async (event: React.DragEvent<HTMLDivElement>, elementNumber: number, qrValue?: string) => {
    //const qrCode64 = await createQrCode("placeholder");
    const [x, y] = getCoordinates(event);
    let r = Math.random().toString(36).substring(7)
    const qrNode: DocumentElement = {
        name: "qrCode-" + r,
        type: "qrcode",
        index: elementNumber,
        props: {
          codeFormat: "qr",
          position: {
              leftOffset: x,
              topOffset: y,
              percentage: true
          },
          className: "ImagePdfElement",
          rotation: 0,
          placeholder: true,
          value: "placeholder",
          width: 100,
          height: 100,
          aspectRatio: 1,
          transformOrigin: "top left"
      }
    };

    return qrNode;

}

export const createLineNode = (event: React.DragEvent<HTMLDivElement>, elementNumber: number): LineElement => {
    const [x, y] = getCoordinates(event, true);
    let r = Math.random().toString(36).substring(7)
    const lineNode: DocumentElement = {
      name: "line-" + r,
      type: "line",
      props: {
        position: {
            leftOffset: 0,
            topOffset: 0,
            percentage: true
        },
        className: "LinePdfElement",
        coordinates: {
          x1: x,
          y1: y,
          x2: null,
          y2: null
        },
        height: 100,
        width: 100,
        aspectRatio: 1,
        placeholder: true,
        strokeWidth: 4,
        strokeColor: "#000000"
      },
      index: elementNumber
    };

    return lineNode;
}

export const resizeLineNodeContainer = (event: MouseEvent, lineNode: LineElement ) => {
    let [x2, y2] = getRelativeCoordinates(event, lineNode);

    const widthDiff = x2-lineNode.props.coordinates.x1;
    let width = widthDiff < 0? widthDiff * -1 : widthDiff;
    if(width < 20) {
        width = 2;
    }
    const heightDiff = y2-lineNode.props.coordinates.y1;
    let height = heightDiff < 0? heightDiff * -1 : heightDiff;
    if(height < 20){
        height = 2;
    }
    const node: LineElement  = {
        ...lineNode,
        props: {
            ...lineNode.props,
            position: {
                  leftOffset: lineNode.props.coordinates.x1,
                  topOffset: lineNode.props.coordinates.y1,
                  percentage: false
            },
            placeholder: false,
            width: width,
            height: height
        }
    }
    return node;
}

export const finishLineNode = (event: MouseEvent, lineNode: LineElement ) => {
    let [x1, y1] = [0, 0];
    let [x2, y2] = getRelativeCoordinates(event, lineNode);

    const widthDiff = x2-lineNode.props.coordinates.x1;
    let width = widthDiff;

    const heightDiff = y2-lineNode.props.coordinates.y1;
    let height = heightDiff;

    // for inverted lines
    let alteredHeight = false;
    if(heightDiff < 0){
        alteredHeight = true;
        height = height * -1;
        y2 = height;
    }
    else {
        y2 = height;
    }
    let alteredWidth = false;
    if(widthDiff < 0){
        alteredWidth = true;
        width = width * -1;
        x2 = width;
    }
    else {
        x2 = width;
    }

    if(width < height) {
        width = 2;
        x2 = 0;
    }
    else  {
        height = 2;
        y2 = 0;
    }

    const [newLeft, newTop] = getCoordinatesNoEvent(lineNode, (alteredHeight? height : 0), (alteredWidth? width : 0))

    const node: DocumentElement = {
        ...lineNode,
        props: {
          ...lineNode.props,
          placeholder: false,
          position: {
            topOffset: newTop,
            leftOffset: newLeft,
            percentage: true
          },
          width: width,
          height: height,
          coordinates: {
              x1: x1,
              y1: y1,
              x2 : x2,
              y2 : y2
          }
        }
    }
    return node;
}

export const createRectangleNode = (event: React.DragEvent<HTMLDivElement>, elementNumber: number, rectangleValue?: string) => {
    const [x,y] = getCoordinates(event);
    let r = Math.random().toString(36).substring(7);
    const rectangleNode: DocumentElement = {
      name: "rectangle-" + r,
      type: "rectangle",
      props: {
        className: "RectanglePdfElement",
        placeholder: true,
        width: 100,
        height: 60,
        aspectRatio: 100/60,
        fillColor: "#ffffff",
        strokeColor: "#000000",
        strokeWidth: 4,
        position: {
          leftOffset: x,
          topOffset: y,
          percentage: true
        }
      },
      index: elementNumber
    };

    return rectangleNode;
    
}

export const createBarcodeNode = (event: React.DragEvent<HTMLDivElement>, elementNumber: number, barcodeValue?: string) => {
    //const barcode64 = createBarcode("placeholder", "CODE128");
    const [x,y] = getCoordinates(event);
    let r = Math.random().toString(36).substring(7);
    const barcodeNode: DocumentElement = {
      name: "barcode-" + r,
      type: "barcode",
      index: elementNumber,
      props: {
        width: 100,
        height: 60,
        aspectRatio: 100/60,
        value: "placeholder",
        placeholder: true,
        rotation: 0,
        codeFormat: "CODE128",
        className: "ImagePdfElement",
        transformOrigin: "top left",
        position: {
          leftOffset: x,
          topOffset: y,
          percentage: true
        }

      },
    };

    return barcodeNode;
}

export const createImageNode = (event: React.DragEvent<HTMLDivElement>, elementNumber: number)=> {
    const [x,y] = getCoordinates(event);
    let r = Math.random().toString(36).substring(7);
    const imgNode: DocumentElement = {
      name: "img-" + r,
      type: "image",
      index: elementNumber,
      props: {
        className: "ImagePdfElement",
        placeholder: true,
        value: "",
        transformOrigin: "top left",
        rotation: 0,
        position: {
          leftOffset: x,
          topOffset: y,
          percentage: true
        },
        width: 50,
        height: 50,
        aspectRatio: 1,

      },
    };

    return imgNode;
}

export const createTextNode = (event: React.DragEvent<HTMLDivElement>, elementNumber: number, element?: DocumentElement) => {
    const [x,y] = getCoordinates(event);
    let r = Math.random().toString(36).substring(7);
    const textNode: DocumentElement = {
      name: "span-" + r,
      type: "text",
      index: elementNumber,
      props: {
        className: "TextPdfElement",
        value: "Enter Text",
        fontFamily: "Times",
        fontStyle: "normal",
        fontColor: "#000000", 
        fontSize: 13,
        fontWeight: "normal",
        hyperLink: "",
        placeholder: true,
        position: {
          topOffset: y,
          leftOffset: x,
          percentage: true
        }
      },
    };

    return textNode;
}
