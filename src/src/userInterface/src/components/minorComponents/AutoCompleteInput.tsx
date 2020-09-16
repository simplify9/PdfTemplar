import React, { useEffect, useState } from "react";
import { connect } from "react-redux"
import { DocumentElement, TextElement, CodeElement, ImageElement } from "../../models/documentModels"
import VariableList from "./VariableList";
import { useDebounce } from "../../utilities/generalUtils";
import {
  editElementValue,
  focusedIndexIncrease,
  focusedIndexDecrease,
  focusedIndexReset,
} from "../../redux/actions";
import { State } from "../../models/stateModels";

interface Props {
  focusedElement: TextElement | CodeElement | ImageElement
  dataListObj: any
  focusedIndex: number
  placeholderText?: string
}

interface Handlers {
  updateElementValue: (element: DocumentElement, keyValuePair: object, shouldRecordHistory: boolean) => void
  increaseFocusedIndex: () => void
  decreaseFocusedIndex: () => void
  resetFocusedIndex: () => void
}

const enterButtonKeyDownEvent = new CustomEvent("enterButtonKeyDown");

const isWritingVariable = (text: string) => {
  if (text === undefined) return false;
  let startingBraces = (text.match(/{{/g) || []).length;
  let endingBrances = (text.match(/}}/g) || []).length;

  if (startingBraces > endingBrances) return true;
  else return false;
}

