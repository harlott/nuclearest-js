import fetch from '../src/fetch'
import Headers from '../src/Headers'

const chai = require('chai')
const expect = chai.expect

var mochaAsync = (fn) => {
  return async (done) => {
    try {
      await fn();
      done();
    } catch (err) {
      done(err);
    }
  };
};

describe('fetch', () => {
    it('expect to handle timeout by default timing with parse response false', mochaAsync(async (done) => {
      let fetchOptions = {
        method: 'GET'
      }
        let headers = new Headers().add().acceptApplicationJson().use()
        const res = await fetch('http://localhost:3000/get-with-timeout', {parseResponse: false, headers: headers})
        const jsonRes = await res.json()
        console.log(`resProcessed = ${JSON.stringify(jsonRes)}`)
        expect(res).to.have.property('status')
    })
    )
})
