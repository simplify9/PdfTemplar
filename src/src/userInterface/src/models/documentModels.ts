export type Coordinates = { x1: number, x2: number | null, y1: number, y2: number | null }
export type Position = { topOffset: number, leftOffset: number, percentage: boolean }
export type ElementProps = LineProps | ImageProps | TextProps | RectangleProps | CodeProps | WatermarkProps
export type DocumentElement = LineElement | RectangleElement | ImageElement | TextElement | CodeElement | WatermarkElement
export type Elements = { [elementName: string]: DocumentElement }

export interface DocumentRoot {
  name: string
  elements: Elements
  metaData: MetaData
}


export interface DocumentSettings {
  format: string
  orientation: string
  size: number[]
}

export interface MetaData {
  templateVersion: string
  templateDataSample: any
  documentSettings: DocumentSettings
}

export interface ElementPropsBase {
  className: string
  placeholder: boolean
  position: Position
}

export interface TextProps extends ElementPropsBase {
  value: string
  fontFamily: string
  fontWeight: "bold" | "normal"
  fontStyle: "italic" | "normal"
  fontSize: number
  fontColor: string
  hyperLink: string
  charLimit?: number
}

export interface DrawnElement extends ElementPropsBase {
  width: number
  height: number
  rotation: number
  transformOrigin: any
  aspectRatio: number
}

export interface ImageProps extends DrawnElement {
  value: string
}


export interface CodeProps extends DrawnElement {
  value: string
  codeFormat: string
}

export interface LineProps extends ElementPropsBase {
  strokeWidth: number
  strokeColor: string
  width: number
  aspectRatio: number
  height: number
  coordinates: Coordinates
}

export interface RectangleProps extends ElementPropsBase {
  aspectRatio: number
  strokeWidth: number
  width: number
  height: number
  fillColor: string
  strokeColor: string
}

export enum WatermarkAlign {
  DIAGONALTD,
  HORIZONTAL,
  VERTICAL,
  DIAGONALDT,
}

export interface WatermarkProps extends ElementPropsBase {
  value: string
  color: string
  active?: boolean
  align: WatermarkAlign
}


export interface TextElement extends DocumentElementBase {
  type: "text"
  props: TextProps
}

export interface ImageElement extends DocumentElementBase {
  type: "image"
  props: ImageProps
}

export interface CodeElement extends DocumentElementBase {
  type: "barcode" | "qrcode"
  props: CodeProps
}

export interface LineElement extends DocumentElementBase {
  type: "line"
  props: LineProps
}

export interface RectangleElement extends DocumentElementBase {
  type: "rectangle"
  props: RectangleProps
}

export interface WatermarkElement extends DocumentElementBase {
  type: "watermark"
  props: WatermarkProps
}


export interface DocumentElementBase {
  name: string
  type: "text" | "root" | "image" |
  "barcode" | "qrcode" | "rectangle" |
  "line" | "watermark"
  index: number
  props: ElementProps
}


