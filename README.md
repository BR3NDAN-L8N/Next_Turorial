# README

## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## Created Project w/This Command

```bash
npx create-next-app@latest nextjs-dashboard --example "<https://github.com/vercel/next-learn/tree/main/dashboard/starter-example>" --use-pnpm
```

## Files & Folders

### Special Files

* page.tsx
  * An index.js type file
  * Used in [Nested Routing](#nested-routing)
* layout.tsx
  * A template for a page, including things like navigation that will appear on multiple pages
* loading.tsx
  * A template to replace content that's loading
  * Learn more in [Streaming - How](#how)

### Special Folders

* (any_name_you_want)
  * Putting parens around a subfolder to allow you to seperate files in a folder without affecting routing
    * What you can do:
      * Organization files
      * Move a loading.tsx and page.tsx into this subfolder so the loading.tsx will only affect the root /dashboard page and not it's sub-routes

### File Structure

* /app: Contains all the routes, components, and logic for your application, this is where you'll be mostly working from.
* /app/lib: Contains functions used in your application, such as reusable utility functions and data fetching functions.
* /app/ui: Contains all the UI components for your application, such as cards, tables, and forms. To save time, we've pre-styled these components for you.
* /public: Contains all the static assets for your application, such as images.
* Config Files: You'll also notice config files such as next.config.js at the root of your application. Most of these files are created and pre-configured when you start a new project using create-next-app. You will not need to modify them in this course.

### Nested Routing

Next uses "file-system routing" which  relies on how folders are nested.

Utilizes page.tsx & layout.tsx (layout.tsx is a page template)

* folder = app
  * page.tsx ( <www.example.com> )
  * folder = dashboard
    * page.tsx ( <www.example.com/dashboard> )

The route '/dashboard' comes from the folder's name 'dashboard'. Changing the 1st letter, 'd', to upper/lowercase requires a restart and the route will need to be upper/lowercase to match. I.E Folder named 'Dashboard' needs a url like example.com/Dashboard

When routing, use Next.js's Link component instead of your own a-tag to keep the entire page from refreshing when using a layout

## Components

### Client vs Server

Client servers have `'use client';` at the top of the file, whereas Server components do not.

## Database

* Using Postgres
* No ORM
* seed data in app/seed/route.ts (navigate to /api in browser to run seeding)
* To not expose api secrets
  * [Route Handles](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) in the app folder
  * or use React Server Components (Next's default components)
    * Benefits:
      * Supports promises. Unlike React Components that need useEffects
      * Logic is performed on the server instead ot the user's machine
      * Doesn't require an additional API layer

In the Server Component we are requesting data in a waterfall way, where each fetch function will need to finish before moving onto the next. Below is an example.

```ts
const revenue = await fetchRevenue()                // wait for this before moving on
const latestInvoices = await fetchLatestInvoices()  // then wait for this
const {
  numberOfCustomers,
  numberOfInvoices,
  totalPaidInvoices,
  totalPendingInvoices,
} = await fetchCardData()                           // then we can do this
```

Sometimes we need to wait for a previous request to complete before doing another.

To run requests in parallel we can use `promise.all()`

```ts
const data = await Promise.all([                    // all 3 requests start at the same time
  invoiceCountPromise,
  customerCountPromise,
  invoiceStatusPromise,
]);
```

## Static vs Dynamic Rendering

### Static Rendering

Rendering happens at build OR when [revalidating data](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#revalidating-data) whether revalidating on a timer or on-demand.

* Benefits
  * Faster Websites - content is cached
  * Reduced Server Load - because of cache
  * SEO - Prerendered content is easier for search engine crawlers to index.
* When to use?
  * When the ui has no/shared data for all users. Personalized data with regular updates won't be prerendered.

### Dynamic Rendering

Rendering happens at **request time** (when the user visits the page). Can cause the page to load slow.

* Benefits
  * Real-Time Data - Displaying frequently updated data
  * User-Specific Content - Serves updated data based on user interaction
  * Request Time Information - When info can't be served until some specific data is sent to the server

## Streaming - NOT like Netflix & Chill

### What

* A data transfer technique loading data as 'chunks' and streaming them as they become ready.

### Why

* Prevents slow data requests from blocking the rest of the page from loading.

### How

* Page Level: using the 'loading.tsx', or
* Specific Component: the `<Suspense></Suspense>` element.

#### Page Level Streaming

1. Create a folder called (overview) w/the parenthesis
2. Move the page.jsx file into the new folder
3. Add a loading.tsx file into the new folder
4. Add to loading.tsx the loading spinner or visuals you want to display

#### Suspense Component

1. Import the Suspense component from React
2. Wrap the component you want to be suspended (The component should be extracted into it's own file and handling it's own data fetching)
3. Assign to the 'fallback' property of the Suspense element what you want to user to see while waiting for the ui to load.

## Partial Prerendering

Currently Experimental

Allows you to combine the benefits of static and dynamic rendering to same route. Static content is rendered with holes in the UI for where the dynamic stuff will be loaded once it's ready.

### 1

In the next.config.mjs file in the root of the project, add the experimental code the nextConfig

```ts
const nextConfig = {
  experimental: {
    ppr: 'incremental',
  },
};
```

### 2

In the component's file, outside the component, add `export const experimental_ppr = true;`

## Search w/URL Search Params

### Benefits

* URLs become Bookmarkable and Sharable
* The server can render the intial state of the page with search params in the URL
* Easier to track use behaviour without additional client-side logic

### Next.js's Client Hooks

* `useSearchParams()` - Lets us access the params in the url
  * `/dashboard/invoices?page=1&query=pending` will look like `{page: '1', query: 'pending'}`
* `usePathname` - Lets us access the current url's pathname
  * for `/dashboard/invoices` usePathname would return `/dashboard/invoices`
* `useRouter` - Lets us programmatically navigate between routes within the client component
  * [Multiple methods exist](https://nextjs.org/docs/app/api-reference/functions/use-router#userouter)

### How To Do It

Checkout `/app/ui/search.tsx` to see it in action

1. Capture the user's input
2. Update the URL with search params
3. Keep the URL in sync with the input field
4. Update the table to reflect the search query

### Debouncing

Used to stop search queries from sending an API request on each keystroke.

[Code uses npm package 'use-debounce'](https://www.npmjs.com/package/use-debounce)

```ts
// pnpm i use-debounce
import { useDebouncedCallback } from 'use-debounce'

export default function Search({ placeholder }: { placeholder: string }) {

// code...

const handleSearch = useDebouncedCallback((term) => {
  console.log(`Searching... ${term}`);
  // CREATE THE PARAM OBJECT FOR THE URL
  const params = new URLSearchParams(searchParams)
  params.set('page', '1');

  if (term) {
   params.set('query', term); // query === ?query=asdf
  } else {
   params.delete('query');
  }

  replace(`${pathname}?${params.toString()}`);  // http://localhost:3000/dashboard/invoices?query=asdf
 }, 1_000)

 return (
   // code...
 )

}
```
