import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { DocumentElement, WatermarkElement } from "../../models/documentModels";
import { createWatermark } from "../../utilities/generalUtils";
import { State } from "../../models/stateModels";
import { toggleElementFocus, editElementValue } from "../../redux/actions";
import { createTextNode } from "../../utilities/elementCreation";


interface Props {
  element: WatermarkElement
  className: string
  docSize: number[]
  focusedElement: DocumentElement
  dragOffsets: number[]
}

interface Handlers {
  handleDragStart: (event: any) => void
  switchFocusedElement: (elementName: string) => void
  updateElementValue: (element: DocumentElement, keyValuePair: any, saveToHistory: boolean) => void
}

const WatermarkComponent = (props: Props & Handlers) => {
  const {
    element, className, docSize,
    handleDragStart, dragOffsets,
    focusedElement, updateElementValue
  } = props;

  const [watermarkSrc, updateWatermarkSrc] = useState("");

  useEffect(() => {
    const updateWatermark = async () => {
      const watermarkSrc = await createWatermark(element.props.value, element.props.color, element.props.align, docSize);
      updateWatermarkSrc(watermarkSrc);
    }
    updateWatermark();
  })

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    const node = createTextNode(event, focusedElement.index, focusedElement)
    let target = event.target as HTMLElement;

    //sometimes the mouse grabs a child of the parent div
    if (target.children.length === 0) target = target.parentElement!;

    target.style.top = `${node.props.position.topOffset + dragOffsets[1]}%`;
    target.style.left = `${node.props.position.leftOffset + dragOffsets[0]}%`;
  }

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    const node = createTextNode(event, focusedElement.index, focusedElement)
    const keyValuePair: any = {};
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

  return (
    <div
      className={className}
      style={{
        width: `${docSize[0]}pt`,
        height: `${docSize[1]}pt`,
        position: "absolute",
        top: `${element.props.position.topOffset}${element.props.position.percentage ? "%" : "pt"}`,
        left: `${element.props.position.leftOffset}${element.props.position.percentage ? "%" : "pt"}`,
        pointerEvents: focusedElement && focusedElement.name === element.name ? "auto" : "none"
      }}
      onDragStart={(event) => handleDragStart(event)}
      onDrag={(event) => handleDrag(event)}
      onDragEnd={(event) => handleDragEnd(event)}
    >
      <img
        style={{
          width: `${docSize[0]}pt`,
          height: `${docSize[1]}pt`
        }}
        src={watermarkSrc}
        alt=""
        width={`${docSize[0]}pt`}
        height={`${docSize[1]}pt`}
      />
    </div>
  )
}

const mapStateToProps = (state: State) => {
  return {
    focusedElement: state.canvas.document.elements[state.canvas.focusedElement],
    docSize: state.canvas.document.metaData.documentSettings.size,
    dragOffsets: state.misc.offsets
  }
}

const mapDispachToProps = (dispatch: Function) => {
  return {
    switchFocusedElement: (elementName: string) => dispatch(toggleElementFocus(elementName)),
    updateElementValue: (
      element: DocumentElement,
      keyValuePair: object,
      shouldRecordHistory: boolean
    ) => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
  }
}

export default connect(
  mapStateToProps,
  mapDispachToProps
)(WatermarkComponent);

