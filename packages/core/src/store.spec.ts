import { combineReducers, createStore } from 'redux'
import {
  createReduxStoreProxy,
  createSimpluxStore,
  getInternalReduxStoreProxy,
  setReduxStore,
  simpluxStore,
  transferConfigurationToNewStore,
} from './store'

describe('store', () => {
  let cleanup: (() => void) | undefined
  let nodeEnv = ''

  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }

    process.env.NODE_ENV = nodeEnv
  })

  describe(getInternalReduxStoreProxy.name, () => {
    it(`returns the proxy`, () => {
      cleanup = setReduxStore(createStore((c: number = 10) => c), s => s)
      const proxy = getInternalReduxStoreProxy()

      expect(proxy.getState()).toBe(10)
    })

    it(`throws if proxy is not set`, () => {
      expect(getInternalReduxStoreProxy).toThrow()
    })

    it(`does not throw if proxy is not set in production`, () => {
      process.env.NODE_ENV = 'production'
      expect(getInternalReduxStoreProxy).not.toThrow()
    })
  })

  describe(setReduxStore.name, () => {
    it(`sets the store`, () => {
      cleanup = setReduxStore(createStore((c: number = 10) => c + 1), s => s)
      expect(simpluxStore.getState()).toBe(11)
    })

    it(`does not throw if store is cleaned up multiple times`, () => {
      const cleanup1 = setReduxStore(
        createStore((c: number = 10) => c + 1),
        s => s,
      )

      expect(() => {
        cleanup1()
        cleanup1()
      }).not.toThrow()
    })

    it(`throws if trying to clean up outdated store`, () => {
      const cleanup1 = setReduxStore(
        createStore((c: number = 10) => c + 1),
        s => s,
      )

      const cleanup2 = setReduxStore(
        createStore((c: number = 10) => c + 1),
        s => s,
      )

      expect(cleanup1).toThrowError('cannot cleanup store')
      cleanup2()
    })

    it(`does not throw if trying to clean up outdated store in production`, () => {
      process.env.NODE_ENV = 'production'

      const cleanup1 = setReduxStore(
        createStore((c: number = 10) => c + 1),
        s => s,
      )

      const cleanup2 = setReduxStore(
        createStore((c: number = 10) => c + 1),
        s => s,
      )

      expect(cleanup1).not.toThrowError('cannot cleanup store')
      cleanup2()
    })
  })

  it(`exports a root reducer`, () => {
    const { rootReducer } = createSimpluxStore(() => undefined!)
    const state = {}
    expect(rootReducer(state, { type: '' })).toBe(state)
  })

  it(`allows setting and getting a reducer`, () => {
    const storeProxy = createReduxStoreProxy(
      createStore(simpluxStore.rootReducer),
      s => s,
      1,
      [],
    )

    const { setReducer, getReducer } = createSimpluxStore(() => storeProxy)
    const reducer = (s = {}) => s
    setReducer('test', reducer)
    expect(getReducer('test')).toBe(reducer)
  })

  it(`allows dispatching actions`, () => {
    cleanup = setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )
    expect(simpluxStore.getState()).toBe(10)
    simpluxStore.dispatch({ type: 'INC' })
    expect(simpluxStore.getState()).toBe(11)
  })

  it(`allows subscribing to store state changes`, () => {
    cleanup = setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )

    const handler = jest.fn()
    const unsubscribe = simpluxStore.subscribe(handler)
    simpluxStore.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalled()
    unsubscribe()
  })

  it(`unsubscribes from store state changes`, () => {
    cleanup = setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )

    const handler = jest.fn()
    const unsubscribe = simpluxStore.subscribe(handler)
    simpluxStore.dispatch({ type: 'INC' })
    unsubscribe()
    simpluxStore.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it(`does not throw when unsubscribing twice from store subscription`, () => {
    cleanup = setReduxStore(createStore((c: number = 10) => c), s => s)

    const unsubscribe = simpluxStore.subscribe(jest.fn())

    expect(() => {
      unsubscribe()
      unsubscribe()
    }).not.toThrow()
  })

  it(`persists subscriptions through store changes`, () => {
    setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )

    const handler = jest.fn()
    const unsubscribe = simpluxStore.subscribe(handler)

    simpluxStore.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalledTimes(1)

    cleanup = setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )

    simpluxStore.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalledTimes(2)

    unsubscribe()
  })

  it(`cleans up subscriptions on old store on store change`, () => {
    const store1 = createStore((c: number = 10, { type }) =>
      type === 'INC' ? c + 1 : c,
    )

    setReduxStore(store1, s => s)

    const handler = jest.fn()
    const unsubscribe = simpluxStore.subscribe(handler)

    simpluxStore.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalledTimes(1)

    cleanup = setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )

    store1.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalledTimes(1)

    unsubscribe()
  })

  it(`initializes simplux state on store change`, () => {
    const storeProxy = createReduxStoreProxy(
      createStore(simpluxStore.rootReducer),
      s => s,
      1,
      [],
    )

    const store = createSimpluxStore(() => storeProxy)
    const initialState = { prop: 'value' }

    store.setReducer('test', (s = initialState) => s)

    const rootReducer = combineReducers({
      simplux: store.rootReducer,
    })

    const newStoreProxy = createReduxStoreProxy(
      createStore(rootReducer),
      (s: any) => s.simplux,
      2,
      [],
    )

    transferConfigurationToNewStore(storeProxy, newStoreProxy)

    expect(newStoreProxy.getState().test).toBe(initialState)
  })

  it(`throws if store is not set when accessing state`, () => {
    const cleanup = setReduxStore(undefined!, s => s)

    expect(() => simpluxStore.getState()).toThrowError(
      'simplux must be initialized with a redux store',
    )

    cleanup()
  })
})
