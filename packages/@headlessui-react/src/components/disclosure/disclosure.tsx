// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#disclosure
import * as React from 'react'

import { Props } from '../../types'
import { match } from '../../utils/match'
import { forwardRefWithAs, render, Features, PropsForFeatures } from '../../utils/render'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useId } from '../../hooks/use-id'
import { Keys } from '../keyboard'
import { isDisabledReactIssue7711 } from '../../utils/bugs'

enum DisclosureStates {
  Open,
  Closed,
}

interface StateDefinition {
  disclosureState: DisclosureStates

  linkedPanel: boolean

  buttonId: string
  panelId: string
}

enum ActionTypes {
  ToggleDisclosure,

  SetButtonId,
  SetPanelId,

  LinkPanel,
  UnlinkPanel,
}

type Actions =
  | { type: ActionTypes.ToggleDisclosure }
  | { type: ActionTypes.SetButtonId; buttonId: string }
  | { type: ActionTypes.SetPanelId; panelId: string }
  | { type: ActionTypes.LinkPanel }
  | { type: ActionTypes.UnlinkPanel }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.ToggleDisclosure]: state => ({
    ...state,
    disclosureState: match(state.disclosureState, {
      [DisclosureStates.Open]: DisclosureStates.Closed,
      [DisclosureStates.Closed]: DisclosureStates.Open,
    }),
  }),
  [ActionTypes.LinkPanel]: state => ({ ...state, linkedPanel: true }),
  [ActionTypes.UnlinkPanel]: state => ({ ...state, linkedPanel: false }),
  [ActionTypes.SetButtonId]: (state, action) => ({ ...state, buttonId: action.buttonId }),
  [ActionTypes.SetPanelId]: (state, action) => ({ ...state, panelId: action.panelId }),
}

let DisclosureContext = React.createContext<[StateDefinition, React.Dispatch<Actions>] | null>(null)
DisclosureContext.displayName = 'DisclosureContext'

function useDisclosureContext(component: string) {
  let context = React.useContext(DisclosureContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <${Disclosure.name} /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDisclosureContext)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_DISCLOSURE_TAG = React.Fragment
interface DisclosureRenderPropArg {
  open: boolean
}

export function Disclosure<TTag extends React.ElementType = typeof DEFAULT_DISCLOSURE_TAG>(
  props: Props<TTag, DisclosureRenderPropArg>
) {
  let buttonId = `headlessui-disclosure-button-${useId()}`
  let panelId = `headlessui-disclosure-panel-${useId()}`

  let reducerBag = React.useReducer(stateReducer, {
    disclosureState: DisclosureStates.Closed,
    linkedPanel: false,
    buttonId,
    panelId,
  } as StateDefinition)
  let [{ disclosureState }, dispatch] = reducerBag

  React.useEffect(() => dispatch({ type: ActionTypes.SetButtonId, buttonId }), [buttonId])
  React.useEffect(() => dispatch({ type: ActionTypes.SetPanelId, panelId }), [panelId])

  let propsBag = React.useMemo(() => ({ open: disclosureState === DisclosureStates.Open }), [
    disclosureState,
  ])

  return (
    <DisclosureContext.Provider value={reducerBag}>
      {render(props, propsBag, DEFAULT_DISCLOSURE_TAG)}
    </DisclosureContext.Provider>
  )
}

// ---

let DEFAULT_BUTTON_TAG = 'button'
interface ButtonRenderPropArg {
  open: boolean
}
type ButtonPropsWeControl =
  | 'id'
  | 'type'
  | 'aria-expanded'
  | 'aria-controls'
  | 'onKeyDown'
  | 'onClick'

let Button = forwardRefWithAs(function Button<
  TTag extends React.ElementType = typeof DEFAULT_BUTTON_TAG
>(
  props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>,
  ref: React.Ref<HTMLButtonElement>
) {
  let [state, dispatch] = useDisclosureContext([Disclosure.name, Button.name].join('.'))
  let buttonRef = useSyncRefs(ref)

  let handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault()
          dispatch({ type: ActionTypes.ToggleDisclosure })
          break
      }
    },
    [dispatch]
  )

  let handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return
      if (props.disabled) return
      dispatch({ type: ActionTypes.ToggleDisclosure })
    },
    [dispatch, props.disabled]
  )

  let propsBag = React.useMemo(() => ({ open: state.disclosureState === DisclosureStates.Open }), [
    state,
  ])

  let passthroughProps = props
  let propsWeControl = {
    ref: buttonRef,
    id: state.buttonId,
    type: 'button',
    'aria-expanded': state.disclosureState === DisclosureStates.Open ? true : undefined,
    'aria-controls': state.linkedPanel ? state.panelId : undefined,
    onKeyDown: handleKeyDown,
    onClick: handleClick,
  }

  return render({ ...passthroughProps, ...propsWeControl }, propsBag, DEFAULT_BUTTON_TAG)
})

// ---

let DEFAULT_PANEL_TAG = 'div'
interface PanelRenderPropArg {
  open: boolean
}
type PanelPropsWeControl = 'id'

let PanelRenderFeatures = Features.RenderStrategy | Features.Static

let Panel = forwardRefWithAs(function Panel<
  TTag extends React.ElementType = typeof DEFAULT_PANEL_TAG
>(
  props: Props<TTag, PanelRenderPropArg, PanelPropsWeControl> &
    PropsForFeatures<typeof PanelRenderFeatures>,
  ref: React.Ref<HTMLDivElement>
) {
  let [state, dispatch] = useDisclosureContext([Disclosure.name, Panel.name].join('.'))
  let panelRef = useSyncRefs(ref, () => {
    if (state.linkedPanel) return
    dispatch({ type: ActionTypes.LinkPanel })
  })

  // Unlink on "unmount" myself
  React.useEffect(() => () => dispatch({ type: ActionTypes.UnlinkPanel }), [])

  // Unlink on "unmount" children
  React.useEffect(() => {
    if (state.disclosureState === DisclosureStates.Closed && (props.unmount ?? true)) {
      dispatch({ type: ActionTypes.UnlinkPanel })
    }
  }, [state.disclosureState, props.unmount])

  let propsBag = React.useMemo(() => ({ open: state.disclosureState === DisclosureStates.Open }), [
    state,
  ])
  let propsWeControl = {
    ref: panelRef,
    id: state.panelId,
  }
  let passthroughProps = props

  return render(
    { ...passthroughProps, ...propsWeControl },
    propsBag,
    DEFAULT_PANEL_TAG,
    PanelRenderFeatures,
    state.disclosureState === DisclosureStates.Open
  )
})

// ---

Disclosure.Button = Button
Disclosure.Panel = Panel
