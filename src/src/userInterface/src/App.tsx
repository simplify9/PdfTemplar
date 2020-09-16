import React, { useEffect } from 'react';
import './styles/App.css';
import Canvas from "./components/Canvas";
import { connect } from "react-redux"
import Sidebar from "./components/Sidebar";
import { DocumentElement, DocumentRoot } from "./models/documentModels"
import PdfComponent from './components/pdfComponents/PdfComponent';
import { undoCanvasPage, redoCanvasPage, deleteElement } from './redux/actions';
import { State } from './models/stateModels';
import NotificationTray from './components/Notifications/NotificationTray';
import ModelView from './components/minorComponents/ModelView';

interface Props {
  canvasPage: DocumentRoot,
  focusedElement: DocumentElement
}
interface Handlers {
  undoCanvas: () => void
  redoCanvas: () => void
  deleteElementFromCanvas: (element: DocumentElement) => void
}

const undoActionEvent = new CustomEvent("undoAction");
const redoActionEvent = new CustomEvent("redoAction");

const App = (props: Props & Handlers) => {

  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.keyCode === 90) {
        document.dispatchEvent(undoActionEvent)
        props.undoCanvas();
      }
      if (event.ctrlKey && event.keyCode === 89) {
        document.dispatchEvent(redoActionEvent)
        props.redoCanvas();
      }
      if (event.keyCode === 46)
        if (props.focusedElement) props.deleteElementFromCanvas(props.focusedElement)
    }

    document.addEventListener("keyup", handleKeyUp)
    return () => document.removeEventListener("keyup", handleKeyUp)
  },
    [props])

  const stateToComponents = (): JSX.Element[] => {
    const components: JSX.Element[] = []
    const elements = Object.entries(props.canvasPage.elements);
    let watermark;
    if (elements.length > 0) {
      for (let [elementKey, elementValue] of elements) {
        let component = <PdfComponent element={elementValue} key={elementKey} />;
        if(elementKey === "WATERMARK"){
          watermark = component;
          continue;
        }
        if (component !== null) components.push(component);
      }
    }
    if(watermark) components.push(watermark);
    return components;
  }

  let noChromeWarning = null;
  //@ts-ignore
  if(!window.chrome){
    noChromeWarning = <h4 style={{color: "red"}}>Please use Chrome for full functionality</h4>;
  }

  return (
    <div className="App">
      {noChromeWarning}
      <Sidebar />
      <Canvas renderComponents={stateToComponents} />
      <NotificationTray />
      <ModelView />
    </div>
  );
}

const mapStateToProps = (state: State, ownProps: any) => {
  return {
    canvasPage: state.canvas.document,
    focusedElement: state.canvas.document.elements[state.canvas.focusedElement]
  };
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    deleteElementFromCanvas: (element: DocumentElement) => dispatch(deleteElement(element)),
    undoCanvas: () => dispatch(undoCanvasPage()),
    redoCanvas: () => dispatch(redoCanvasPage()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
