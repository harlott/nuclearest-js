module.exports = (app) => {

  // todoList Routes
  app.route('/get-with-timeout')
    .get((req, res) => {
      res.send({ok: true, status: 200, json: () => {return Promise.resolve({code: 'abcd'})}})
      /*setTimeout(()=>{
          res.send({code: 'SUCA'})
        }, 40000)*/
    })
};
