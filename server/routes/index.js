module.exports = (app) => {

  app.route('/get-success')
    .get((req, res) => {
      res.status(200).json({a: 1}).send();
    })
  app.route('/get-error')
    .get((req, res) => {
      res.status(415).json({code: 'UNSUPPORTED_MEDIA_TYPE'}).send();
  })

  app.route('/get-no-content')
    .get((req, res) => {
      res.status(201).send();
  })

  app.route('/get-text-content')
    .get((req, res) => {
      res.status(200).send('TEXT BODY');
  })
    
  app.route('/get-with-timeout')
    .get((req, res) => {
      setTimeout(()=>{
       res.send({code: 'TIMEOUT'})
     }, 32000)
    })
};
