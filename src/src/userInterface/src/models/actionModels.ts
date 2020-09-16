import { NotificationModel } from './stateModels';
import { DocumentElement } from "./documentModels"

export interface ElementRelatedAction {
  type: string,
  element: DocumentElement
  elementName: string
  keyValuePair: any
  shouldRecordHistory: boolean
  position: string
  width: number
  height: number
}

export interface NotificationAction {
  type: string,
  notification?: NotificationModel
  notifIdx?: number
}

export interface MiscAction {
  type: string,
  sideBarComponent?: string,
  hide?: boolean
  draggable?: string
  dragOffsets?: number[]
}

export interface AutocompleteAction {
  type: string,
  index: number
}

export interface PDFSettingsAction {
  type: string,
  orientation?: string
  width?: number
  height?: number
  format?: string
}

export interface HistoryRelatedAction {
  type: string
}

