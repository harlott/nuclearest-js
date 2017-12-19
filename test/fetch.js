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
        const res = await fetch('http://localhost:3000/get-with-timeout', {parseResponse: false, headers: headers})
        const resJson = await res.json()
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

})
