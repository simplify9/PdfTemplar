import { createReducer } from "../utilities/reducerUtilities";
import { MiscAction } from "../models/actionModels";
import { MiscState } from "../models/stateModels";
import { deepCopyObj } from '../utilities/generalUtils';

const draggableDragged = (state: MiscState, action: MiscAction) => {
  return {
    ...state,
    draggableDragged: action.draggable
  }
}

const hideSideBarComponents = (state: MiscState, action: MiscAction): MiscState => {

  let newHidden: string[] = deepCopyObj(state.hiddenSideBarComponents);

  if (action.hide) {
    newHidden.push(action.sideBarComponent!)
  }
  else {
    newHidden = newHidden.filter((value) => value !== action.sideBarComponent)!;
  }
  return {
    ...state,
    hiddenSideBarComponents: newHidden
  }
}

const downloadInProgressToggle = (state: MiscState): MiscState => {
  return {
    ...state,
    downloadInProgress: !state.downloadInProgress
  }
}

const toggleShowModel = (state: MiscState): MiscState => {
  return {
    ...state,
    showModel: !state.showModel
  }
}

const setDragOffsets = (state: MiscState, action: MiscAction): MiscState => {
  return {
    ...state,
    offsets: action.dragOffsets!
  }
}

export default createReducer(
  {
    draggableDragged: "none",
    hiddenSideBarComponents: [],
    downloadInProgress: false,
    showModel: false,
    offsets: [0, 0]
  }, 
  {
  DRAGGABLE_DRAGGED: draggableDragged,
  SHOW_MODEL: toggleShowModel,
  HIDDEN_SIDEBAR_COMPONENTS: hideSideBarComponents,
  DOWNLOAD_IN_PROGRESS: downloadInProgressToggle,
  SET_OFFSETS: setDragOffsets
})
