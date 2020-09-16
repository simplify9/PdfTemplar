import { DocumentElement, DocumentRoot } from "./documentModels"

export interface HistoryState {
  pastStates: CanvasState[]
  futureStates: CanvasState[]
}

export interface NotificationModel {
  type: string
  header: string
  content: string
  duration: number
  clearer?: any
  index?: number
}
export interface MiscState {
  draggableDragged: string
  hiddenSideBarComponents: string[]
  downloadInProgress: boolean
  showModel: boolean
  offsets: number[]
}

export interface CanvasState {
  document: DocumentRoot
  focusedElement: string
  history: HistoryState
}

export interface AutocompleteState {
  index: number
}

export interface State {
  canvas: CanvasState
  history: HistoryState
  misc: MiscState
  autocomplete: AutocompleteState
  notifications: NotificationModel[]
}
