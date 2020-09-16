import * as React from "react";
import { TextElement } from "../../models/documentModels"
import { connect } from "react-redux"
import { toggleElementFocus } from "../../redux/actions";
import { State } from "../../models/stateModels";

interface Props {
  element: TextElement
  className: string
}
interface Handlers {
  switchFocusedElement: (elementName: string) => void
  handleDragStart: (event: any) => void
  handleDrag: Function
  handleDragEnd: Function
}

const wrapText = (text: string, charLimit: number): string[]  => {
  const expression = new RegExp(`.{1,${charLimit}}`, 'g');
  const matches = text.match(expression);
  if(matches) return matches;
  return [text]
}


const TextComponent = (props: Props & Handlers) => {
  const {
    element, className,
    switchFocusedElement, handleDragStart,
    handleDrag, handleDragEnd
  } = props;
  const paragraphsText: string[] = [];
  const splitText: string[] = element.props.value!.split("\\n")
    for(let parText of splitText) {
      if(element.props.charLimit && parText.length > element.props.charLimit){
        for(let wrapped of wrapText(parText, element.props.charLimit))
          paragraphsText.push(wrapped);
      }
      else paragraphsText.push(parText);
    }

  const paragraphs: JSX.Element[] = [];
  for (let i = 0; i < paragraphsText.length; i++) {
    paragraphs.push(
      <p key={i}>
        {paragraphsText[i] ? paragraphsText[i] : <wbr />}
      </p>
    )
  }

  return (
    <div
      className={className}
      style={{
        top: `${element.props.position.topOffset}${element.props.position.percentage ? "%" : "pt"}`,
        left: `${element.props.position.leftOffset}${element.props.position.percentage ? "%" : "pt"}`,
        fontFamily: element.props.fontFamily,
        fontWeight: element.props.fontWeight,
        fontStyle: element.props.fontStyle,
        fontSize: `${element.props.fontSize}pt`,
        color: element.props.fontColor,
      }}
      onDragStart={(event) => handleDragStart(event)}
      onDrag={(event) => handleDrag(event)}
      onDragEnd={(event) => handleDragEnd(event)}
      onClick={() => switchFocusedElement(element.name)}
      draggable={true}
    >
      {paragraphs}
    </div>
  )
}

const mapStateToProps = (state: State) => {
  return {
  };
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    switchFocusedElement: (elementName: string) => dispatch(toggleElementFocus(elementName))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TextComponent);
