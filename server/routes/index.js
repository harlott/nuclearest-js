module.exports = (app) => {

  app.route('/get-success')
    .get((req, res) => {
      res.send({ok: true, status: 200, json: () => {return Promise.resolve({a: '1'})}})
    })
  app.route('/get-error')
    .get((req, res) => {
      res.send({ok: false, status: 415, json: () => {return Promise.resolve({code: 'UNSUPPORTED_MEDIA_TYPE'})}})
  })
  app.route('/get-with-timeout')
    .get((req, res) => {
      setTimeout(()=>{
       res.send({code: 'TIMEOUT'})
     }, 32000)
    })
};
