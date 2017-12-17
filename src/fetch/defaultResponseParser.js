const defaultResponseParser = (response) => {
  if (!abort) {
    if (isFunction(response.text)){
      return response.text().then((text) => {
        let jsonBody
        let isJsonResponse = true
        try{
          jsonBody = JSON.parse(text)
        } catch(e){

        }
        if (!jsonBody){
          isJsonResponse = false
          jsonBody = {transformedValue: text}
        }
        return resolve({
              json: jsonBody,
              text: text,
              isJson: isJsonResponse,
              ok: response.ok,
              status: response.status,
              originalResponse: response,
          })
      }, (err) => {
        if (err){
            throw new Error("Error on converting from response into jSON:  ", err.stack)
        }
        return resolve(serverErrorResponse)
      });
    } else {
      return resolve(serverErrorResponse )
    }
  }
}

export default defaultResponseParser
