export const ERRORS = {
    GENERIC: 'GENERIC_SERVER_ERROR',
    TIMEOUT: 'ERROR_TIMEOUT'
}

export const serverErrorResponse = {
    ok: false,
    status: 410,
    json: {code: ERRORS.GENERIC}
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
    if (contentTypeHeader === true) {
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
