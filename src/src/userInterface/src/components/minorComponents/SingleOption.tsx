import React, { useEffect } from "react";
import { DocumentElement, ImageElement, CodeElement, TextElement } from "../../models/documentModels"
import { connect } from "react-redux";
import { editElementValue, changeFocusedIndex } from "../../redux/actions";
import { State } from "../../models/stateModels";

interface Props {
    variable: string
    variableKey: string
    focusedIndex: number
    focusedElement?: ImageElement | CodeElement | TextElement
    index: number
}

interface Handlers {
    editElement: (element: DocumentElement, keyValuePair: object, shouldRecordHistory: boolean) => void
    updateFocusedIndex: (index: number) => void
}

const SingleOption = (props: Props & Handlers) => {
    const {
        variable, variableKey,
        focusedIndex, focusedElement,
        index, editElement,
        updateFocusedIndex
    } = props;

    let className = "Autocomplete-item"

    const getVariable = (text: string) => {
        let parentObj: string[] = [];
        let parentText: string = "none";
        parentObj = text.split(' ');
        for(let textPiece of parentObj){
            //checking if currently writing variable
            if (textPiece.includes("{{") && !textPiece.includes("}}")){
                parentText = textPiece;
            }
        }
        if(parentText.includes('.')){
            parentObj = parentText.split('.');
            parentText = parentObj.pop()!;
            //if it's a shallow level object
            if(parentObj.length < 3){
                parentText = "{{" + parentText;
            }
        }
        return parentText;
    }

    const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        let focusedText = focusedElement!.props!.value
        const variable = getVariable(focusedText).replace("{{", "");
        focusedText = focusedText.replace(variable, '')
        editElement!(focusedElement!, {"value" : focusedText + variableKey}, true)
        if(focusedIndex === index){
            if(!variableKey.includes("Invalid-Variable")){
                editElement!(focusedElement!, {"value" : focusedText + variableKey}, true)
            }
        } 
    }

    useEffect(() => {
        let focusedText = focusedElement!.props!.value
        const variable = getVariable(focusedText).replace("{{", "");
        focusedText = focusedText.replace(variable, '')
        const editElem = () => {
            if(focusedIndex === index){
                if(!variableKey.includes("Invalid-Variable")){
                    editElement!(focusedElement!, {"value" : focusedText + variableKey}, true)
                }
            } 
        }
        //Dispatching this event instead of altering state directly because there is a lot of
        //Data to drill into this component if it were to work like that
        document.addEventListener("enterButtonKeyDown", editElem);
        return () => {
            document.removeEventListener("enterButtonKeyDown", editElem);
        }
        
    })

    if(focusedIndex === index)
        className += " Active";

    return (
        <div
            onMouseEnter={() => updateFocusedIndex(index)}
        >
            <div 
            key={variableKey} 
            id={variableKey}
            className={className}
            onClick={handleClick}
            >
                {variable}
            </div>
        </div>
    )
}

const mapStateToProps = (state: State) => {
    return {
        focusedIndex: state.autocomplete.index,
        focusedElement: state.canvas.document.elements[state.canvas.focusedElement] as ImageElement | CodeElement | TextElement
    };
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        editElement: (
            element: DocumentElement, 
            keyValuePair: object, 
            shouldRecordHistory: boolean
        ) => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
        updateFocusedIndex: (index: number) => dispatch(changeFocusedIndex(index)),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SingleOption);
