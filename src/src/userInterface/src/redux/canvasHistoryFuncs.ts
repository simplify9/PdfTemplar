import { deepCopyObj } from "../utilities/generalUtils";
import { HistoryRelatedAction } from "../models/actionModels";
import { CanvasState } from "../models/stateModels";

export const undoCanvasPage = (state: CanvasState, action: HistoryRelatedAction) => {
    let newState = state.history.pastStates.pop();
    newState = newState? newState : state;

    let futureStates = state.history.futureStates;
    const noHistoryState = {
        ...state,
        history: null,
    }
    futureStates.push(deepCopyObj(noHistoryState));
    if(futureStates.length >= 10) futureStates.shift();

    return {
        ...newState,
        history: {
            futureStates: futureStates,
            pastStates: state.history.pastStates
        }
    }
}

export const redoCanvasPage = (state: CanvasState, action: HistoryRelatedAction) => {
    let newState = state.history.futureStates.pop();
    newState = newState? newState : state;

    let pastStates = state.history.pastStates;
    const noHistoryState = {
        ...state,
        history: null
    }
    pastStates.push(deepCopyObj(noHistoryState))

    return {
        ...newState,
        history: {
            pastStates: pastStates,
            futureStates: state.history.futureStates
        }
    }
}