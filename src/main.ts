import { mount } from 'svelte'
import './app.css'
import WizardI18nApp from './WizardI18nApp.svelte'

const app = mount(WizardI18nApp, {
  target: document.getElementById('app')!,
})

export default app
