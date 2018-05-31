import fetch from '../src/fetch'
import Headers from '../src/Headers'
import nock from 'nock'
const jsdom = require("jsdom");
import chai, { expect, should, assert } from 'chai';
should();
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);
const { JSDOM } = jsdom;
const { window } = new JSDOM(`...`);


describe('fetchAbortable', () => {
  it('use abort controller', async () => {
    window.fetch = fetch
    const controller = new window.AbortController();
    const signal = controller.signal;

    nock('http://chili.test')
        .get('/contents')
        .reply(200, {code: 'SUCCESS'})

    setTimeout(async () => {
      controller.abort()
    }, 1000)

    let headers = new Headers().add().acceptApplicationJson().use()

    try{
      const res = await window.fetch('http://chili.test/contents', {headers: headers, signal: signal})
      console.log(JSON.stringify(res))
    } catch (err) {
      throw new Error(err)
    }
  })
})
