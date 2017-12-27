import { serverErrorResponse } from '../services/Utils'

import isFunction from 'lodash/isFunction'
import cloneDeep from 'lodash/cloneDeep'

const defaultResponseParser = async (response) => {
  if (!isFunction(response.text)){
    return Promise.reject(serverErrorResponse )
  }

  let parsedResponse = cloneDeep(response)
  parsedResponse.isEmpty = false
  parsedResponse.isText = false
  parsedResponse.isJson = false
  let jsonBody
  try {
      let responseTextProcessed = await response.text()
      try {
        jsonBody = JSON.parse(responseTextProcessed)
        parsedResponse.isJson = true
        parsedResponse.json = () =>  {
          return Promise.resolve(jsonBody)
        }
      } catch(e){}
      if (!jsonBody){
        parsedResponse.isJson = false
        if (responseTextProcessed !== ''){
          parsedResponse.isText = true
        } else {
          parsedResponse.isText = false
          parsedResponse.isEmpty = true
        }
      }
      return Promise.resolve(parsedResponse)
  } catch (textErr){
    if (textErr){
        Promise.reject(new Error(`Error on converting from response into jSON: ${textErr.stack}`))
    }
    return Promise.reject(serverErrorResponse)
  }
}

export default defaultResponseParser
