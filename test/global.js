before(function() {
  console.log('global setup');
  global.navigator = {
    userAgent: 'node.js'
  };
});
