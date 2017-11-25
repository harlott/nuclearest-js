import Storage, { canUseStorage, buildCustomStorage, buildCustomStoragesMap } from '../src/Storage'

const expect = require('chai').expect
let __global__ = {}
describe('Storage', function() {
  let newStorage = buildCustomStorage('fileSystem', (p, v)=>{__global__[p]=v}, (p)=>{return __global__[p]}, (p)=>{__global__[p] = undefined})
  let customStoragesMap = buildCustomStoragesMap('fileSystem', newStorage)

  describe('#buildCustomStorage()', function() {
    it('should build the custom storage', function() {
        expect(newStorage).to.have.property('fileSystem')
        expect(newStorage.fileSystem).to.have.property('setValue')
        expect(newStorage.fileSystem.setValue).to.be.a('function')
        expect(newStorage.fileSystem).to.have.property('getValue')
        expect(newStorage.fileSystem.setValue).to.be.a('function')
        expect(newStorage.fileSystem).to.have.property('removeValue')
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

  describe('#StorageInstance', function(){
    let storage = new Storage('fileSystem', undefined, customStoragesMap)
    it('should check storage', function(){
      expect(Storage.getTypesMap()).to.have.all.keys('LOCAL_STORAGE', 'SESSION_STORAGE', 'COOKIE')
    })

    it('should get the types map', function(){
      expect(Storage.getTypesMap()).to.have.all.keys('LOCAL_STORAGE', 'SESSION_STORAGE', 'COOKIE')
    })

    it('should add custom storage to Storage instance', function(){
      expect(storage.STORAGES_MAP).to.have.property('fileSystem')
    })

    it('should set and get a value', function(){
      storage.setValue('a', 1)
      expect(storage.getValue('a')).to.be.a('number')
      storage.setValue('b', 'may be the good one')
      expect(storage.getValue('b')).to.be.equal('may be the good one')
    })
    it('should remove a value', function(){
      storage.setValue('a', 1)
      expect(storage.getValue('a')).to.be.a('number')
      storage.removeValue('b')
      expect(storage.getValue('b')).to.be.equal(undefined)
    })
    it('should get the type', function(){
      expect(storage.getType()).to.be.equal('fileSystem')
    })
    it('should get the method', function(){
      expect(storage.getMethod()).to.deep.be.equal(customStoragesMap.fileSystem)
    })

  })
});
