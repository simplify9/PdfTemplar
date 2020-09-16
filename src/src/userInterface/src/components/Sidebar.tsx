import React from "react";
import {connect} from "react-redux";
import DragAndDropBox from "./sideBarComponents/DragAndDropBox";
import OptionBox from "./sideBarComponents/OptionToolBox";
import Toolbox from "./sideBarComponents/Toolbox";
import { State } from "../models/stateModels";
import CollapseButton from "./minorComponents/CollapseButton";
import { DocumentElement } from "../models/documentModels"

interface Props {
    hiddenSideBarComps: string[]
    focusedElement: DocumentElement
}


const Sidebar = (props: Props) => {
    return (
        <div className="Sidebar shadow">
            <div>
                <CollapseButton sideBarComponent="toolBox"/>
                <h2>Tool box</h2>
                {props.hiddenSideBarComps!.includes("toolBox")? 
                    null : 
                    <Toolbox />
                }
            </div>

            <div>
                <CollapseButton sideBarComponent="dragAndDropBox"/>
                <h2>Drag and Drop</h2>
                {props.hiddenSideBarComps!.includes("dragAndDropBox")? 
                    null : 
                    <DragAndDropBox />
                }
            </div>

            {props.focusedElement?
                <div>
                    <CollapseButton sideBarComponent="optionBox"/>
                    <h2>Element Options</h2>
                    {props.hiddenSideBarComps.includes("optionBox")? null : <OptionBox />}
                </div> : null
            }
        </div>
    )
}

const mapStateToProps = (state: State) => {
    return {
        focusedElement: state.canvas.document.elements[state.canvas.focusedElement],
        hiddenSideBarComps: state.misc.hiddenSideBarComponents
    }
}

export default connect(
    mapStateToProps
)(Sidebar);
