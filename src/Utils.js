import isArray from 'lodash/isArray'
import find from 'lodash/find'

const Promise = require('es6-promise').Promise


export const ERRORS = {
    GENERIC: 'GENERIC_SERVER_ERROR',
    TIMEOUT: 'ERROR_TIMEOUT'
}

export const serverErrorResponse = {
    ok: false,
    status: 410,
    json: {code: ERRORS.GENERIC}
}

export const getEmptyResponse = (response) => {
    return {
        ok: response.ok,
        status: response.status,
        json: () => (new Promise((resolve, reject) => (resolve({}))))
    }
}

const getResponseHeader = (response, contentType) => {
    let contentTypeHeader
    if (typeof response.headers.get === 'function') {
        contentTypeHeader = response.headers.get(contentType)
    }
    return contentTypeHeader
}

const responseIsJson = (response) => {
    let contentTypeHeader = getResponseHeader(response, 'Content-Type')
    if (!!contentTypeHeader) {
        if (contentTypeHeader.indexOf('application/json') > -1) {
            return true
        }
    }
    return false
}

export const isServerError = (response) => {
    if (response.ok !== true) {
        return !responseIsJson(response)
    }
    return false
}

const isEmptyBody = (response) => {
    const contentLengthHeader = getResponseHeader(response, 'Content-Length')
    const transferEncodingHeader = getResponseHeader(response, 'Transfer-Encoding')
    return !responseIsJson(response)
}

export const isSuccessEmptyResponse = (response) => {
    let serverError = isServerError(response)
    let emptyResponse = isEmptyBody(response)
    return !serverError && emptyResponse === true && response.ok === true
}
