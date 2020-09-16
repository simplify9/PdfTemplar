import { updateStateAndHistory, createReducer, docFormatToDocSize } from "../utilities/reducerUtilities";
import {undoCanvasPage, redoCanvasPage} from "./canvasHistoryFuncs"
import { ElementRelatedAction, PDFSettingsAction } from "../models/actionModels";
import { CanvasState } from "../models/stateModels"
import { DocumentRoot } from "../models/documentModels"

const root: DocumentRoot = {
  name: "Untitled Document",
  elements: {},
  metaData: {
    templateVersion: "v2 20w17a",
    templateDataSample: {},
    documentSettings: {
      format: "a4",
      orientation: "portrait",
      size: [595, 842] }
  }   
}


const initialState: CanvasState = {
    document: root,
    focusedElement: "",
    history: {
        pastStates: [],
        futureStates: []
    }
}

const updatePdfOrientation = (state: CanvasState, action: PDFSettingsAction) => {
  const [width, height] = state.document.metaData.documentSettings.size

  return {
    ...state,
    document: {
      ...state.document,
      metaData: {
        ...state.document.metaData,
        documentSettings: {
          ...state.document.metaData.documentSettings,
          orientation: action.orientation,
          size: [height, width ]
        }
      }
    }
  }
}

const updatePdfFormat = (state: CanvasState, action: PDFSettingsAction) => {
  const newSize = docFormatToDocSize(action.format!)
  return {
    ...state,
    document: {
      ...state.document,
      metaData: {
        ...state.document.metaData,
        documentSettings: {
          ...state.document.metaData.documentSettings,
          format: action.format,
          size: newSize
        }
      }
    }
  }
}

const updatePdfWidth = (state: CanvasState, action: PDFSettingsAction) => {
  const newSize = state.document.metaData.documentSettings.size
  newSize[0] = action.width!;
  return {
    ...state,
    document: {
      ...state.document,
      metaData: {
        ...state.document.metaData,
        documentSettings: {
          ...state.document.metaData.documentSettings,
          size: newSize
        }
      }
    }
  }
}

const updatePdfHeight = (state: CanvasState, action: PDFSettingsAction) => {
  const newSize = state.document.metaData.documentSettings.size
  newSize[1] = action.height!;
  return {
    ...state,
    document: {
      ...state.document,
      metaData: {
        ...state.document.metaData,
        documentSettings: {
          ...state.document.metaData.documentSettings,
          size: newSize
        }
      }
    }
  }
}

const appendElement = (state: CanvasState, action: ElementRelatedAction) => {
    return updateStateAndHistory(state, action, (): CanvasState => {
      const elements = state.document.elements;
      elements[action.element.name] = action.element
      return {
        ...state,
        document: {
          ...state.document,
          elements: elements
        }
      };
    });
}

const deleteElement = (state: CanvasState, action: ElementRelatedAction) => {
    return updateStateAndHistory(state, action, () => {
      const elements = state.document.elements;
      delete elements[action.element.name];
      return {
        ...state,
        document: {
          ...state.document,
          elements: elements
        }
      }
    });
}

const editDocumentName = (state: CanvasState, action: ElementRelatedAction) => {
  return {
    ...state,
    document : {
      ...state.document,
      ...action.keyValuePair
    }
  }
}

const editMetaData = (state: CanvasState, action: ElementRelatedAction) => {
    return {
        ...state,
      document: {
        ...state.document,
        metaData: {
          ...state.document.metaData,
          ...action.keyValuePair
        }
      }
    }
}


const editElementValue = (state: CanvasState, action: ElementRelatedAction) => {
  return updateStateAndHistory(state, action, () => {
    const {element, keyValuePair} = action
    const elements = state.document.elements;

    elements[element.name] = {
      ...elements[element.name],
      props: {
        ...elements[element.name].props,
        ...keyValuePair
      }
    }

     return {
        ...state,
        document: {
          ...state.document,
          elements: elements
        }
      }
  });
}

const renewState = (state: CanvasState, action: ElementRelatedAction) => {
    return {
        ...state,
        ...action.keyValuePair
    }
}

const changeElementPosition = (state: CanvasState, action: ElementRelatedAction) => {
  let element = state.document.elements[action.element.name];
  const elemIdx = element.index;
  const elements = Object.entries(state.document.elements);
  const target = (action.position === "f"? Object.keys(elements).length : 1);


  for(let elem of elements){
      if(elem[1].index === target){
        const tempVar = elem[1];
        elements[target-1] = [element.name, {...element, index: target}];
        elements[elemIdx-1] = [tempVar.name, {...tempVar, index: elemIdx}];
      }

  }

  const newElements: any =  {};
  for(let entry of elements) newElements[entry[0]] = entry[1];


  return {
    ...state,
    document: {
      ...state.document,
      elements: newElements
    }
  }
}

const resizeImage = (state: CanvasState, action: ElementRelatedAction) => {
  return updateStateAndHistory(state, action, () => {
    const elements = state.document.elements;
    const element = state.document.elements[action.element.name];

    //@ts-ignore
    elements[element.name] = {
      ...element,
      props: {
        ...element.props,
        //@ts-ignore
        width: action.width,
        height: action.height,
        aspectRatio: action.width/action.height
      }
    }

    return {
        ...state,
      document: {
        ...state.document,
        elements: elements
      }
    }
  });
}

const toggleElementFocus = (state: CanvasState, action: ElementRelatedAction) => {
    return {
        ...state,
      focusedElement: action.elementName
    }
}

export default createReducer(initialState, {
    APPEND_ELEMENT: appendElement,
    DELETE_ELEMENT: deleteElement,
    EDIT_ELEMENT_VALUE: editElementValue,
    RESIZE_IMAGE: resizeImage,
    TOGGLE_ELEMENT_FOCUS: toggleElementFocus,
    UNDO_CANVAS_PAGE: undoCanvasPage,
    REDO_CANVAS_PAGE: redoCanvasPage,
    EDIT_META_DATA: editMetaData ,
    RENEW_STATE: renewState,
    CHANGE_ELEM_POS: changeElementPosition,
    PDF_FORMAT_CHANGED: updatePdfFormat,
    PDF_ORIENTATION_CHANGED: updatePdfOrientation,
    PDF_WIDTH_CHANGED: updatePdfWidth,
    PDF_HEIGHT_CHANGED: updatePdfHeight,
    EDIT_DOCUMENT_NAME: editDocumentName
});


