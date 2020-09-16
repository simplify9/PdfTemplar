import React from "react";
import {connect} from "react-redux";
import { State } from "../../models/stateModels";
import { hideSideBarComps } from "../../redux/actions";


interface Props {
    sideBarComponent: string
    hiddenSideBarComps: string[]
}

interface Handlers {
    hideSideBarComp: (hide: boolean, component: string) => void
}


const CollapseButton = (props: Props & Handlers) => {
    const {sideBarComponent, hideSideBarComp} = props;

    const handleCollapse = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.checked){
            hideSideBarComp(false, sideBarComponent);
        }

        else{
            hideSideBarComp(true, sideBarComponent);
        }
    }

    const checked = props.hiddenSideBarComps.includes(sideBarComponent)? false : true;

    return (
        <div style={{float: "right"}}>
            <label htmlFor={`${sideBarComponent}CollapseButton`}>
                <img 
                className="CollapseCheckBoxLabel"
                style={checked? {transform: `rotate(180deg)`} : {} }
                width="5em" 
                height="5em" 
                alt="collapse" 
                src="images/collapse.png"/>
            </label>
            <input 
            id={`${sideBarComponent}CollapseButton`}
            style={{display: "none"}}
            type="checkbox" 
            name="collapse" 
            onChange={(event) => handleCollapse(event)} 
            checked={checked}
            />
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
        hideSideBarComp: (hide: boolean, component: string) => dispatch(hideSideBarComps(hide, component)),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CollapseButton)