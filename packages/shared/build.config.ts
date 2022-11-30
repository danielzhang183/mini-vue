import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      define: {
        __DEV__: process.env.NODE_ENV !== 'production',
      },
    },
  },
})
