export const HEADERS_MAP = {
  ACCEPT: 'Accept',
  ACCEPT_LANGUAGE: 'Accept-Language',
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization'
}

let _HEADERS_VALUES_MAP = {}
_HEADERS_VALUES_MAP.JSON_UTF8 = 'application/json; charset=UTF-8'
_HEADERS_VALUES_MAP.JSON = 'application/json'
_HEADERS_VALUES_MAP.FORM_URL_ENCODED = 'application/x-www-form-urlencoded'

export const HEADERS_VALUES_MAP = _HEADERS_VALUES_MAP
