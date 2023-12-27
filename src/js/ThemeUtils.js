import MediaQueryUtils from './MediaQueryUtils'

export const applyAppTheme = () => {
  const deviceTheme = MediaQueryUtils.getDeviceTheme()
  const appElement = document.querySelector('#app')
  if (deviceTheme === MediaQueryUtils.THEME_DARK) {
    appElement.classList.add(MediaQueryUtils.THEME_DARK)
  }
}
