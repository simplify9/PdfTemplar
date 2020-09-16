import { createReducer } from "../utilities/reducerUtilities";
import { AutocompleteAction } from "../models/actionModels";
import { AutocompleteState } from "../models/stateModels";


const focusedIndexIncrease = (state: AutocompleteState, action: AutocompleteAction) => {
    return {index: state.index + 1};
    
}

const focusedIndexDecrease = (state: AutocompleteState, action: AutocompleteAction) => {
    return {index: state.index - 1};
}

const focusedIndexReset = (state: AutocompleteState, action: AutocompleteAction) => {
    return {index: -1};
}

const changeFocusedIndex = (state: AutocompleteState, action: AutocompleteAction) => {
    return {index: action.index}
}

export default createReducer({index: 0}, {
    FOCUSED_INDEX_DECREASE: focusedIndexDecrease,
    FOCUSED_INDEX_INCREASE: focusedIndexIncrease,
    FOCUSED_INDEX_RESET: focusedIndexReset,
    FOCUSED_INDEX_SET: changeFocusedIndex
})