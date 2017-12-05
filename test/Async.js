const fetchMock = require('fetch-mock');
import fetch from 'isomorphic-fetch'
const expect = require('chai').expect

describe('Async methods', function(){
  it('should execute callback', function(done){
    fetchMock.mock('http://httpbin.org/get', 200);

    fetch("http://httpbin.org/get").then((data) => {
      console.log('got data', data);
      expect(data.status).to.equal(200)
      done()
    });

    // Unmock.
    fetchMock.restore();
  })
})
