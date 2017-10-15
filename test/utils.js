import {Utils} from '../src/utils'
var assert = require('assert');

var CLIENT_DATA = {
    apiVersion:'3.7',
    clientId: '1111'
};

var expectedDefault = {'x-api-version':apiVersion,'x-application-id':applicationId};

describe('Utils', function () {
    var utils = new Utils();
    it ('get headers DEFAULT', function () {
      assert.equal (JSON.stringify(utils.getHeadersDefault(CLIENT_DATA)), JSON.stringify(expectedDefault))
    })
})
