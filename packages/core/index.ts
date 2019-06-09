import { createStore, Store } from 'redux'
import {
  createModule,
  registerModuleExtension,
  SimpluxModule,
  SimpluxModuleConfig,
  SimpluxModuleExtension,
} from './src/module'
import { mutationsModuleExtension } from './src/mutations'
import { setReduxStore, simpluxStore } from './src/store'

registerModuleExtension(mutationsModuleExtension, 100)

// we create and set a default redux store for simple scenarios
setReduxStoreForSimplux(createStore(getSimpluxReducer()), s => s)

export {
  SimpluxModule,
  SimpluxModuleConfig,
  SimpluxModuleCore,
  SimpluxModuleExtension,
  StateChangeHandler,
  SubscribeToStateChanges,
  Unsubscribe,
} from './src/module'
export {
  MutationBase,
  MutationReturnType,
  MutationReturnTypeOverride,
  MutationsBase,
  MutationsFactory,
  ResolvedMutation,
  ResolvedMutationExtras,
  ResolvedMutations,
  SimpluxModuleMutationExtensions,
} from './src/mutations'
export { SimpluxStore } from './src/store'

// tslint:disable: max-line-length (cannot line break the links)

/**
 * Returns the root reducer that manages all simplux state.
 * This reducer should be combined with all the other reducers
 * your application has.
 *
 * To learn more, have a look at the [getting started recipe](https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/getting-started).
 *
 * @returns the simplux root reducer
 */
export function getSimpluxReducer() {
  return simpluxStore.rootReducer
}

/**
 * Create a new simplux module.
 *
 * A module has a unique name (provided via the `config` parameter)
 * and a type of state it contains (the initial state is provided via
 * the `config` parameter).
 *
 * The returned module contains functions for basic interaction with
 * the module as well as any other functions that are provided by the
 * extension packages you have loaded.
 *
 * To learn more, have a look at the [getting started recipe](https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/getting-started).
 *
 * @param config the configuration values for the module
 *
 * @returns the created module
 */
export function createSimpluxModule<TState>(
  config: SimpluxModuleConfig<TState>,
): SimpluxModule<TState> {
  return createModule(simpluxStore, config)
}

/**
 * Set the redux store that simplux should use. It is required to call
 * this function before any created simplux module can be used.
 *
 * The second parameter must be a function that maps from the redux store's
 * root state to the simplux root state.
 *
 * If this function is called again with a new store, simplux will safely
 * switch over to the new store. However, no state is transferred and
 * therefore all modules are reset to their initial state. This is primarily
 * useful in server-side rendering scenarios.
 *
 * To learn more, have a look at the [getting started recipe](https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/getting-started).
 *
 * @param storeToUse the redux store that simplux should use
 * @param simpluxStateGetter a mapper function from the redux root state
 * to the simplux root state
 *
 * @returns a cleanup function that when called disconnects simplux from the
 * redux store (but it does not remove any of the simplux state from the store)
 */
export function setReduxStoreForSimplux<TState>(
  storeToUse: Store<TState>,
  simpluxStateGetter: (rootState: TState) => any,
) {
  return setReduxStore(storeToUse, simpluxStateGetter)
}

/**
 * Register a new module extension for simplux.
 *
 * @param extension the extension to register
 * @param [order] a number that determines the order in which the extensions
 * are applied (i.e. in ascending order)
 *
 * @returns a cleanup function that when called unregisters the extension
 * (however, all modules that have been created while the extension was
 * registered will still have access to the extension)
 */
export function registerSimpluxModuleExtension(
  extension: SimpluxModuleExtension,
  order?: number,
) {
  return registerModuleExtension(extension, order)
}
