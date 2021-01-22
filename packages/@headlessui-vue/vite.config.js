import fs from 'fs'
import path from 'path'

import prettier from 'prettier'
import vue from '@vitejs/plugin-vue'
import Prism from 'prismjs'

import 'prismjs/plugins/custom-class/prism-custom-class'

import routes from './examples/src/routes.json'

function flatten(routes, resolver) {
  return routes
    .map(route => (route.children ? flatten(route.children, resolver) : resolver(route)))
    .flat(Infinity)
}

// This is a hack, but the idea is that we want to import all the examples from the routes.json
// file. However just doing dynamic imports() doesn't work well at build time. Therefore we will
// generate a fake file that contains them all.
let i = 0
const map = {}
const contents = flatten(routes, route => route.component)
  .map(path => {
    const name = `Component$${++i}`
    map[path] = name
    return `import ${name} from ".${path}";`
  })
  .join('\n')
fs.writeFileSync(
  path.resolve(__dirname, './examples/src/.generated/preload.js'),
  `${contents}\n\nexport default {\n${Object.entries(map)
    .map(([path, name]) => `  "${path}": ${name}`)
    .join(',\n')}\n}`,
  'utf8'
)

// ---

function pipe(...fns) {
  return fns.reduceRight((f, g) => (...args) => f(g(...args)), fns.pop())
}

Prism.plugins.customClass.map({
  tag: 'text-code-red',
  'attr-name': 'text-code-yellow',
  'attr-value': 'text-code-green',
  deleted: 'text-code-red',
  inserted: 'text-code-green',
  punctuation: 'text-code-white',
  keyword: 'text-code-purple',
  string: 'text-code-green',
  function: 'text-code-blue',
  boolean: 'text-code-red',
  comment: 'text-gray-400 italic',
})

const sourcePipeline = pipe(
  path => fs.readFileSync(path, 'utf8'),
  contents =>
    prettier.format(contents, {
      parser: 'vue',
      printWidth: 100,
      semi: false,
      singleQuote: true,
      trailingComma: 'es5',
    }),
  contents => Prism.highlight(contents, Prism.languages.markup),
  contents =>
    [
      '<pre class="language-vue rounded-md bg-gray-800 py-3 px-4 overflow-x-auto">',
      '<code class="language-vue text-gray-200">',
      contents,
      '</code>',
      '</pre>',
    ].join('')
)

const skipRoutes = ['/']
const source = Object.assign(
  {},
  ...flatten(routes, route => ({
    urlPath: route.path,
    sourcePath: route.component,
  }))
    .filter(({ urlPath }) => !skipRoutes.includes(urlPath))
    .map(({ urlPath, sourcePath }) => ({
      [urlPath]: sourcePipeline(path.resolve(__dirname, 'examples', 'src', sourcePath), 'utf8'),
    }))
)
fs.writeFileSync(
  path.resolve(__dirname, './examples/src/.generated/source.json'),
  JSON.stringify(source, null, 2),
  'utf8'
)

// ---

function tailwindui() {
  return {
    name: 'tailwindui',
    /**
     * Despite being called `transformIndexHtml` this actually handles *all*
     * HTML file requests. So this is where we transform the component source
     * files to standard HTML documents.
     *
     * https://vitejs.dev/guide/api-plugin.html#transformindexhtml
     */
    transformIndexHtml: {
      transform: async (html, ctx) => {
        let routePaths = flatten(routes, route => route.path)
        if (routePaths.includes(ctx.path)) {
          ctx.path = './index.html'
        }

        return html
      },
    },
  }
}

/**
 * @type {import('vite').UserConfig}
 */
export default {
  alias: {
    '@headlessui/vue': path.resolve(__dirname, './src/index.ts'),
  },
  plugins: [tailwindui(), vue()],
}
