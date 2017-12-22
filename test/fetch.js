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
        const resJson = await res.json()
        expect(resJson).to.deep.equal({a: 1});
      } catch(errRes){
        throw new Error(errRes)
      }
    })

  it('expect to receive error response', async () => {

    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch('http://localhost:3000/get-error', {parseResponse: false, headers: headers})
      const resJson = await res.json()
      expect(resJson).to.deep.equal({code: 'UNSUPPORTED_MEDIA_TYPE'});
    } catch(errRes){
      expect(errRes.name).to.be.equal('FetchError');
    }
  })

  it('expect to parse response by defaultParser with isJson flag to true', async () => {
    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch('http://localhost:3000/get-success', {parseResponse: true, headers: headers})
      const jsonRes = await res.json()
      expect(res.isJson).to.be.equal(true)
      expect(jsonRes).to.be.deep.equal({a: 1})
    } catch(errRes){
      if (errRes.name !== undefined){
          throw new Error(errRes)
          expect(errRes.name).to.be.equal('FetchError');
      }
      if (errRes.code !== undefined){
        expect(errRes.code).to.be.equal('GENERIC_TIMEOUT');
      }
    }
  })

  it('expect to parse response by defaultParser with server error response', async () => {
    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch('http://localhost:3000/get-server-error', {parseResponse: true, headers: headers})
      const jsonRes = await res.json()
      expect(res.isJson).to.be.equal(true)
      expect(jsonRes).to.be.deep.equal({a: 1})
    } catch(errRes){
      if (errRes.name !== undefined){
          //throw new Error(errRes)
          expect(errRes.name).to.be.equal('FetchError');
      }
      if (errRes.code !== undefined){
        expect(errRes.code).to.be.equal('GENERIC_TIMEOUT');
      }
    }
  })

  it('expect to handle timeout', async function(){
    this.timeout(2500)
    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch('http://localhost:3000/get-with-timeout', {parseResponse: false, headers: headers, timeout: 2000})
      assert.ok(false)
    } catch(errRes){
      if (errRes.name !== undefined){
          expect(errRes.name).to.be.equal('FetchError');
      }
      if (errRes.code !== undefined){
        expect(errRes.code).to.be.equal('GENERIC_TIMEOUT');
      }
    }
  })
})
