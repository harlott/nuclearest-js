const fetchMock = require('fetch-mock');
import  'isomorphic-fetch'
const expect = require('chai').expect

describe('Async methods', function(){
  it('should execute callback', function(done){
    fetchMock.getOnce("http://gmail.com", {status: 200, ok: false});
    let action = () => {
      return fetch("http://gmail.com")
    }

    action().then((data) => {
      done()
      expect(data.status).to.equal(200)

    });

    // Unmock.
    fetchMock.restore();
  })
})
