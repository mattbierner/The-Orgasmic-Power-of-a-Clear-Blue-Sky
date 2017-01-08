/**
 * Hostname of Raspberry pi
 */
export const ip = window.location.href.indexOf('phone') >= 0 ? '172.20.10.3' : 'sourdough.local'

/**
 * Root url of the Raspberry Pi mjpeg streaming site.
 */
export const viewerUrl =  `http://${ip}:1234/`

/**
 * Enables sepectatorMode so that you only see 
 */
export const sepectator = window.location.href.indexOf('sepectator') >= 0