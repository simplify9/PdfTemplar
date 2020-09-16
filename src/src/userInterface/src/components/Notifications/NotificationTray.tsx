import React from "react";
import {connect} from "react-redux";
import { State, NotificationModel } from "../../models/stateModels";
import Notification from "./Notification";

interface Props {
    notifications: NotificationModel[]
}

interface Handlers {
}

const NotificationTray = (props: Props & Handlers) => {
    const {notifications } = props;

    const notifs: JSX.Element[] = [];

    for(let notif of notifications){
        notifs.push(
            <div key={notif.index}>
                <Notification 
                notifIdx={notif.index!} 
                notifContent={notif.content!} 
                notifHeader={notif.header} 
                notifType={notif.type} 
                duration={notif.duration} />
            </div>
        )
    }

    return (
        <div className="NotificationTray">
            {notifs}
        </div>
    )
}

const mapStateToProps = (state: State) => {
    return {
        notifications: state.notifications,
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NotificationTray)