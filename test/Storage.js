import { buildCustomStorage } from '../src/Storage'
import { buildCustomStoragesMap } from '../src/Storage'

const expect = require('chai').expect

describe('Storage', function() {
  let newStorage = buildCustomStorage('fileSystem', ()=>{}, ()=>{}, ()=>{})
  describe('#buildCustomStorage()', function() {
    it('should build the custom storage', function() {
        expect(newStorage).to.have.property('fileSystem')
        expect(newStorage.fileSystem).to.have.property('setValue')
        expect(newStorage.fileSystem.setValue).to.be.a('function')
    });
  });
  describe('#buildCustomStoragesMap()', function() {
    let customStoragesMap = buildCustomStoragesMap('fileSystem', newStorage)
    it('should build the custom storage map', function() {
        expect(customStoragesMap).to.have.property('fileSystem')
        expect(customStoragesMap).to.have.property('cookie')
        expect(customStoragesMap.fileSystem.setValue).to.be.a('function')
    });
  });
});
