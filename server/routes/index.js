module.exports = (app) => {

  // todoList Routes
  app.route('/get-with-timeout')
    .get((req, res) => {
      res.send({code: 'SUCA'})
      /*setTimeout(()=>{
          res.send({code: 'SUCA'})
        }, 40000)*/
    })
};

