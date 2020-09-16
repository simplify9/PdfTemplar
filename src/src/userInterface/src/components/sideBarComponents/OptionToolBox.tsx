import React, { ChangeEvent } from "react"
import { connect } from "react-redux"
import { DocumentElement } from "../../models/documentModels"
import {
  resizeImage,
  deleteElement,
  pushNotification,
  editElementValue,
  toggleElementFocus,
  toggleShowModel
} from "../../redux/actions"
import AutoCompleteInput from "../minorComponents/AutoCompleteInput"
import { State } from "../../models/stateModels"
import XYCoordinatePicker from "../minorComponents/XYCoordinatePicker"
import { NotificationModel } from "../../models/stateModels"

interface Props {
  focusedElement: DocumentElement
  docSize: any
}

interface Handlers {
  resizeImage: (element: DocumentElement, width: number, height: number) => void
  pushNotification: (notif: NotificationModel) => void,
  updateElementValue: (element: DocumentElement, keyValuePair: object, shouldRecordHistory: boolean) => void
  deleteElementFromCanvas: (element: DocumentElement) => void,
  toggleShowModel: () => void
}


const OptionBox = (props: Props & Handlers) => {
  const {
    focusedElement,
    updateElementValue,
    deleteElementFromCanvas, pushNotification,
    toggleShowModel
  } = props;

  let baseOptions;
  if (focusedElement)
    baseOptions =
      <div>
        <XYCoordinatePicker focusedElement={focusedElement} />
        <button id="removeElement" onClick={(event) => removeElement(event)}>Remove element</button>
      </div>

  let options;

  const removeElement = (event: any) => {
    deleteElementFromCanvas(focusedElement)
  }

  const selectTarget = (event: any) => {
    event.target.select();
  }


  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    if(!file) return;
    const acceptableFormats = ["jpg", "jpeg", "jfif", "png"];
    const format = file.name.split('.').pop();
    if(!format || !acceptableFormats.includes(format.toLowerCase())) {
      pushNotification({
        content: `Format ${format} not supported`,
        header: "Upload Error",
        type: "Error",
        duration: 2000
      })
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const xhttp = new XMLHttpRequest();
      xhttp.open("POST", "/uploadImage", true);
      xhttp.setRequestHeader("Content-Type", "application/json")
      xhttp.onload = function(this, event) {
        updateElementValue(focusedElement, {"value": this.response}, false)
      }
      xhttp.onerror = function(this, event) {
      }
      xhttp.send(JSON.stringify(reader.result))
    })
    if (file) reader.readAsDataURL(file);
  }

  const handleBarcodeFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateElementValue(focusedElement, { "codeFormat": event.target.value }, false)
  }

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateElementValue(
      focusedElement,
      { fontColor: event.target.value },
      false
    )
  }

  const handleCharLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateElementValue(
      focusedElement,
      { charLimit: Number(event.target.value) },
      false
    )
  }

  const handleStrokeChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateElementValue(
      focusedElement,
      { strokeColor: event.target.value },
      false
    )
  }

  const handleFillChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateElementValue(
      focusedElement,
      { fillColor: event.target.value },
      false
    )
  }

  const handleStrokeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value: number = isNaN(Number(event.target.value)) ? 1 : Number(event.target.value);

    //strokeWidth above 20 is irrational
    if (value > 20 || value < 1) {
      pushNotification({
        content: "Stroke width can not be more than 20 or less than 1",
        header: "Warning",
        type: "Error",
        duration: 1000
      })
      return;
    }

    const changes: { width?: any, height?: any } = {

    }
    if (focusedElement.type === "line") {
      if (focusedElement.props.width! > focusedElement.props.height!)
        changes.height = `${value !== 1 ? value / 2 : value}`;
      else
        changes.width = `${value !== 1 ? value / 2 : value}`;
    }
    console.log(changes)
    updateElementValue(
      focusedElement,
      { strokeWidth: value, ...changes },
      false
    )
  }

  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateElementValue(
      focusedElement,
      { fontSize: event.target.value },
      false
    )
  }

  const handleBoldButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (focusedElement.type !== "text") return;
    const fontWeight = focusedElement.props.fontWeight;
    if (fontWeight === "bold") {
      updateElementValue(
        focusedElement,
        { fontWeight: "normal" },
        false
      );
    }
    if (fontWeight === "normal") {
      updateElementValue(
        focusedElement,
        { fontWeight: "bold" },
        false
      );
    }
  }

  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateElementValue(
      focusedElement,
      { fontFamily: event.target.value },
      false
    );
  }

  const handleRotation = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!(focusedElement.type === "image" || focusedElement.type === "barcode")) return;
    let target: any = event.target as HTMLButtonElement;
    target = target.parentElement

    let multiplier = 1;
    if (target.id === "antiClockwise") {
      multiplier = -1;
    }

    let newRotationInt;
    const currentRotation = focusedElement.props.rotation;
    if (currentRotation) {
      //const currentRotation = Number(currentRotationStr.match(/\(.*?\)/)![0].replace('(', "").replace(')', "").replace('deg', ''));
      newRotationInt = currentRotation + (90 * multiplier)

    } else {
      newRotationInt = 90 * multiplier;
    }

    if (newRotationInt < -359 || newRotationInt > 359) {
      newRotationInt = 0;
    }


    updateElementValue(
      focusedElement,
      { rotation: newRotationInt },
      false
    )
  }


  const handleItalicButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (focusedElement.type !== "text") return;
    const fontStyle = focusedElement.props!.fontStyle;
    console.log(fontStyle)
    if (fontStyle === "italic") {
      updateElementValue(
        focusedElement,
        { fontStyle: "normal" },
        false
      );
    }
    if (fontStyle === "normal") {
      updateElementValue(
        focusedElement,
        { fontStyle: "italic" },
        false
      );
    }

  }


  const rotationDiv =
    <div className="rotationDiv">
      <button id="clockwise" onClick={handleRotation} style={{ background: "none" }}>
        <img src="images/clockwise.png" alt="clockwise" />
      </button>
      <button id="antiClockwise" onClick={handleRotation} style={{ background: "none" }}>
        <img src="images/antiClockwise.png" alt="antiClockwise" />
      </button>
    </div>

  if (focusedElement && focusedElement!.type === "text") {
    options =
      <div>
        <div className="TextPropEditor">
          <button style={{ position: "relative", left: "30%" }} onClick={() => toggleShowModel()}>Add Variable </button>
          <AutoCompleteInput />
          <input
            className="ColorPicker"
            type="color"
            onChange={handleColorChange}
            value={focusedElement.props!.fontColor}
          />
          <input
            className="FontSizeInput"
            placeholder={String(focusedElement.props.fontSize)}
            type="text"
            name="fontSize"
            onChange={handleSizeChange}
            value={String(focusedElement.props.fontSize).replace("pt", "")}
          />
          <input
            className="FontSizeInput"
            placeholder={String(focusedElement.props.charLimit)}
            type="text"
            name="charLimit"
            onChange={handleCharLimitChange}
            value={String(focusedElement.props.charLimit || 0)}
          />
          <select className="FontPicker" onChange={handleFontChange} value={focusedElement.props.fontFamily}>
            <option>Times</option>
            <option>Helvetica</option>
            <option>Courier</option>
            <option>ZapfDingbats</option>
            <option>Symbol</option>
            <option>Roboto</option>
            <option>Cairo</option>
          </select>
          <button
            onClick={handleBoldButtonClick}
            style={{ fontWeight: "bold" }}
          > B </button>
          <button
            onClick={handleItalicButtonClick}
            style={{ fontStyle: "italic" }}
          > I </button>
        </div>
      </div>
  }

  if (focusedElement && focusedElement!.type === "image") {
    options =
      <div>
        <AutoCompleteInput placeholderText="Enter Image URL or Browse" />
        <br />
        <input type="file" accept="image/png,image/jpeg" onChange={async (ev) => await uploadImage(ev)} />
        {rotationDiv}
      </div>
  }

  if (focusedElement && focusedElement.type === "barcode")
    options =
      <div>
        <button style={{ position: "relative", left: "30%" }} onClick={() => toggleShowModel()}>Add Variable </button>
        <AutoCompleteInput />
        <select onChange={handleBarcodeFormatChange}>
          <option value="CODE128">CODE128</option>
          <option value="ITF">code2of5</option>
        </select>
        {rotationDiv}
      </div>

  if (focusedElement && focusedElement.type === "qrcode")
    options =
      <div>
        <button style={{ position: "relative", left: "30%" }} onClick={() => toggleShowModel()}>Add Variable </button>
        <AutoCompleteInput />
      </div>

  if (focusedElement && focusedElement.type === "line")
    options =
      <div>
        <input
          className="ColorPicker"
          type="color"
          onChange={handleStrokeChange}
          value={focusedElement.props.strokeColor}
        />
        <input
          type="number"
          style={{ width: "5em" }}
          onChange={handleStrokeWidthChange}
          onClick={(event) => selectTarget(event)}
          value={String(focusedElement.props.strokeWidth!).replace("pt", "")}
        />
      </div>

  if (focusedElement && focusedElement.type === "rectangle")
    options =
      <div>
        <input
          className="ColorPicker"
          type="color"
          onChange={handleStrokeChange}
          value={focusedElement.props.strokeColor}
        />
        <input
          className="ColorPicker"
          type="color"
          onChange={handleFillChange}
          value={focusedElement.props.fillColor}
        />
        <input
          type="number"
          style={{ width: "2em" }}
          onChange={handleStrokeWidthChange}
          value={String(focusedElement.props.strokeWidth).replace("pt", "")}
        />
      </div>
  return (
    <div className="OptionBox">
      <h4 >{focusedElement!.name + ': '}</h4>
      {options}
      {baseOptions}
    </div>
  )
}

const mapStateToProps = (state: State) => {
  return {
    focusedElement: state.canvas.document.elements[state.canvas.focusedElement],
    docSize: state.canvas.document.metaData.documentSettings.size,
  };
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateElementValue: (
      element: DocumentElement,
      keyValuePair: object,
      shouldRecordHistory: boolean
    ) => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
    deleteElementFromCanvas: (element: DocumentElement) => dispatch(deleteElement(element)),
    resizeImage: (element: DocumentElement, width: number, height: number) => dispatch(resizeImage(element, width, height)),
    switchFocusedElem: (elemName: string) => dispatch(toggleElementFocus(elemName)),
    pushNotification: (notif: NotificationModel) => dispatch(pushNotification(notif)),
    toggleShowModel: () => dispatch(toggleShowModel())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OptionBox);
