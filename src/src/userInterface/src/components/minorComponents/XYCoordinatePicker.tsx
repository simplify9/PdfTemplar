import { DocumentElement } from "../../models/documentModels"
import React from "react"
import { connect } from "react-redux"
import { editElementValue } from "../../redux/actions";

interface Props {
  focusedElement: DocumentElement
}

interface Handlers {
  updateElementValue: (elem: DocumentElement, keyValuePair: object, save: boolean) => void
}

export const XYCoordinatePicker = (props: Props & Handlers) => {

  const { focusedElement, updateElementValue } = props;
  const handleCoordinateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const coordType = event.target.name.replace("Input", "");

    if (coordType === "x") {
      updateElementValue(
        focusedElement,
        {
          "position": {
            leftOffset: event.target.value,
            topOffset: focusedElement.props.position.topOffset,
            percentage: true
          }
        },
        false
      )
    }
    if (coordType === "y") {
      updateElementValue(
        focusedElement,
        {
          "position": {
            leftOffset: focusedElement.props.position.leftOffset,
            topOffset: event.target.value,
            percentage: true
          }
        },
        false
      )
    }
  }

  const formatNumber = (num: number) => {
    /*
    if (Number(num))
      return String(num.toPrecision(4));
    else 
   */
      return String(num);
  }

  return (
    <div className="CoordinateInput">
      <div className="CoordinateInputBoxX">
        <label htmlFor="xInput">X:</label>
        <input
          name="xInput"
          type="text"
          value={formatNumber(focusedElement.props.position.leftOffset)}
          onChange={handleCoordinateChange}
        />
      </div>
      <div className="CoordinateInputBoxY">
        <label htmlFor="yInput">Y:</label>
        <input
          name="yInput"
          type="text"
          value={formatNumber(focusedElement.props.position.topOffset)}
          onChange={handleCoordinateChange}
        />
      </div>
    </div>
  )
}

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateElementValue: (
      element: DocumentElement,
      keyValuePair: object,
      shouldRecordHistory: boolean
    ) => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(XYCoordinatePicker)

