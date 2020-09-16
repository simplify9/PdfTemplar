import * as React from "react";
import { connect } from "react-redux"
import { appendElement, toggleElementFocus, draggableDragged, editElementValue } from "../redux/actions"
import { createTextNode, createImageNode, createBarcodeNode, createQrNode, createRectangleNode, createLineNode, finishLineNode, resizeLineNodeContainer } from "../utilities/elementCreation"
import { State } from "../models/stateModels";
import { DocumentElement, DocumentRoot, LineElement } from "../models/documentModels";

interface Handlers {
    renderComponents: () => JSX.Element[]
    appendElementToCanvas: (element: DocumentElement ) => void
    draggableDragged: (name: string) => void
    switchElement: (elementName: string) => void
    updateElementValue: (element: DocumentElement, keyValuePair: object, shouldRecordHistory: boolean) => void
}

interface Props {
    draggableName: string
    canvasDocument: DocumentRoot
    elementNumber: number
}

document.addEventListener("dragover", function(event){
    event.preventDefault();
});

const Canvas = (props: Props & Handlers) => {
  const {
    draggableName, renderComponents, 
    appendElementToCanvas, draggableDragged, 
    switchElement, updateElementValue,
    elementNumber, canvasDocument
  } = props;     

  const handleDrop= async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.persist();
      let node: DocumentElement;

      switch(draggableName){
          case "text":
              node = createTextNode(event, elementNumber);
              break;
          case "image":
              node = createImageNode(event, elementNumber);
              break;
          case "qr code":
              node = await createQrNode(event, elementNumber);
              break;
          case "barcode":
              node = createBarcodeNode(event, elementNumber);
              break;
          case "rectangle":
              node = createRectangleNode(event, elementNumber);
              break;
          case "line":
              node = createLineNode(event, elementNumber);
              const secondCordInput = (event: MouseEvent) => {
                  updateElementValue(node,{...resizeLineNodeContainer(event, node as LineElement).props}, false);
                  updateElementValue(node,{...finishLineNode(event, node as LineElement).props}, false);
                  document.removeEventListener("click", secondCordInput);
              }
              document.addEventListener("click", secondCordInput)
              break;
          default:
              return;
      }
      //so that not any draggable tag gets placed as current draggableName
      draggableDragged("none");
      appendElementToCanvas(node);
      switchElement(node.name);
  }


  const pdfStyleObj = {
      width: `${canvasDocument.metaData.documentSettings.size[0]}pt`,
      height: `${canvasDocument.metaData.documentSettings.size[1]}pt`
  }

  return (
      <main className="Canvas">
          <div id="PdfCreator" 
          onDrop={(event) => handleDrop(event)}
          style={pdfStyleObj}
          >
              {renderComponents()}
          </div>
      </main>
  );
}

const mapStateToProps = (state: State) => {
  return {
    canvasDocument: state.canvas.document,
    elementNumber: Object.keys(state.canvas.document.elements).length + 1,
    draggableName: state.misc.draggableDragged,
  };
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        switchElement: (elementName: string) => dispatch(toggleElementFocus(elementName)),
        appendElementToCanvas: (element: DocumentElement) => dispatch(appendElement(element)),
        draggableDragged: (name: string) => dispatch(draggableDragged(name)),
        updateElementValue: (
            element: DocumentElement, 
            keyValuePair: object,
            shouldRecordHistory: boolean
        )  => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Canvas);
