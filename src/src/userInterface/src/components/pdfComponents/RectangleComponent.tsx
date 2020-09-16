import React, { useRef } from "react"
import {connect} from "react-redux"
import { State } from "../../models/stateModels"
import { DocumentElement, RectangleElement } from "../../models/documentModels"
import { toggleElementFocus } from "../../redux/actions"
import ResizeKnob from "../minorComponents/ResizeKnob"

interface Props {
    element: RectangleElement
    className: string
    focusedElement: DocumentElement
}

interface Handlers {
    handleDragStart: (event: any) => void
    switchFocusedElement: (elementName: string) => void
    handleDrag: Function
    handleDragEnd: Function
}

const RectangleComponent = (props: Props & Handlers) => {
    const {
        element, className,
        handleDrag, handleDragEnd,
        handleDragStart, switchFocusedElement,
        focusedElement
    } = props;

    const unit = "pt";
    let rectElem: any = useRef(null);

    const strokeWidth = element.props.strokeWidth;

    return (
    <div
        className={className} 
        id={element.name}
        style={{
          top: `${element.props.position.topOffset}${element.props.position.percentage? "%" : "pt"}`,
          left: `${element.props.position.leftOffset}${element.props.position.percentage? "%" : "pt"}`,
          width:`${element.props.width!+strokeWidth}${unit}`,
          height:`${element.props.height!+strokeWidth}${unit}`,
          strokeOpacity: 1,
          strokeWidth: strokeWidth,
          stroke: element.props.strokeColor,
          fill: element.props.fillColor
        }}
        onDragStart={(event) => handleDragStart(event)}
        onDrag={(event) => handleDrag(event)}
        onDragEnd={(event) => handleDragEnd(event)}
        onClick={() => switchFocusedElement(element.name)}
        draggable= {true}
    >
        <svg 
        className="NestedInParent"
        width={`${element.props.width!+strokeWidth}${unit}`} 
        height={`${element.props.height!+strokeWidth}${unit}`}
        ref={rectElem}>
            <rect 
            x={`${strokeWidth/2}${unit}`}
            y={`${strokeWidth/2}${unit}`}
            width={`${element.props.width}${unit}`} 
            height={`${element.props.height}${unit}`}
             />
        </svg>
        {
          focusedElement && focusedElement!.index === element.index?
          <ResizeKnob 
            key="h" 
            resizeType="horizontal" 
            element={focusedElement}
            imageElem={rectElem} 
          />    
            : null
        }
        {
              focusedElement && focusedElement.type === "rectangle" &&
              focusedElement!.index === element.index && focusedElement.props.height! > 1?
            [
            <ResizeKnob 
              key="v" 
              resizeType="vertical" 
              element={focusedElement}
              imageElem={rectElem} 
            />,
            <ResizeKnob 
              key="hv" 
              resizeType="horizontal vertical" 
              element={focusedElement}
              imageElem={rectElem}
            />
            ]
            : null
        }

    </div>)
}

const mapStateToProps = (state: State) => {
    return {
        focusedElement: state.canvas.document.elements[state.canvas.focusedElement],
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        switchFocusedElement: (elementName: string) => dispatch(toggleElementFocus(elementName))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RectangleComponent)