const getParent = (text: string) => {
  let parentObj: string[] = [];
  let parentText: string = "none";
  parentObj = text.split(' ');
  for (let textPiece of parentObj) {
    if (textPiece.includes("{{") && !textPiece.includes("}}")) {
      parentText = textPiece;
    }
  }

  if (text.includes('.')) {
    parentObj = parentText.split('.')
  }
  else {
    parentObj = [parentText.replace(/{/g, ''),]
  }

  return parentObj;
}

const cleanParentObjects = (parentObjArr: string[]): string[] => {
  let cleanedParentObjects: string[] = [];
  for (let parent of parentObjArr) {
    cleanedParentObjects.push(parent.replace(/{/g, ""));
  }

  return cleanedParentObjects;
}

const hasObjects = (object: any, parentText: string[]) => {
  let objectKeys: string[] = [];
  let objectKeysWithParent: string[] = [];
  parentText = cleanParentObjects(parentText);

  let parentObj = object;

  for (let i = 0; i < parentText.length; i++) {
    if (parentObj[parentText[i]])
      parentObj = parentObj[parentText[i]];
  }

  for (let key of Object.keys(parentObj)) {
    let hasChildren = parentObj[key] && typeof parentObj[key] === "object" ? true : false;
    let endingSegment = hasChildren ? "." : "}}";
    objectKeys.push(key)
    objectKeysWithParent.push(key + endingSegment)
  }

  return [objectKeys, objectKeysWithParent];
}

const getRelevantObjects = (objects: string[][], relevantText: string) => {
  let newObjects: string[][] = [[], []];
  for (let i = 0; i < objects[0].length; i++) {
    if (objects[0][i]
      .includes(getParent(relevantText)
        .pop()!.toLowerCase().replace(/{/g, ""))
    ) {
      newObjects[0].push(objects[0][i]);
      newObjects[1].push(objects[1][i]);
    }
  }

  return newObjects;
}
let notUndoOrRedo = true;
document.addEventListener("undoAction", () => {
  notUndoOrRedo = false;
});
document.addEventListener("redoAction", () => {
  notUndoOrRedo = false;
});
const AutoCompleteInput = (props: Props & Handlers) => {
  let {
    focusedElement, dataListObj,
    focusedIndex, updateElementValue,
    increaseFocusedIndex, decreaseFocusedIndex,
    resetFocusedIndex 
  } = props

  const placeholder = props.placeholderText? props.placeholderText : "Enter Text"

  const [inputValue, setInputValue]: [string, any] = useState(focusedElement.props!.value || placeholder);
  const debouncedInputValue = useDebounce(inputValue.replace(/\n/g, "\\n"), 400);

  let objects: string[][] = [];
  if (isWritingVariable(focusedElement!.props!.value || "")) {
    objects = hasObjects(dataListObj, getParent(focusedElement!.props!.value));
    objects = getRelevantObjects(objects, focusedElement!.props!.value)
  }
  let variableList = (isWritingVariable(focusedElement!.props!.value)) ?
    <VariableList variableList={objects[0]} variableKeyList={objects[1]} />
    : null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.keyCode === 38 || (event.shiftKey && event.keyCode === 9)) {
        event.preventDefault();
        if (focusedIndex > -1) decreaseFocusedIndex!();
      }
      else if (event.keyCode === 40 || event.keyCode === 9) {
        event.preventDefault();
        if (objects[0])
          if (focusedIndex < objects[0].length - 1) {
            increaseFocusedIndex!();
          }
      }
      else if (event.keyCode === 13) {
        event.preventDefault();
        if (isWritingVariable(focusedElement!.props.value)) {
          if (focusedIndex! > -1) {
            document.dispatchEvent(enterButtonKeyDownEvent);
            resetFocusedIndex!();
          }
        }
        else {
          const target = (event.target) as HTMLTextAreaElement;
          let pos = target.selectionStart
          const newLines = (inputValue.match(/\\n/g) ? inputValue.match(/\\n/g)!.length : 0);
          pos += newLines;
          const newVal = inputValue.substring(0, pos) + "\\n" + inputValue.substring(pos);
          setInputValue(newVal);
        }
      }
      /*
      else if (event.keyCode === 8){
          event.preventDefault();
          setInputValue(inputValue.slice(0,-1))
      }
      else if (event.key.length === 1 && !event.ctrlKey){
          event.preventDefault();
          setInputValue(inputValue + event.key)
      }
      */
    }
    document.addEventListener("keydown", handleKeyDown);
    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [decreaseFocusedIndex, focusedIndex, increaseFocusedIndex, resetFocusedIndex, objects, focusedElement, inputValue])

  useEffect(
    () => setInputValue(focusedElement.props!.value || placeholder),
    [focusedElement, placeholder]
  )

  // this effect only updates on debouncedInputValue because adding focusedElem causes constant rerenders
  useEffect(() => {
    async function updateElems() {
      if (notUndoOrRedo) {

        const val = debouncedInputValue ?
          debouncedInputValue :
          placeholder

        if (debouncedInputValue === placeholder) return;

        updateElementValue(focusedElement, { "value": val }, true);

        if (focusedElement.type === "image") {
          //props.imageHandler!(val);
          setInputValue(val);
        }
      }
      else notUndoOrRedo = true;
    }
    updateElems();
  }
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedInputValue]
  )
  let fontFamily = "";
  if (focusedElement.type === "text")
    fontFamily = focusedElement.props.fontFamily
  else
    fontFamily = "Times"

  let style: any = { fontFamily: fontFamily };
  if (isWritingVariable(focusedElement.props.value)) {
    if (!objects[0].length) {
      style.color = "red";
    }
  }

  return (
    <div className="AutoCompleteInput">
      <textarea
        id="textInput"
        autoComplete="off"
        value={
          inputValue !== placeholder ?
            inputValue.replace(/\\n/g, "\n") : ""
        }
        onChange={(event) => {
          if (notUndoOrRedo)
            setInputValue(event.target.value)
          else
            notUndoOrRedo = true;
        }}
        style={style}
        placeholder={placeholder}
      />
      <div
        className="VariableList"
        style={isWritingVariable(focusedElement!.props!.value) ? { display: "inline-block" } : { display: "none" }}>
        {variableList}
      </div>
    </div>
  )
}

const mapStateToProps = (state: State) => {
  return {
    dataListObj: state.canvas.document.metaData.templateDataSample,
    focusedElement: state.canvas.document.elements[state.canvas.focusedElement] as TextElement | CodeElement | ImageElement,
    focusedIndex: state.autocomplete.index,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateElementValue: (
      element: DocumentElement,
      keyValuePair: object,
      shouldRecordHistory: boolean
    ) => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
    increaseFocusedIndex: () => dispatch(focusedIndexIncrease()),
    decreaseFocusedIndex: () => dispatch(focusedIndexDecrease()),
    resetFocusedIndex: () => dispatch(focusedIndexReset()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AutoCompleteInput)
