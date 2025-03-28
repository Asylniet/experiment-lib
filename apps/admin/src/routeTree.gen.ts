/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AuthenticatedImport } from './routes/_authenticated'

// Create Virtual Routes

const LoginIndexLazyImport = createFileRoute('/login/')()
const AuthenticatedIndexLazyImport = createFileRoute('/_authenticated/')()
const AuthenticatedProjectProjectIdIndexLazyImport = createFileRoute(
  '/_authenticated/project/$projectId/',
)()
const AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyImport =
  createFileRoute(
    '/_authenticated/project/$projectId/experiment/$experimentId/',
  )()

// Create/Update Routes

const AuthenticatedRoute = AuthenticatedImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRoute,
} as any)

const LoginIndexLazyRoute = LoginIndexLazyImport.update({
  id: '/login/',
  path: '/login/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login/index.lazy').then((d) => d.Route))

const AuthenticatedIndexLazyRoute = AuthenticatedIndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthenticatedRoute,
} as any).lazy(() =>
  import('./routes/_authenticated/index.lazy').then((d) => d.Route),
)

const AuthenticatedProjectProjectIdIndexLazyRoute =
  AuthenticatedProjectProjectIdIndexLazyImport.update({
    id: '/project/$projectId/',
    path: '/project/$projectId/',
    getParentRoute: () => AuthenticatedRoute,
  } as any).lazy(() =>
    import('./routes/_authenticated/project/$projectId/index.lazy').then(
      (d) => d.Route,
    ),
  )

const AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyRoute =
  AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyImport.update({
    id: '/project/$projectId/experiment/$experimentId/',
    path: '/project/$projectId/experiment/$experimentId/',
    getParentRoute: () => AuthenticatedRoute,
  } as any).lazy(() =>
    import(
      './routes/_authenticated/project/$projectId/experiment/$experimentId/index.lazy'
    ).then((d) => d.Route),
  )

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_authenticated': {
      id: '/_authenticated'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthenticatedImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated/': {
      id: '/_authenticated/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof AuthenticatedIndexLazyImport
      parentRoute: typeof AuthenticatedImport
    }
    '/login/': {
      id: '/login/'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated/project/$projectId/': {
      id: '/_authenticated/project/$projectId/'
      path: '/project/$projectId'
      fullPath: '/project/$projectId'
      preLoaderRoute: typeof AuthenticatedProjectProjectIdIndexLazyImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/project/$projectId/experiment/$experimentId/': {
      id: '/_authenticated/project/$projectId/experiment/$experimentId/'
      path: '/project/$projectId/experiment/$experimentId'
      fullPath: '/project/$projectId/experiment/$experimentId'
      preLoaderRoute: typeof AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyImport
      parentRoute: typeof AuthenticatedImport
    }
  }
}

// Create and export the route tree

interface AuthenticatedRouteChildren {
  AuthenticatedIndexLazyRoute: typeof AuthenticatedIndexLazyRoute
  AuthenticatedProjectProjectIdIndexLazyRoute: typeof AuthenticatedProjectProjectIdIndexLazyRoute
  AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyRoute: typeof AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyRoute
}

const AuthenticatedRouteChildren: AuthenticatedRouteChildren = {
  AuthenticatedIndexLazyRoute: AuthenticatedIndexLazyRoute,
  AuthenticatedProjectProjectIdIndexLazyRoute:
    AuthenticatedProjectProjectIdIndexLazyRoute,
  AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyRoute:
    AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyRoute,
}

const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren,
)

export interface FileRoutesByFullPath {
  '': typeof AuthenticatedRouteWithChildren
  '/': typeof AuthenticatedIndexLazyRoute
  '/login': typeof LoginIndexLazyRoute
  '/project/$projectId': typeof AuthenticatedProjectProjectIdIndexLazyRoute
  '/project/$projectId/experiment/$experimentId': typeof AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyRoute
}

export interface FileRoutesByTo {
  '/': typeof AuthenticatedIndexLazyRoute
  '/login': typeof LoginIndexLazyRoute
  '/project/$projectId': typeof AuthenticatedProjectProjectIdIndexLazyRoute
  '/project/$projectId/experiment/$experimentId': typeof AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_authenticated': typeof AuthenticatedRouteWithChildren
  '/_authenticated/': typeof AuthenticatedIndexLazyRoute
  '/login/': typeof LoginIndexLazyRoute
  '/_authenticated/project/$projectId/': typeof AuthenticatedProjectProjectIdIndexLazyRoute
  '/_authenticated/project/$projectId/experiment/$experimentId/': typeof AuthenticatedProjectProjectIdExperimentExperimentIdIndexLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/'
    | '/login'
    | '/project/$projectId'
    | '/project/$projectId/experiment/$experimentId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/login'
    | '/project/$projectId'
    | '/project/$projectId/experiment/$experimentId'
  id:
    | '__root__'
    | '/_authenticated'
    | '/_authenticated/'
    | '/login/'
    | '/_authenticated/project/$projectId/'
    | '/_authenticated/project/$projectId/experiment/$experimentId/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  AuthenticatedRoute: typeof AuthenticatedRouteWithChildren
  LoginIndexLazyRoute: typeof LoginIndexLazyRoute
}

const rootRouteChildren: RootRouteChildren = {
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  LoginIndexLazyRoute: LoginIndexLazyRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_authenticated",
        "/login/"
      ]
    },
    "/_authenticated": {
      "filePath": "_authenticated.tsx",
      "children": [
        "/_authenticated/",
        "/_authenticated/project/$projectId/",
        "/_authenticated/project/$projectId/experiment/$experimentId/"
      ]
    },
    "/_authenticated/": {
      "filePath": "_authenticated/index.lazy.tsx",
      "parent": "/_authenticated"
    },
    "/login/": {
      "filePath": "login/index.lazy.tsx"
    },
    "/_authenticated/project/$projectId/": {
      "filePath": "_authenticated/project/$projectId/index.lazy.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/project/$projectId/experiment/$experimentId/": {
      "filePath": "_authenticated/project/$projectId/experiment/$experimentId/index.lazy.tsx",
      "parent": "/_authenticated"
    }
  }
}
ROUTE_MANIFEST_END */
