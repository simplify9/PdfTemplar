import React from "react";
import {draggableDragged} from "../../redux/actions"
import { connect } from "react-redux"
import { State } from "../../models/stateModels";

interface Props {
    imageSource: string
    usableKey: string
    draggableName: string
}   

interface Handlers {
    draggableDragged: (name: string) => void
}



const Draggable = (props: Props & Handlers) => {
    const {
        imageSource, usableKey,
        draggableName, draggableDragged
    } = props

    const OnDragStartHandler = (event: React.DragEvent<HTMLImageElement>) => {
        const draggable = event.target as HTMLImageElement;
        if(draggable != null) draggable.style.opacity = "0.4";
        draggableDragged(draggableName.toLowerCase())
    }

    const OnDragEndHandler = (event: React.DragEvent<HTMLImageElement>) => {
        const draggable = event.target as HTMLImageElement;
        draggable && (draggable.style.opacity = "1");
    }

    return (
        <div className="Draggable">
            <img 
            src= {imageSource}
            alt=""
            id= {usableKey}
            onDragStart={(ev) => OnDragStartHandler(ev)}
            onDragEnd = {(ev) => OnDragEndHandler(ev)}
            />
            <span>{draggableName}</span>
        </div>
    )
}

const mapStateToProps = (state: State) => {
    return {};
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        draggableDragged: (name: string) => dispatch(draggableDragged(name))
    };
}

export default connect(
    mapStateToProps, 
    mapDispatchToProps
)(Draggable);