/**
 * Load an image
 */
export default (url) => {
    let resolve;
    let reject
    const p = new Promise((res, rej) => {
        resolve = res
        reject = rej
    })

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { resolve(img) }
    img.onerror = () => { reject(img) }
    img.src = url
    return p
}