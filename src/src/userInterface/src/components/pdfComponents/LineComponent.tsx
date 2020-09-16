import React, { useRef, useEffect } from "react";
import {connect} from "react-redux";
import { State } from "../../models/stateModels";
import { DocumentElement, LineElement } from "../../models/documentModels"
import { toggleElementFocus } from "../../redux/actions";
import ResizeKnob from "../minorComponents/ResizeKnob";
import { getRelativeCoordinates } from "../../utilities/elementCreation"

interface Props {
    focusedElement: DocumentElement
    element: LineElement
    className: string
}

interface Handlers {
    switchElement: (elementName: string) => void
    handleDragStart: (event: any) => void
    handleDrag: Function
    handleDragEnd: Function
}

const LineComponent = (props: Props & Handlers) => {
    const {
        element, className,
        handleDrag, handleDragEnd,
        handleDragStart, switchElement,
        focusedElement
    } = props;

    let {x1, x2, y1, y2} = element.props.coordinates!;
    const coordinates = {
        x1: x1 === 0 && element.props.height! > element.props.width!? "50%" : `${x1}pt`,
        x2: x2 === 0 && element.props.height! > element.props.width!? "50%" : `${x2? x2 : 0}pt`,
        y1: y1 === 0 && element.props.width! > element.props.height!? "50%" : `${y1}pt`,
        y2: y2 === 0 && element.props.width! > element.props.height!? "50%" : `${y2? y2 : 0}pt`,
    }

    let svgElem: React.MutableRefObject<null> | React.MutableRefObject<SVGElement> | any= useRef(null);
    let lineElem : any= useRef(null);
    useEffect(() => {
        const lineElemRef = svgElem.current!;
        const mouseMoveHandler = (event: MouseEvent) => {
            const [x2, y2] = getRelativeCoordinates(event, element);
            if(!element.props.placeholder) return;
            lineElemRef.children[0].attributes.getNamedItem("x2")!.value = `${x2}pt`;
            lineElemRef.children[0].attributes.getNamedItem("y2")!.value = `${y2}pt`;
        }
        svgElem.current!.addEventListener("mousemove", mouseMoveHandler)
        return function cleanup() {
            lineElemRef.removeEventListener("mousemove", mouseMoveHandler);
        }
    })
    return (
      <div
      className={className} 
      style={{
        top: `${element.props.position.topOffset}${element.props.position.percentage? "%" : "pt"}`,
        left: `${element.props.position.leftOffset}${element.props.position.percentage? "%" : "pt"}`,
        height: !element.props.placeholder? `${element.props.height}pt` : "100%",
        width: !element.props.placeholder? `${element.props.width}pt` : "100%"
      }}
      id={element.name}
      onDragStart={(event) => handleDragStart(event)}
      onDrag={(event) => handleDrag(event)}
      onDragEnd={(event) => handleDragEnd(event)}
      onClick={() => switchElement(element.name)}
      draggable= {true}
      >
          <svg ref={svgElem} className="NestedInParent"
          style={{ 
                  width: !element.props.placeholder?
                  `${element.props.width}pt` : "100%", 
                  height: !element.props.placeholder? 
                  `${element.props.height}pt` : "100%"
              }}>
            <line ref={lineElem} 
              x1={coordinates.x1} 
              y1={coordinates.y1} 
              x2={coordinates.x2} 
              y2={coordinates.y2} 
              style={{
                  strokeOpacity: !element.props.placeholder? 1 : 0.5, 
                  strokeWidth: `${ element.props.strokeWidth }pt`,
                  stroke: element.props.strokeColor
              }}
            />
          </svg>

          {focusedElement && focusedElement!.index === element.index?
              [
                  <ResizeKnob key="L" imageElem={lineElem} element={element} resizeType="1D"/>,
              ]: null}

      </div>
    )
}

const mapStateToProps = (state: State) => {
    return {
        focusedElement: state.canvas.document.elements[state.canvas.focusedElement],
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        switchElement: (elementName: string) => dispatch(toggleElementFocus(elementName)),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LineComponent);
