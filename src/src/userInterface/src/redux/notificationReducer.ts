import { createReducer } from "../utilities/reducerUtilities";
import { NotificationModel } from "../models/stateModels";
import {NotificationAction} from "../models/actionModels";
import { deepCopyObj } from "../utilities/generalUtils";


const startingState: NotificationModel[] = [];

const pushNotification = (state: NotificationModel[], action: NotificationAction): NotificationModel[] => {
    const notifArray: NotificationModel[] = deepCopyObj(state);
    notifArray.push(
        {...action.notification!,
            index: state.length,
        })
    return notifArray;
}

const shiftNotification = (state: NotificationModel[], action: NotificationAction): NotificationModel[] => {
    const notifArray: NotificationModel[] = state.filter(el => el.index !== action.notifIdx);
    return notifArray;
}


export default createReducer(
    startingState, {
        NOTIFICATION_PUSHED: pushNotification,
        NOTIFICATION_POPPED: shiftNotification
    }
)