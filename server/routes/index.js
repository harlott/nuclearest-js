module.exports = (app) => {

  app.route('/get-success')
    .get((req, res) => {
      res.send({ok: true, status: 200, json: () => {return Promise.resolve({code: 'abcd'})}})
      /*setTimeout(()=>{
          res.send({code: 'SUCA'})
        }, 40000)*/
    })
  app.route('/get-error')
    .get((req, res) => {
      res.send({ok: false, status: 415, json: () => {return Promise.resolve({code: 'METHOD_NOT_ALLOWED'})}})
      /*setTimeout(()=>{
       res.send({code: 'SUCA'})
       }, 40000)*/
  })
  app.route('/get-with-timeout')
    .get((req, res) => {
      setTimeout(()=>{
       res.send({code: 'TIMEOUT'})
       }, 40000)
    })
};
