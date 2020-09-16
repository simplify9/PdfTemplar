import React from "react"
import { connect } from "react-redux";
import { DocumentElement } from "../../models/documentModels"
import SingleOption from "./SingleOption";
import { State } from "../../models/stateModels";
import { editElementValue } from "../../redux/actions";

interface Props {
    variableKeyList: string[]
    variableList: string[]
}
interface Handlers {
    editElement: (focusedElem: DocumentElement, keyValuePair: any, shouldRecordHistory: boolean) => void
    increaseFocusedIndex?: () => void
    decreaseFocusedIndex?: () => void
}

const VariableList = (props: Props & Handlers) => {
    const {
        variableKeyList, variableList
    } = props;


    let options: any[] = [];
    for (let i = 0; i < variableList.length; i++){
        if (variableList[i])
            {
            let option = 
            <SingleOption 
                index={i}
                variable={variableList[i]}
                variableKey={variableKeyList[i]}
                key={variableKeyList[i]}
            />
            options.push(option);
        }
    }


    return (
        <div className="Autocomplete-list">
            {options}
        </div>
    )
}

const mapStateToProps = (state: State) => {
    return {}
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        editElement: (
            element: DocumentElement, 
            keyValuePair: object, 
            shouldRecordHistory: boolean
        ) => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VariableList)
