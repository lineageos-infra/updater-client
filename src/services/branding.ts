import DefaultLogo from '@/assets/logo.svg?component'
import { h, type FunctionalComponent } from 'vue'
import {
  BRAND_COLOR_LIGHT,
  BRAND_COLOR_DARK,
  BRAND_COLOR_PRIMARY,
  LOGO_SVG,
  FAVICON_URL
} from './config'

export const Logo: FunctionalComponent = LOGO_SVG
  ? () => h('div', { innerHTML: LOGO_SVG })
  : DefaultLogo

export const applyBranding = () => {
  const colorOverrides: Record<string, string | undefined> = {
    '--color-brand-light': BRAND_COLOR_LIGHT,
    '--color-brand-dark': BRAND_COLOR_DARK,
    '--color-brand-primary': BRAND_COLOR_PRIMARY
  }

  for (const [property, value] of Object.entries(colorOverrides)) {
    if (value) {
      document.documentElement.style.setProperty(property, value)
    }
  }

  if (FAVICON_URL) {
    document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute('href', FAVICON_URL)
  }
}
