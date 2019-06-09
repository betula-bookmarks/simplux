# simplux - redux made simple

**simplux** is state management as it should be: simple to use, no boilerplate, type-safe but not verbose - all while giving you the full power of redux.

[![npm version](https://badge.fury.io/js/%40simplux%2Fcore.svg)](https://www.npmjs.com/package/@simplux/core)
[![Build Status](https://travis-ci.org/MrWolfZ/simplux.svg?branch=master)](https://travis-ci.org/MrWolfZ/simplux)
[![codecov](https://codecov.io/gh/MrWolfZ/simplux/branch/master/graph/badge.svg)](https://codecov.io/gh/MrWolfZ/simplux)
[![license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

This repository is a work-in-progress and is not suitable for use in production just yet.

## Recipes

Here are some recipes that will show you how **simplux** can make life simple for you.

> For every "How do I do X?" you have ever asked yourself, there should be a recipe here. If you find one that is missing, please let us know by creating an issue or even better, provide the recipe as a pull request.

### Basics

- [getting started](recipes/basics/getting-started#readme)
- [testing state changes](recipes/basics/testing-state-changes#readme)
- [simplifying state changes](recipes/basics/simplifying-state-changes#readme)
- [computing derived state](recipes/basics/computing-derived-state#readme)
- [testing derived state](recipes/basics/testing-derived-state#readme)
- [performing asynchronous tasks](recipes/basics/performing-async-tasks#readme) (work-in-progress)
- [testing asynchronous tasks](recipes/basics/testing-async-tasks#readme) (work-in-progress)

### Advanced

- [using **simplux** in my application that already uses Redux](recipes/advanced/using-in-redux-application#readme)
- [debugging with Redux DevTools](recipes/advanced/debugging-with-redux-devtools#readme) (work-in-progress)
- [reacting to state changes](recipes/advanced/reacting-to-state-changes#readme) (work-in-progress)
- [organizing my application state](recipes/advanced/organizing-application-state#readme) (work-in-progress)
- [composing mutations](recipes/advanced/composing-mutations#readme)
- [composing selectors](recipes/advanced/composing-selectors#readme) (work-in-progress)
- [communicating between modules](recipes/advanced/communicating-between-modules#readme) (work-in-progress)
- [using Reselect for my selectors](recipes/advanced/using-reselect-for-selectors#readme) (work-in-progress)
- [coordinating complex asynchronous workflows](recipes/advanced/coordinating-complex-asynchronous-workflows#readme) (work-in-progress)

### React

- [using **simplux** in my React application](recipes/react/using-in-react-application#readme) (work-in-progress)
- [testing my components that read and change state](recipes/react/testing-components-using-state#readme) (work-in-progress)
- [testing my components that trigger async work](recipes/react/testing-components-using-async#readme) (work-in-progress)
- [using **simplux** with React Redux](recipes/react/using-with-react-redux#readme) (work-in-progress)
- [using lazy loaded components/code splitting](recipes/react/using-lazy-loading-code-splitting#readme) (work-in-progress)
- [using hot module reloading (HMR)](recipes/react/using-hot-module-reloading#readme) (work-in-progress)
- [using server-side rendering (SSR)](recipes/react/using-server-side-rendering#readme) (work-in-progress)
- [using **simplux** in my React Native application](recipes/react/using-in-react-native-application#readme) (work-in-progress)

### Angular

- [using **simplux** in my Angular application](recipes/angular/using-in-angular-application#readme) (work-in-progress)

## Motivation

When discovering this library your first thought may have been: "Are you kidding me, yet another state management library?" That is an absolutely valid thought to have. There are many existing options for managing your state in JavaScript applications. If you are already using one of those and it works for you, then you should probably stick with it. However, **simplux** brings some unique points to the table that make it a worthwhile addition to the state management ecosystem:

- **excellent use-case driven documentation:** a lot of effort went into writing our [recipes](#recipes). While most other libraries have documentation that is centered around explaining _what_ they do, our use-case driven documentation is focused on showing you _how_ **simplux** helps you to solve your concrete tasks. We also provide code sandboxes for every recipe that allow you to interact with the code while reading the recipe, which greatly improves the learning experience.

- **optimized for TypeScript**: **simplux** is built with and for TypeScript. Sometimes TypeScript code can be a bit verbose. We put a lot of effort into ensuring that the amount of type annotations in your code is minimized by leveraging type inference wherever possible. That said **simplux** can also be used with plain JavaScript, in which case your IDE may still use the TypeScript information to help you due to our bundled typings.

- **out of the box solutions for many common yet complex use-cases**: Have you ever tried setting up hot module reloading or code splitting with React and Redux? It can be quite tricky. **simplux** aims to solve as many of these complex use-cases by providing zero-configuration out of the box solutions.

- **modular and extensible architecture**: Our core package only contains the bare minimum that is required to use **simplux**. All other advanced functionality is added via extension packages. On one hand this allows you to pick and choose what functionality you want to use without paying for anything that you don't. On the other hand it allows adding new extension packages without risk of breaking any existing functionality.

## Prior Art

This library was heavily inspired by [Rematch](https://rematch.gitbooks.io/rematch) and shares a lot of ideas with it.

## Open points

- core: add testing package that allows mocking mutations
- selectors: add extension for creating factory selectors
- selectors: add testing package that allows mocking selectors
- selectors: add test to verify store is not eagerly accessed
- selectors: add basic memoization (also update derived state recipe with example of this)
- react: allow passing parameterless selector factories directly to `useSelector`
- react: verify package works with react-native
- async: create package for performing async work for a module
- async: add testing package that allows mocking async work
- async: support cancelling work
- observable: create package for getting an observable of module state changes
- observable: add support for observable epics
- observable: add test to verify store is not eagerly accessed
- observable: add way to get observable of actions
- entities: create package for managing collections of entities
- entities: create default set of entity management mutations
- entities: allow creating custom mutations that act on one entity
- entities: create default set of selectors for entities
- docs: create website
- docs: write docs for each package
- add dtslint tests (and add TypeScript peer dependencies to packages)
- add tests that verify HMR works
- add tests that verify server-side rendering works
- angular: create package for angular service
- core: add way to susbcribe to mutations (if a use case exists for this)
- core: add type to mutation extras

## Contributing

If you want to help with the development of this library please have a look at the [contributing guidelines](CONTRIBUTING.md).

## License

Everything in this repository is [licensed under the MIT License](LICENSE) unless otherwise specified.

Copyright (c) 2019-present Jonathan Ziller
