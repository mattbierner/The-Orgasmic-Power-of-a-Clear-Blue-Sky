/**
 * Hostname of Raspberry pi
 */
export const ip = window.location.href.indexOf('phone') >= 0 ? '172.20.10.3' : 'sourdough.local'

/**
 * Root url of the Raspberry Pi mjpeg streaming site.
 */
export const viewerUrl =  `http://${ip}:1234/`

/**
 * Should data from two cameras be collected?
 */
export const stereo = false