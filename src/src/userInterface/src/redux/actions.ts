import { DocumentElement } from "../models/documentModels"
import { MiscAction, PDFSettingsAction } from "../models/actionModels";
import { NotificationModel } from '../models/stateModels';

export const APPEND_ELEMENT = "APPEND_ELEMENT";
export const EDIT_ELEMENT_VALUE = "EDIT_ELEMENT_VALUE";
export const DELETE_ELEMENT = "DELETE_ELEMENT";
export const TOGGLE_ELEMENT_FOCUS = "TOGGLE_ELEMENT_FOCUS";
export const DRAGGABLE_DRAGGED = "DRAGGABLE_DRAGGED";
export const PDF_FORMAT_CHANGED = "PDF_FORMAT_CHANGED";
export const PDF_ORIENTATION_CHANGED = "PDF_ORIENTATION_CHANGED";
export const PDF_WIDTH_CHANGED = "PDF_WIDTH_CHANGED";
export const PDF_HEIGHT_CHANGED = "PDF_HEIGHT_CHANGED";
export const FOCUSED_INDEX_INCREASE = "FOCUSED_INDEX_INCREASE";
export const FOCUSED_INDEX_DECREASE = "FOCUSED_INDEX_DECREASE";
export const FOCUSED_INDEX_RESET = "FOCUSED_INDEX_RESET";
export const FOCUSED_INDEX_SET = "FOCUSED_INDEX_SET";
export const RESIZE_IMAGE = "RESIZE_IMAGE";
export const UNDO_CANVAS_PAGE = "UNDO_CANVAS_PAGE";
export const REDO_CANVAS_PAGE = "REDO_CANVAS_PAGE";
export const RENEW_STATE = "RENEW_STATE";
export const HIDDEN_SIDEBAR_COMPONENTS = "HIDDEN_SIDEBAR_COMPONENTS";
export const DOWNLOAD_IN_PROGRESS = "DOWNLOAD_IN_PROGRESS";
export const NOTIFICATION_PUSHED = "NOTIFICATION_PUSHED";
export const NOTIFICATION_POPPED = "NOTIFICATION_POPPED";
export const CHANGE_ELEM_POS = "CHANGE_ELEM_POS";
export const EDIT_META_DATA = "EDIT_META_DATA";
export const EDIT_DOCUMENT_NAME = "EDIT_DOCUMENT_NAME";
export const SHOW_MODEL = "SHOW_MODEL";
export const SET_OFFSETS = "SET_OFFSETS";

export const toggleShowModel = () => {
  return {
    type: SHOW_MODEL
  }
}

export const setDragOffsets = (offsets: number[]) => {
  return {
    type: SET_OFFSETS,
    dragOffsets: offsets
  }
}


export const editDocumentName = (name: string) => {
  return {
    type: EDIT_DOCUMENT_NAME,
    keyValuePair: { "name": name }
  }
}

export const changeElemPos = (elem: DocumentElement, pos: string) => {
  return {
    type: CHANGE_ELEM_POS,
    element: elem,
    position: pos
  }
}

export const hideSideBarComps = (hide: boolean, sideBarComponent: string) => {
  return {
    type: HIDDEN_SIDEBAR_COMPONENTS,
    hide: hide,
    sideBarComponent: sideBarComponent
  }
}

export const changePdfWidth = (width: number) => {
  return {
    type: PDF_WIDTH_CHANGED,
    width: width
  }
}

export const changePdfHeight = (height: number) => {
  return {
    type: PDF_HEIGHT_CHANGED,
    height: height
  }
}

export const pushNotification = (notification: NotificationModel) => {
  return {
    type: NOTIFICATION_PUSHED,
    notification: notification
  }
}

export const shiftNotification = (notificationIndex: number) => {
  return {
    type: NOTIFICATION_POPPED,
    notifIdx: notificationIndex
  }
}

export const downloadPreviewClicked = () => {
  return {
    type: DOWNLOAD_IN_PROGRESS
  }
}

export const editMetaData = (keyValuePair: object) => {
  return {
    type: EDIT_META_DATA,
    keyValuePair: keyValuePair
  }
}

export const renewCanvasState = (keyValuePair: object) => {
  return {
    type: RENEW_STATE,
    keyValuePair: keyValuePair
  }
}

// action({page})

export const undoCanvasPage = () => {
  return {
    type: UNDO_CANVAS_PAGE
  }
}

export const redoCanvasPage = () => {
  return {
    type: REDO_CANVAS_PAGE
  }
}

export const resizeImage = (element: DocumentElement, width: number, height: number) => {
  return {
    type: RESIZE_IMAGE,
    element: element,
    width: width,
    height: height
  }
}

export const toggleElementFocus = (elementName: string) => {
  return {
    type: TOGGLE_ELEMENT_FOCUS,
    elementName: elementName
  };
}

export const appendElement = (element: DocumentElement) => {
  return {
    type: APPEND_ELEMENT,
    element: element,
    shouldRecordHistory: true
  };
}

export const deleteElement = (element: DocumentElement) => {
  return {
    type: DELETE_ELEMENT,
    element: element,
    shouldRecordHistory: true
  }
}

export const editElementValue = (element: DocumentElement, keyValuePair: object, shouldRecordHistory: boolean) => {
  return {
    type: EDIT_ELEMENT_VALUE,
    element: element,
    keyValuePair: keyValuePair,
    shouldRecordHistory: shouldRecordHistory
  };
}

export const draggableDragged = (name: string) => {
  const action: MiscAction = {
    type: DRAGGABLE_DRAGGED,
    draggable: name
  }
  return action;
}

export const pdfOrientationChanged = (orientation: string) => {
  const action: PDFSettingsAction = {
    type: PDF_ORIENTATION_CHANGED,
    orientation: orientation
  }
  return action;
}

export const pdfFormatChanged = (format: string) => {
  const action: PDFSettingsAction = {
    type: PDF_FORMAT_CHANGED,
    format: format
  }
  return action;
}

export const changeFocusedIndex = (index: number) => {
  return { type: FOCUSED_INDEX_SET, index: index }
}

export const focusedIndexIncrease = () => {
  return { type: FOCUSED_INDEX_INCREASE }
}

export const focusedIndexDecrease = () => {
  return { type: FOCUSED_INDEX_DECREASE }
}

export const focusedIndexReset = () => {
  return { type: FOCUSED_INDEX_RESET }
}
