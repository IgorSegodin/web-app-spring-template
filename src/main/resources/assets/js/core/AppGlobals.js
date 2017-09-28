/**
 * Need to know contextPath, can set it only through global 'window' object.
 * Can't use contextUrl property, because of cross-domain requests.
 * Spring security doesn't allow both CORS and secured requests.
 * Should be CORS or secured, but not both.
 *
 * */

var globals = window.AppGlobals || (function() {throw new Error("window should contain global settings object: 'AppGlobals'.");});

export default {
    url: {
        contextPath: globals.url.contextPath.replace(/\/$/, "") // remove last slash
    }
}