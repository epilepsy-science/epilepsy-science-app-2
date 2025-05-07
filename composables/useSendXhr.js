// request_composable.js

import {prop, propOr} from "ramda";



const _isString = (x) => Object.prototype.toString.call(x) === '[object String]'

const _trimValues = (obj) => {
    Object.keys(obj).forEach(key => {
        if (_isString(obj[key])) {
            obj[key] = obj[key].trim()
        }
    })
}

/**
 * Send Xhr request
 * @param {string} url
 * @param {{method: string; header: {Authorization: string}; body: []}} opts  Error status
 * @param {string} opts.method
 * @param {Object} opts.header
 * @param {Object} opts.body
 */
export default function (url, opts) {

    if (!url) {
        return Promise.reject({status: 400, message: 'Url is missing!'})
    }

    const method = propOr('GET', 'method', opts)

    const optsHeader = propOr({}, 'header', opts)
    const headers = Object.assign({}, { 'Content-type': 'application/json' }, optsHeader)

    const optsBody = prop('body', opts)
    let requestOpts = { headers, method: method }

    if (optsBody) {
        if (typeof optsBody === 'object') {
            _trimValues(optsBody)
        }
        const body = JSON.stringify(optsBody)
        requestOpts = Object.assign({}, requestOpts, { body: body })
    }

    return fetch(url, requestOpts)
        .then(resp => {
            if (resp.status >= 400) {
                return Promise.reject(resp)
            }
            // if the payload cannot be converted to json, just return the original response

            if (optsHeader['Content-type'] === 'text') {
                return resp.text()
            }

            return resp.json()
                .catch(() => {
                    return resp
                })

        })
}






