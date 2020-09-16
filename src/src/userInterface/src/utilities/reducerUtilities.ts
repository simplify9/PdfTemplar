import { deepCopyObj } from "./generalUtils";
import { CanvasState } from "../models/stateModels";

export const createReducer = (initialState: any, handlers: any) => {
    return function reducer(state = initialState, action: any) {
      if (handlers.hasOwnProperty(action.type))
        return handlers[action.type](state, action)
      else 
        return state
    }
  }

export const updateStateAndHistory = (state: CanvasState, action: any, func: Function) => {
    const newPast = state.history.pastStates;
    if(action.shouldRecordHistory){
        const noHistoryState = {
            ...state,
            history: null,
        }
        newPast.push(deepCopyObj(noHistoryState));
        if(newPast.length >= 10) newPast.shift();
    }
    return {
        ...func(),
        history: {
            ...state.history,
            pastStates: newPast
        }
    }
}

export const docFormatToDocSize = (format: string) => {
    switch(format){
        case "a4":
            return [595, 842]
        case "a3":
            return [842, 1190]
    }
}
