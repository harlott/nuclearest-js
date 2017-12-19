import fetch from '../src/fetch'
import Headers from '../src/Headers'
import isFunction from 'lodash/isFunction'

import chai, { expect, should, assert } from 'chai';
should();
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);

describe('fetch', () => {
    it('expect to receive successfull response', async () => {

      let fetchOptions = {
        method: 'GET'
      }
      let headers = new Headers().add().acceptApplicationJson().use()
      try{
        const res = await fetch('http://localhost:3000/get-success', {parseResponse: false, headers: headers})
        console.log(`res = ${JSON.stringify(res)}`)
        const resJson = await res.json()
        const resHeaders = res.headers
        console.log(`resHeaders = ${JSON.stringify(resHeaders)}`)
        console.log(`res.isJson = ${res.isJson}`)
        console.log(`res = ${JSON.stringify(resJson)}`)
        expect(resJson).to.deep.equal({ok: true, status: 200});
      } catch(errRes){
        try {
            const errResProcessed = await errRes
            console.log(errResProcessed)
        } catch(e){

        }

        if (isFunction(errRes.then)){
          Promise.reject(errRes)
        }
        throw new Error(errRes)
        console.log(`errRes = ${errRes}`)
      }
    })

  it('expect to receive error response', async () => {

    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch('http://localhost:3000/get-error', {parseResponse: false, headers: headers})
      console.log(`res = ${JSON.stringify(res)}`)
      const resJson = await res.json()
      const resHeaders = res.headers
      console.log(`resHeaders = ${JSON.stringify(resHeaders)}`)
      console.log(`res.isJson = ${res.isJson}`)
      console.log(`res = ${JSON.stringify(resJson)}`)
      expect(resJson).to.deep.equal({ok: false, status: 415});
    } catch(errRes){
      console.log(`errRes = ${errRes}`)
      expect(errRes.name).to.be.equal('FetchError');
    }
  })

  it('expect to handle timeout', async () => {

    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch('http://localhost:3000/get-with-timeout', {parseResponse: false, headers: headers})
      console.log(`res = ${JSON.stringify(res)}`)
      const resJson = await res.json()
      const resHeaders = res.headers
      console.log(`resHeaders = ${JSON.stringify(resHeaders)}`)
      console.log(`res.isJson = ${res.isJson}`)
      console.log(`res = ${JSON.stringify(resJson)}`)
      expect(resJson).to.deep.equal({ok: false, status: 415});
    } catch(errRes){
      console.log(`errRes = ${errRes}`)
      expect(errRes.name).to.be.equal('FetchError');
    }
  })

})
