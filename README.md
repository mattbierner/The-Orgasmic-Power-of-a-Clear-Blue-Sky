# The Orgasmic Power of a Clear Blue Sky

Code used for [an experiment][blog] that uses the colors you see around through an AR headset to control a wearable vibrator. 

#### Viewer
The website is designed to be run on an iPhone used with Google Cardboard. It takes the mjpeg stream from the cameras

The site uses webpack. To run it:

```bash
$ man viewer
$ npm install

# Edit `src/config.js` to provide the expected ip address of the Raspberry pi
# and rebuild
$ webpack

# server up index.html somehow
$ http-server index.html
```

#### App
iPhone app that provides the webview that the viewer should be loaded into and also connects to the toy over bluetooth to control it. Can control either a *Hush* or a *Lush* toy from *Lovense*.


[blog]: http://blog.mattbierner.com/blue-sky-orgasm
