import { h } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const container = document.querySelector('#app')
render(h('div', [
  h('p', '1'),
  h('p', '2'),
  h('p', '3'),
]), container)

setTimeout(() => {
  render(h('div', [
    h('p', '4'),
    h('p', '5'),
    h('p', '6'),
  ]), container)
}, 1000)
