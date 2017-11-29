export const HEADERS_MAP = {
  ACCEPT: 'Accept',
  ACCEPT_LANGUAGE: 'Accept-Language',
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization'
}

let _HEADERS_VALUES_MAP = {}
_HEADERS_VALUES_MAP['JSON_UTF8'] = 'application/json; charset=UTF-8'
_HEADERS_VALUES_MAP['JSON'] = 'application/json'

export const HEADERS_VALUES_MAP = _HEADERS_VALUES_MAP
