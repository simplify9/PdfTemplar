import React, { useEffect } from "react";
import { createTextNode } from "../../utilities/elementCreation";
import { DocumentElement } from "../../models/documentModels"
import TextCompnent from "./TextCompnent";
import ImageComponent from "./ImageComponent";
import { connect } from "react-redux";
import { State } from "../../models/stateModels";
import { cssPercentageToNumber } from "../../utilities/generalUtils";
import RectangleComponent from "./RectangleComponent";
import LineComponent from "./LineComponent";
import { editElementValue, toggleElementFocus, setDragOffsets } from "../../redux/actions";
import WatermarkComponent from "./WatermarkComponent";

interface Props {
  draggableDragged: string
  focusedElement: DocumentElement
  element: DocumentElement
  dragOffsets: number[]
}

interface Handlers {
  updateElementValue: (element: DocumentElement, keyValuePair: any, saveToHistory: boolean) => void
  switchFocusedElement: (elementName: string) => void
  setDragOffsets: (offsets: number[]) => void
}

const PdfComponent = (props: Props & Handlers) => {
  let {
    focusedElement, element,
    updateElementValue, switchFocusedElement,
    setDragOffsets, dragOffsets
  } = props;

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    const node = createTextNode(event, focusedElement.index, focusedElement)
    let target = event.target as HTMLElement;
    if (target.children.length === 0) target = target.parentElement!;
    if (!(node.props.position.leftOffset > 0 && node.props.position.topOffset > 0 &&
      node.props.position.leftOffset < 100 && node.props.position.leftOffset < 100)) return;
    target.style.top = `${node.props.position.topOffset + dragOffsets[1]}%`;
    target.style.left = `${node.props.position.leftOffset + dragOffsets[0]}%`;
  }

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    const node = createTextNode(event, focusedElement.index, focusedElement)
    let keyValuePair: { position?: any } = {};

    if (node.props.position.leftOffset < 0) node.props.position.leftOffset = 0;
    if (node.props.position.topOffset < 0) node.props.position.topOffset = 0;
    if (node.props.position.leftOffset > 100) node.props.position.leftOffset = 99.5;
    if (node.props.position.topOffset > 100) node.props.position.topOffset = 99.5;

    const inBounds = node.props.position.leftOffset >= 0 && node.props.position.topOffset >= 0 &&
                     node.props.position.leftOffset <= 100 && node.props.position.leftOffset <= 100;
    if (inBounds) {
      keyValuePair.position = {
        topOffset: node.props.position.topOffset + dragOffsets[1],
        leftOffset: node.props.position.leftOffset + dragOffsets[0],
        percentage: true
      };
      updateElementValue(
        focusedElement,
        keyValuePair,
        true
      )
    }
    else {
      let target = event.target as HTMLElement;
      if (target.children.length === 0) target = target.parentElement!;
      target.style.top = `${focusedElement.props.position.topOffset}%`;
      target.style.left = `${focusedElement.props.position.leftOffset}%`;
    }
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    let img = new Image()
    if (focusedElement.name !== element.name) {
      switchFocusedElement(element.name)
    }
    img.src = "images/blank.png"
    //Transparent hover
    event.dataTransfer.setDragImage(img, 0, 0)

    const node = createTextNode(event, focusedElement.index, focusedElement)

    const mouseLeftOffset = focusedElement.props.position.leftOffset - node.props.position.leftOffset;
    const mouseTopOffset = focusedElement.props.position.topOffset - node.props.position.topOffset;
    const offsets = [mouseLeftOffset, mouseTopOffset];

    //dataTransfer does not work on chrome
    setDragOffsets(offsets);
  }

  useEffect(() => {
    function keyDownHandler(ev: KeyboardEvent) {
      if (ev.shiftKey && [37, 38, 39, 40].indexOf(ev.keyCode) !== -1) ev.preventDefault();
      else return;
      switch (ev.keyCode) {
        case 37:
          updateElementValue(focusedElement, {
            left: `${focusedElement.props.position.leftOffset - 1.5}%`
          }, false)
          break;
        case 38:
          updateElementValue(focusedElement, {
            top: `${cssPercentageToNumber(focusedElement.props.position.topOffset!) - 1.5}%`
          }, false)
          break;
        case 39:
          updateElementValue(focusedElement, {
            left: `${cssPercentageToNumber(focusedElement.props.position.leftOffset!) + 1.5}%`
          }, false)
          break;
        case 40:
          updateElementValue(focusedElement, {
            top: `${cssPercentageToNumber(focusedElement.props.position.topOffset!) + 1.5}%`
          }, false)
          break;
      }
    }
    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }
  )

  let className = element.props!.className!;
  if (focusedElement && element.name === focusedElement.name) {
    className += " Focused"
  }




  switch (element.type) {
    case "text":
      return (
        <TextCompnent
          className={className}
          element={element}
          handleDrag={handleDrag}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          key={element.name}
        />
      )
    case "line":
      return (
        <LineComponent
          className={className}
          element={element}
          handleDrag={handleDrag}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          key={element.name}
        />
      )
    case "rectangle":
      return (
        <RectangleComponent
          className={className}
          element={element}
          handleDrag={handleDrag}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          key={element.name}
        />
      )
    case "image":
    case "qrcode":
    case "barcode":
      return (
        <ImageComponent
          className={className}
          element={element}
          handleDrag={handleDrag}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          key={element.name}
        />
      )
    case "watermark":
      return (
        <WatermarkComponent
          element={element}
          className={className}
          handleDragStart={handleDragStart}
          key={element.name}
        />
      )
    default:
      return <span></span>;
  }

}


const mapStateToProps = (state: State) => {
  return {
    draggableDragged: state.misc.draggableDragged,
    //TODO: Turn this into a utility function, so the focusedElement is updated correctly.
    focusedElement: state.canvas.document.elements[state.canvas.focusedElement],
    dragOffsets: state.misc.offsets
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateElementValue: (
      element: DocumentElement,
      keyValuePair: object,
      shouldRecordHistory: boolean
    ) => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
    switchFocusedElement: (elementName: string) => dispatch(toggleElementFocus(elementName)),
    setDragOffsets: (offsets: number[]) => dispatch(setDragOffsets(offsets))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PdfComponent);
