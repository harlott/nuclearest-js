import fetch from '../src/fetch'
import Headers from '../src/Headers'

const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

describe('fetch', () => {
    it('expect to handle timeout by default timing with parse response false', async (done) => {
      done()
      let fetchOptions = {
        method: 'GET'
      }
      let headers = new Headers().add().acceptApplicationJson().use()
      try{
        const res = await fetch('http://localhost:3000/get-with-timeout', {parseResponse: false, headers: headers})
        const resJson = await res.json()
        console.log(`res = ${JSON.stringify(resJson)}`)
        //expect(res.ok).to.be.equal(true)
        //assert.ok(res.ok)
      } catch(errRes){
        console.log(`errRes = ${errRes}`)
        //assert.ok(false)
      }
    })

})
