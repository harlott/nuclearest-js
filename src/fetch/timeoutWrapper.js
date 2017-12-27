const timeoutWrapper = (fetchInUse, url, options, timeout) => {
    return new Promise(async  (resolve, reject) => {
      fetchInUse(url, options).then(resolve).catch(reject)
      if (timeout !== undefined) {
        const e = {code: 'GENERIC_TIMEOUT'}
        setTimeout(reject, timeout, e)
      }
    })
}

export default timeoutWrapper
