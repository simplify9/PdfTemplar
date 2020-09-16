import { combineReducers } from "redux";
import canvasReducer from "./canvasReducer";
import autocompleteReducer from "./autocompleteReducer";
import miscReducer from "./miscReducer";
import notificationReducer from "./notificationReducer";

export default combineReducers({
    canvas: canvasReducer,
    autocomplete: autocompleteReducer,
    misc: miscReducer,
    notifications: notificationReducer
})
    
