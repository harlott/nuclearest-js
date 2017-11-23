import { buildCustomStorage } from '../src/Storage'
import { buildCustomStoragesMap } from '../src/Storage'
import Storage from '../src/Storage'

const expect = require('chai').expect

describe('Storage', function() {
  let newStorage = buildCustomStorage('fileSystem', ()=>{}, ()=>{}, ()=>{})
  let customStoragesMap = buildCustomStoragesMap('fileSystem', newStorage)
  describe('#buildCustomStorage()', function() {
    it('should build the custom storage', function() {
        expect(newStorage).to.have.property('fileSystem')
        expect(newStorage.fileSystem).to.have.property('setValue')
        expect(newStorage.fileSystem.setValue).to.be.a('function')
    });
  });
  describe('#buildCustomStoragesMap()', function() {
    it('should build the custom storage map', function() {
        expect(customStoragesMap).to.have.property('fileSystem')
        expect(customStoragesMap).to.have.property('cookie')
        expect(customStoragesMap.fileSystem.setValue).to.be.a('function')
    });
  });
  describe('#Storage', function(){
    it('should add custom storage to Storage instance', function(){
      let storage = new Storage('fileSystem', newStorage, customStoragesMap)
      expect(storage.STORAGES_MAP).to.have.property('fileSystem')       
    })
  })
});
