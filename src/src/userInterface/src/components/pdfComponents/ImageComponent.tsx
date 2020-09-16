import React, {useRef, useEffect, useState} from "react";
import { connect } from "react-redux";
import { DocumentElement, ImageElement, CodeElement } from "../../models/documentModels"
import {toggleElementFocus, editElementValue, resizeImage} from "../../redux/actions"
import ResizeKnob from "../minorComponents/ResizeKnob";
import { createBarcode, createQrCode, handleImageInputChange } from "../../utilities/generalUtils";
import { State } from "../../models/stateModels";

interface Props {
    element: ImageElement | CodeElement
    className: string
    focusedElement: DocumentElement
    docSize: number[]
}

interface Handlers {
    switchFocusedElement: (elementName: string) => void
    handleDragStart: (event: any) => void
    updateElementValue: (element: DocumentElement, keyValuePair: any, saveToHistory: boolean) => void
    handleDrag: Function
    resizeImage: (element: DocumentElement, width: number, height: number) => void
    handleDragEnd: Function
}

const ImageComponent = (props: Props & Handlers) => {
  const {
    element, className,
    focusedElement, switchFocusedElement,
    handleDragStart, handleDrag,
    handleDragEnd,
    docSize, resizeImage
  } = props;

  let imageElem: any = useRef(null);
  let [imageSource, updateImageSource] = useState(element.props.value)

  const getSource = (initialSource: string) => {
      const source = initialSource.slice(0,25);
      if(source.includes("base64"))
          return initialSource;
      if(source.includes("http")) 
          return initialSource;
      if(source.includes("default://"))
          return initialSource.replace("default://", "");
      else return initialSource
  }

  const handleResize = (dimensions: number[]) => {
    const [width, height] = dimensions;
    const equalDimensions = width === element.props.width
                          && height === element.props.height;
      if(!equalDimensions){
        resizeImage(element, width, height)
      }
  }

  const processImage = async () => {
    let processed = "";
    switch(element.type){
      case "barcode":
        processed = createBarcode(
          element.props.value, 
          element.props.codeFormat
        )
        break;
      case "qrcode":
        processed = await createQrCode(element.props.value)
        break;
      case "image":
        processed = getSource(element.props.value);
        if(processed === imageSource) break;
        handleImageInputChange(processed, handleResize, docSize);
        break;
    }
    return processed;
  }

  useEffect(() => {
    const updateImage = async () => {
      let source: boolean | string = await processImage();
      if(source !== imageSource)
        updateImageSource(source as string)
    }
    updateImage();
  })


  const unit = "pt";

    return (
        <div
        className={className}
        id={element.name}
        style={{
          width: `${element.props.width}${unit}`,
          height: `${element.props.height}${unit}`,
          top: `${element.props.position.topOffset}${element.props.position.percentage? "%" : "pt"}`,
          left: `${element.props.position.leftOffset}${element.props.position.percentage? "%" : "pt"}`,
          transform: `rotate(${element.props.rotation}deg)`
        }}
        onDragStart={(event) => handleDragStart(event)}
        onDrag={(event) => handleDrag(event)}
        onDragEnd={(event) => handleDragEnd(event)}
        >
            <img 
            ref= {imageElem}
            src={imageSource}
            alt="Input source in options"
            style={{
                width: `${element.props.width}${unit}`,
                height: `${element.props.height}${unit}`,
            }}
            width= {`${element.props.width}${unit}`}
            height= {`${element.props.height}${unit}`}
            onClick={() => switchFocusedElement(element.name)}
            />
            {
            focusedElement && focusedElement.index === element.index && focusedElement.type === "image"?
            [
             <ResizeKnob key="v" resizeType="vertical" imageElem={imageElem}/>] : null
            }
            {
            focusedElement && focusedElement!.index === element.index?
             [<ResizeKnob key="h" resizeType="horizontal" imageElem={imageElem}/>,
             <ResizeKnob key="hv" resizeType="horizontal vertical" imageElem={imageElem}/>] : null
            }
        </div>
    );
}

const mapStateToProps = (state: State) => {
    return {
        focusedElement: state.canvas.document.elements[state.canvas.focusedElement],
        docSize: state.canvas.document.metaData.documentSettings.size
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        switchFocusedElement: (elementName: string) => dispatch(toggleElementFocus(elementName)),
        updateElementValue: (
            element: DocumentElement, 
            keyValuePair: object, 
            shouldRecordHistory: boolean
        ) => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
        resizeImage: (element: DocumentElement, width: number, height: number) => dispatch(resizeImage(element, width, height)),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImageComponent)
