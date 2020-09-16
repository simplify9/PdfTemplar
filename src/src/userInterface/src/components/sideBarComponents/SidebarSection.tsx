import React from "react";
import {connect} from "react-redux";
import { State } from "../../models/stateModels";
import CollapseButton from "../minorComponents/CollapseButton";
import DragAndDropBox from "./DragAndDropBox";
import Toolbox from "./Toolbox";
import OptionToolBox from "./OptionToolBox";

interface Props {
    hiddenSideBarComps: string[]
    title: string
    secName: string
}

interface Handlers {

}

const SidebarSection = (props: Props & Handlers) => {
    const {
            hiddenSideBarComps, 
            secName, title
    } = props;

    const sidebarSecs: {[k: string]: JSX.Element }  = {
        "dragAndDrop": <DragAndDropBox/>,
        "toolBox": <Toolbox />,
        "optionBox": <OptionToolBox />
    }

    const Component = sidebarSecs[secName]

    return (
            <div>
                <CollapseButton sideBarComponent={secName}/>
                <h2>{title}</h2>
                {hiddenSideBarComps.includes(secName)?  null : {Component}}
            </div>
    )
}

const mapStateToProps = (state: State) => {
    return {
        hiddenSideBarComps: state.misc.hiddenSideBarComponents
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {

    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SidebarSection)