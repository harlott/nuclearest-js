import Auth from '../src/Auth'
const fetchMock = require('fetch-mock');
import  '../src/fetch'
const expect = require('chai').expect

describe('Auth', function(){
  it('expect to execute api method with authorization granted', function(done){
    fetchMock.getOnce("http://localhost/go", {status: 500, ok: false});

    const action  = () => {
        return fetch('http://localhost/go')
    }

    action().then((data) => {
      console.log(data)
      done()
    })
    fetchMock.restore();
  })
})
