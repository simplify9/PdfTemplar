import React from "react";
import {connect} from "react-redux";
import { State } from "../../models/stateModels";
import { shiftNotification } from "../../redux/actions";

interface Props {
    notifType: string
    notifHeader: string
    notifContent: string
    notifIdx: number
    duration: number
}

interface Handlers {
    shiftNotification: (notifIdx: number) => void
}

const Notification = (props: Props & Handlers) => {
    const {notifType, notifIdx, notifHeader, notifContent, duration, shiftNotification} = props;
    const notifClass = notifType? `Notification ${notifType}` : "Notification";
    setTimeout(() => shiftNotification(notifIdx), duration)
    return (
        <div className={notifClass}>
            <h3>{notifHeader? notifHeader : "Notification"}</h3>
            <span>{notifContent}</span>
        </div>
    )
}

const mapStateToProps = (state: State) => {
    return {

    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        shiftNotification: (notifIdx: number) => dispatch(shiftNotification(notifIdx))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Notification)