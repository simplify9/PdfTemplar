import React from "react";
import { connect } from "react-redux";
import ReactJson, { OnSelectProps } from "react-json-view";
import { State } from "../../models/stateModels";
import { DocumentElement, TextElement } from "../../models/documentModels";
import { editElementValue, toggleShowModel } from "../../redux/actions";

interface Props {
  model: any
  visible: boolean
  focusedElement: TextElement
}

interface Handlers {
  updateElementValue: (element: DocumentElement, keyValuePair: object, shouldRecordHistory: boolean) => void
    toggleShowModel: () => void
}


const  ModelView = (props: Props & Handlers) => {
  const {
    model, visible, 
    updateElementValue, focusedElement,
    toggleShowModel
  } = props;
  let className = "ModelView"
  const getVar = (val: OnSelectProps) => {
    let variable = "{{";
    for(let name of val.namespace) variable += name + ".";
    variable += val.name + "}}";
    updateElementValue(focusedElement, {value: 
      ` ${focusedElement.props.value === "Enter Text" || focusedElement.props.value === "placeholder" ? 
        "" : focusedElement.props.value.trim()} ${variable} `}, 
    false)
    toggleShowModel();
    
  }
  return (
    <div className={className} style={{display: visible? "block" : "none"}}>
      <ReactJson src={model} onSelect={getVar}/>
    </div>
  )
}

const mapStateToProps = (state: State) => {
  return {
    model: state.canvas.document.metaData.templateDataSample,
    visible: state.misc.showModel,
    focusedElement: state.canvas.document.elements[state.canvas.focusedElement] as TextElement,
  }
}

const mapDispachToProps = (dispatch: Function) => {
  return {
    updateElementValue: (
      element: DocumentElement,
      keyValuePair: object,
      shouldRecordHistory: boolean
    ) => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
    toggleShowModel: () => dispatch(toggleShowModel())
  }
}

export default connect(
  mapStateToProps,
  mapDispachToProps
)(ModelView);

