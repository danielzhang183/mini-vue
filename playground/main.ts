import { h } from '@mini-vue/runtime-core'
import { render } from '@mini-vue/runtime-dom'

const container = document.querySelector('#app')
render(h('div', [
  h('p', { key: 4 }, '4'),
  // h('p', { key: 5 }, '5'),
]), container!)

setTimeout(() => {
  render(h('div', [
    h('p', { key: 1 }, '1'),
    // h('p', { key: 2 }, '2'),
    // h('p', { key: 3 }, '3'),
    h('p', { key: 4 }, '4'),
    // h('p', { key: 5 }, '5'),
  ]), container!)
}, 1000)
