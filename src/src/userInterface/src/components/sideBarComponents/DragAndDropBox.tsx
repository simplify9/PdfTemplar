import * as React from "react";
import Draggable from "../minorComponents/Draggable"

const DragAndDropBox = () => {
    return (
        <div>
            <div className="DragAndDropBox">
                <Draggable 
                    imageSource="images/edit.png"
                    draggableName="Text"
                    key="1"
                    usableKey="1"
                />
                <Draggable 
                    imageSource="images/picture.png"
                    draggableName="Image"
                    key="2"
                    usableKey="2"
                />
                <Draggable 
                    imageSource="images/barcode.png"
                    draggableName="Barcode"
                    key="3"
                    usableKey="3"
                />
                <Draggable
                    imageSource="images/qr-code.png"
                    draggableName="QR Code"
                    key="4"
                    usableKey="4"
                />
                <Draggable
                    imageSource="images/rect.png"
                    draggableName="Rectangle"
                    key="5"
                    usableKey="5"
                />
                <Draggable 
                    imageSource="images/lineComp.png"
                    draggableName="line"
                    key="6"
                    usableKey="6"
                />
            </div>
        </div>
    )
}

export default DragAndDropBox;