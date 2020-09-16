import React from "react"
import {connect} from "react-redux"
import { DocumentElement, ImageElement, LineElement, RectangleElement, CodeElement } from "../../models/documentModels"
import { resizeImage, editElementValue } from "../../redux/actions";
import { pixelToPt } from "../../utilities/unitConversion";
import { State } from "../../models/stateModels";

interface Props {
    imageElem: React.MutableRefObject<HTMLElement>
    resizeType: string
    focusedElement: ImageElement | RectangleElement | LineElement | CodeElement
    pageHeight: number
    pageWidth: number
    element?: DocumentElement
}

interface Handlers {
    resizeImage: (element:DocumentElement, width: number, height: number) => void
    updateElementValue: (element: DocumentElement, keyValuePair: object, shouldRecordHistory: boolean) => void
}

const ResizeKnob = (props: Props & Handlers) => {
  const {
      imageElem, resizeType,
      focusedElement, 
      element,
      updateElementValue
  } = props

  let style = {};

  if(resizeType === "horizontal"){
      if(focusedElement.type === "image" && (focusedElement.props.rotation === 90 || focusedElement.props.rotation === 180)){
          style = {display: "none"}
      } else {
          style = {top: "50%", left: "100%"}
      }
  }
  if(resizeType === "vertical") style = {top: "100%", left: "50%"}
      
  if(resizeType.includes("vertical") && resizeType.includes("horizontal")) style = {top: "100%", left: "100%"}

  if(resizeType === "1D") style = {top: "100%", left: "100%"}

  const calculateResize = (event: React.DragEvent<HTMLDivElement>) => {
      //@ts-ignore
      const imageElemRect = imageElem.current.getBoundingClientRect()

      let rotatedAspect = false,
      width = focusedElement.props!.width!,
      height = focusedElement.props!.height!;

      if(focusedElement.type === "image"){
          if(focusedElement.props.rotation >= 360)
              rotatedAspect = false;
          else if (focusedElement.props.rotation >= 270)
              rotatedAspect = true;
          else if (focusedElement.props.rotation >= 180)
              rotatedAspect = false;
          else if (focusedElement.props.rotation >= 90)
              rotatedAspect = true;
      }


      let difference = 0;

      if(resizeType === "horizontal"){
          if(rotatedAspect) difference = (event.clientY - imageElemRect.top);
          else difference = (event.clientX - imageElemRect.right);

          difference = pixelToPt(difference);
          if(rotatedAspect) height += difference;
          else width += difference;
      }

      if (resizeType.includes("vertical")){
        difference = (event.clientY - imageElemRect.bottom);

        difference = pixelToPt(difference);
        if(rotatedAspect) width += difference;
        else height += difference;

        if(resizeType.includes("horizontal")) width = height * focusedElement.props.aspectRatio!
      }


      if(resizeType === "1D"){
          if(!element || element.type !== "line") return;

          if(element.props.width > element.props.height){
            difference = (event.clientX - imageElemRect.right);
            difference = pixelToPt(difference);
            width += difference;
          }
          else{
            difference = (event.clientY - imageElemRect.bottom);
            difference = pixelToPt(difference);
            height += difference;
          }
      }

        if(width < 20) width = 20;
        if(height < 20) height = 20;

      
      return [width, height]
  }

  //const throttledDragHandler = useCallback(throttle(handleDrag, 50), [focusedElement]);

  if(focusedElement.type === "image" && focusedElement.props.rotation && focusedElement.props.rotation > 0) style = {display: "none"}

  const dragHandler = (event: any) => {
    event.stopPropagation();
    const calculated = calculateResize(event);
    if(!calculated) {
      return;
    }
    const target = document.getElementById(focusedElement.name)!;
    const [width, height] = calculated;
    target.style.width = `${width}pt`
    target.style.height = `${height}pt`
  }

  const dragEndHandler = (event: any) => {
    event.stopPropagation();
    const calculated = calculateResize(event);
    if(!calculated) return;
    const [width, height] = calculated;
    console.log(calculated)
    if(focusedElement.type !== "line")
        props.resizeImage(
            focusedElement, 
            width,
            height
        )
    else {
      const coordinateResize: any = width > height? {"x2": width} : {"y2": height}
      updateElementValue(focusedElement, {
        "width": width,
        "height": height,
        "coordinates": {
          ...focusedElement.props.coordinates,
          ...coordinateResize
        }
      }, false)
    }
  }


  return (
      <div 
      className="OuterKnob" 
      style={{...style}}
      draggable={true}
      onDragEnd={dragEndHandler}
      onDragStart={(event) => {event.stopPropagation();}}
      onDrag={dragHandler}
      >
          <div 
          draggable={true}
          className="InnerKnob"
          >
          </div>
      </div>
  )
}

const mapStateToProps = (state: State) => {
    return {
      focusedElement: state.canvas.document.elements[state.canvas.focusedElement] as ImageElement | 
                      RectangleElement | LineElement | CodeElement,
        pageWidth: state.canvas.document.metaData.documentSettings.size[0],
        pageHeight: state.canvas.document.metaData.documentSettings.size[1],
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        resizeImage: (element:DocumentElement, width: number, height: number) => dispatch(resizeImage(element, width, height)),
        updateElementValue: (
            element: DocumentElement, 
            keyValuePair: object,
            shouldRecordHistory: boolean
        )  => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ResizeKnob)
