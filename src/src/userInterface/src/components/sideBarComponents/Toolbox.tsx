import React, { useEffect, useState, ChangeEvent } from "react";
import { connect } from "react-redux"
import { DocumentRoot, DocumentElement, WatermarkElement, WatermarkAlign } from "../../models/documentModels"
import { pdfOrientationChanged, pdfFormatChanged, editMetaData, renewCanvasState, downloadPreviewClicked, pushNotification, changePdfWidth, changePdfHeight, changeElemPos, editElementValue, editDocumentName, appendElement, toggleElementFocus } from "../../redux/actions";
import { State, NotificationModel } from "../../models/stateModels";
import request from "request"
import axios from "axios";

interface Props {
  canvasPage: DocumentRoot
  downloadInProg: boolean
  focusedElement: DocumentElement
  watermarkElement: WatermarkElement
}

interface Handlers {
  appendElementToCanvas: (element: DocumentElement) => void
  changePdfOrientation?: (orientation: string) => void
  changePdfFormat?: (format: string) => void
  changePdfWidth: (width: number) => void
  changePdfHeight: (height: number) => void
  updateElementValue: (element: DocumentElement, keyValuePair: object, shouldRecordHistory: boolean) => void
  updateCanvasProps: (keyValuePair: object) => void
  renewTemplate: (keyValuePair: object) => void
  downloadClicked: () => void
  pushNotification: (notif: NotificationModel) => void
  changeElemPos: (elem: DocumentElement, pos: string) => void
  editDocumentName: (name: string) => void
  switchFocusedElement: (elementName: string) => void
}



const Toolbox = (props: Props & Handlers) => {
  const [dataEndpointCalled, updateDataEndpointCalled] = useState(false);
  const [postPoint, updatePostPoint] = useState("");
  const [saving, updateSaving] = useState(false)
  const {
    canvasPage,
    changePdfOrientation, changePdfFormat,
    updateCanvasProps, renewTemplate,
    downloadClicked, downloadInProg, pushNotification,
    changePdfHeight, changePdfWidth,
    focusedElement, changeElemPos, updateElementValue,
    editDocumentName, appendElementToCanvas, watermarkElement,
    switchFocusedElement
  } = props;


  const getTemplate = () => {
    axios.get("/version").then((res) =>
      {
        const template = JSON.stringify({ "template": {
          ...canvasPage,
          metaData: {
            ...canvasPage.metaData,
            templateVersion: `${canvasPage.metaData.templateVersion}: ${res.data}`
          }
        } });
        navigator.clipboard.writeText(template).then(
          () => pushNotification({
            type: "Success",
            header: "Copied!",
            content: "Template now on clipboard",
            duration: 1500
          })).catch(
            () => pushNotification({
              type: "Error",
              header: "Copy failed",
              content: "",
              duration: 2000
            })
          )
      }
    )

  }

  const saveTemplate = () => {
    updateSaving(true)
    const template = JSON.stringify({ "template": canvasPage });
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", postPoint, true);
    xhttp.setRequestHeader("Content-Type", "application/json")
    xhttp.onload = function(this, event) {
      updateSaving(false)
    }
    xhttp.onerror = function(this, event) {
      updateSaving(false)
    }
    xhttp.send(template)
  }

  useEffect(() => {
    if (dataEndpointCalled)
      return;

    let params = new URLSearchParams(window.location.search);
    let sampleObj: string | null = params.get("sample_obj");
    let templarContext = params.get("templar_ctx");
    let postEndpoint = params.get("post_point");
    if (sampleObj) {
      if (sampleObj.includes("http")) {
        request(sampleObj, (err, res, body) => {
          updateCanvasProps({ "templateDataSample": JSON.parse(res.body) })
        })
      }
    }
    if (postEndpoint) updatePostPoint(postEndpoint);
    if (templarContext) {
      request(templarContext, (err, res, body) => {
        if (!err) {
          const body = typeof res.body === "string" ? JSON.parse(res.body) : res.body;
          if (body.template) {
            renewTemplate(
              { "page": body.template.template }
            );
            changePdfOrientation!(body.template.settings.docOrientation!);
            changePdfFormat!(body.template.settings.docFormat!);
          }
          if (body.dataObj) updateCanvasProps({ "templateDataSample": body.dataObj })
        }

      });
      updateDataEndpointCalled(true);
    }
  }, [updateDataEndpointCalled, updateCanvasProps, dataEndpointCalled, changePdfFormat, changePdfOrientation, renewTemplate]);

  const updateDocName = (name: string) => {
    editDocumentName(name);
  }

  const getWatermarkAlign = () => {
    if(watermarkElement){
      switch(watermarkElement.props.align){
        case 0:
          return "\\";
        case 1:
          return "—";
        case 2:
          return "|"
        case 3:
          return "/";
      }
    }
    else return "\\";
  }

  const focusWatermark = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if((focusedElement && focusedElement.name !== "WATERMARK") || !focusedElement)
      switchFocusedElement("WATERMARK");
    else switchFocusedElement("");
  }

  const updateWatermarkAlign = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const LIMIT = 3;
    if(watermarkElement){
      let newAlign = ++watermarkElement.props.align;
      if(newAlign > LIMIT) newAlign = 0;
      updateElementValue(
        watermarkElement,
        { align: newAlign},
        false
      )
    }
  }

  const updateWatermarkColor = (event: ChangeEvent<HTMLInputElement>) => {
    if(watermarkElement)
      updateElementValue(
          watermarkElement,
          { color: event.target.value },
          false
        )
  }


  const updateWatermark = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if(!watermarkElement)appendElementToCanvas({
      type: "watermark",
      name: "WATERMARK",
      index: 1000,
      props: {
        position: {
          leftOffset: 0,
          topOffset: 0,
          percentage: true
        },
        color: "#000000",
        align: WatermarkAlign.DIAGONALTD,
        placeholder: false,
        className: "watermark",
        value: ev.target.value
      }
    })
    else updateElementValue(
      watermarkElement,
      {value: ev.target.value},
      false
    )
  }

  const downloadPDF = (canvasPage: DocumentRoot) => {
    downloadClicked()

    pushNotification({
      type: "",
      header: "Downloading...",
      content: "",
      duration: 1000
    })

    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/generate", true);
    xhttp.responseType = "blob";
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.timeout = 10000;
    xhttp.onload = function(this, event) {
      const blob = new Blob([this.response]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.id = "download-gen-pdf"

      if (this.status === 400) {
        pushNotification({
          type: "Error",
          header: "There was an error in downloading",
          content: "Check log",
          duration: 1000
        })
        link.download = "errorLog.txt"
      }

      else {
        pushNotification({
          type: "Success",
          header: "Finished downloading",
          content: "Check downloads",
          duration: 1000
        })
        link.download = `${canvasPage.name}.pdf`
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(document.getElementById("download-gen-pdf")!)
      window.URL.revokeObjectURL(url);
      downloadClicked()
    }
    xhttp.ontimeout = function(this, event) {
      downloadClicked();
      pushNotification({
        type: "Error",
        header: "There was an error in downloading",
        content: "Check error logs",
        duration: 1000
      })
    }
    xhttp.onerror = function(this, event) {
      downloadClicked();
      pushNotification({
        type: "Error",
        header: "There was an error in downloading",
        content: this.response,
        duration: 1000
      })
    }

    const req = JSON.stringify({ "template": canvasPage })
    xhttp.send(req);
  }

  const onWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    changePdfWidth(Number(event.target.value))
  }

  const onHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    changePdfHeight(Number(event.target.value))
  }

  const handleDataObjChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      updateCanvasProps({ "templateDataSample": JSON.parse(event.target.value) })
    }
    catch (e) {
      updateCanvasProps({ "templateDataSample": event.target.value })
    }
  }

  const handleTemplateImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const imported: { template: DocumentRoot } = { template: canvasPage };

    try {
      imported.template = JSON.parse(event.target.value).template;
    }
    catch (error) {
      return;
    }

    const validTempPromise = new Promise((resolve, reject) => {
      imported ?
        imported.template ?
          imported.template.elements ?
            imported.template.metaData ?
              imported.template.name ?
                resolve(imported.template)
                : reject("Template missing name")
              : reject("Template missing metadata")
            : reject("Template missing elements")
          : reject("Template missing")
        : reject("Invalid Object")
    })


    validTempPromise
      .then((temp) => {
        renewTemplate({ "document": temp });
      })
      .then(() => {
        pushNotification({
          content: "",
          header: "Imported Template",
          type: "Success",
          duration: 1000
        })
      })
      .catch((reason) => {
        pushNotification({
          content: reason,
          header: "Invalid Template",
          type: "Error",
          duration: 1000
        })
      })
  }

  const pushElem = (elems: DocumentElement[][], elem: DocumentElement): boolean => {
    const elemLeft = Math.floor(elem.props.position.leftOffset),
      elemTop = Math.floor(elem.props.position.topOffset);

    for (let elemArr of elems) {
      if (elemArr.length === 0) {
        elemArr.push(elem);
        return true;
      }

      for (let elemArrChild of elemArr) {
        const childLeft = Math.floor(elemArrChild.props.position.leftOffset),
          childTop = Math.floor(elemArrChild.props.position.topOffset),
          leftDifference = elemLeft - childLeft > 0 ? elemLeft - childLeft : -1 * (elemLeft - childLeft),
          topDifference = elemTop - childTop > 0 ? elemTop - childTop : -1 * (elemTop - childTop),
          closeLeft = leftDifference < 8 ? true : false,
          closeTop = topDifference < 8 ? true : false;

        if (closeLeft && closeTop) {
          elemArr.push(elem)
          return true;
        };
      }
    }

    return false;
  }

  const alignElems = () => {
    const elems: DocumentElement[][] = [[]];
    for (let elem of Object.values(canvasPage.elements)) {
      if (elem.type !== "text") continue;
      //putting close elements in groups (arrays)
      const pushed = pushElem(elems, elem);
      //if the element isn't close to anything, add it to its own group
      if (!pushed) elems.push([elem])
    }
    for (let elemArr of elems) {
      //normalize close elements to be spaced evenly (column wise)
      const fixedLeft = Math.floor(elemArr[0].props.position.leftOffset);
      let top = Math.floor(elemArr[0].props.position.topOffset);
      for (let elemChild of elemArr) {
        updateElementValue(elemChild, {
          position: {
            leftOffset: fixedLeft,
            topOffset: top,
            percentage: true
          }
        }, false)
        top += 3;
      }
    }
  }

  let previewDisabled = downloadInProg;
  let saveDisabled = saving;
  const shadowStyle: React.CSSProperties = {
    boxShadow: "inset 0 0 10px #000000",
    MozBoxShadow: "inset 0 0 10px #000000",
    WebkitBoxShadow: "inset 0 0 10px #000000"
  }

  return (
    <div>
      <div className="Toolbox">
        <button
          className="PreviewPdfButton"
          value="PDF Preview"
          onClick={() => downloadPDF(canvasPage)}
          style={previewDisabled ? { ...shadowStyle, marginRight: "1em" } : { marginRight: "1em" }}
          disabled={previewDisabled}
        >
          PDF Preview
        </button>

        <button
          className="PreviewPdfButton"
          value="Get Template"
          onClick={() => getTemplate()}>
          Get Template
                </button>
        <br />
        {postPoint ?
          <button
            className="PreviewPdfButton"
            value="Save Template"
            style={saveDisabled ? { ...shadowStyle, marginTop: 0 } : { marginTop: 0 }}
            disabled={previewDisabled}
            onClick={() => saveTemplate()}>
            Save Template
                    </button>
          : null
        }

        <input
          id="documentName"
          type="text"
          value={props.canvasPage.name}
          onChange={(event) => updateDocName(event.target.value)}
        />

        <div className="pdfSettingSelect">
          <select value={canvasPage.metaData.documentSettings.orientation} onChange={(event) => changePdfOrientation!(event.target.value)}>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
          <select value={canvasPage.metaData.documentSettings.format} onChange={(event) => changePdfFormat!(event.target.value)}>
            <option value="a4">A4</option>
            <option value="a3">A3</option>
          </select>
          <div id="DimensionsText">
            <label htmlFor="pdfWidth" style={{ display: "inline" }}>W:</label>
            <input
              type="text"
              id="pdfWidth"
              placeholder="width"
              onChange={onWidthChange}
              value={canvasPage.metaData.documentSettings.size[0]} />
            <label htmlFor="pdfHeight">H:</label>
            <input
              id="pdfHeight"
              type="text"
              placeholder="height"
              onChange={onHeightChange}
              value={canvasPage.metaData.documentSettings.size[1]} />
          </div>
        </div>


        <div className="toolBoxText">
          <input
            name="datalistInput"
            placeholder="Sample JSON Data"
            type="text"
            value={
              typeof canvasPage.metaData.templateDataSample === "object" ?
                JSON.stringify(canvasPage.metaData.templateDataSample) :
                canvasPage.metaData.templateDataSample
            }
            onChange={handleDataObjChange} />
        </div>
        <div className="toolBoxText">
          <input
            name="templateImport"
            placeholder="Paste JSON template"
            type="text"
            onChange={handleTemplateImport}
          />
        </div>
        <div>
          <input
            name="watermark"
            placeholder="Input watermark"
            type="text"
            onChange={updateWatermark}
          />
          <input
            name="watermarkColor"
            type="color"
            onChange={updateWatermarkColor}
          />
          <button
            name="watermarkAlign"
            onClick={updateWatermarkAlign}>
            {getWatermarkAlign()}
          </button>
          <button
          name="watermarkFocus"
          onClick={focusWatermark}
          >
          Move watermark
        </button>
        </div>
        <div className="Tools">
          <button
            className="PreviewPdfButton"
            onClick={() => alignElems()}>
            Align
                    </button>
          <button
            className="PreviewPdfButton"
            onClick={() => changeElemPos(focusedElement, "f")}>
            Bring to Front
                    </button>
          <button
            className="PreviewPdfButton"
            onClick={() => changeElemPos(focusedElement, "b")}>
            Send to Back
                    </button>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state: State) => {
  return {
    canvasPage: state.canvas.document,
    downloadInProg: state.misc.downloadInProgress,
    focusedElement: state.canvas.document.elements[state.canvas.focusedElement],
    watermarkElement: state.canvas.document.elements["WATERMARK"] as WatermarkElement
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    changePdfOrientation: (orientation: string) => dispatch(pdfOrientationChanged(orientation)),
    changePdfFormat: (format: string) => dispatch(pdfFormatChanged(format)),
    changePdfWidth: (width: number) => dispatch(changePdfWidth(width)),
    changePdfHeight: (height: number) => dispatch(changePdfHeight(height)),
    updateCanvasProps: (keyValuePair: object) => dispatch(editMetaData(keyValuePair)),
    renewTemplate: (keyValuePair: object) => dispatch(renewCanvasState(keyValuePair)),
    downloadClicked: () => dispatch(downloadPreviewClicked()),
    pushNotification: (notif: NotificationModel) => dispatch(pushNotification(notif)),
    appendElementToCanvas: (element: DocumentElement) => dispatch(appendElement(element)),
    changeElemPos: (elem: DocumentElement, pos: string) => dispatch(changeElemPos(elem, pos)),
    switchFocusedElement: (elementName: string) => dispatch(toggleElementFocus(elementName)),
    updateElementValue: (
      element: DocumentElement,
      keyValuePair: object,
      shouldRecordHistory: boolean
    ) => dispatch(editElementValue(element, keyValuePair, shouldRecordHistory)),
    editDocumentName: (name: string) => dispatch(editDocumentName(name)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Toolbox);
