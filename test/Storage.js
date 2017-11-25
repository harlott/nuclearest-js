import Storage, { canUseStorage, buildCustomStorage, buildCustomStoragesMap } from '../src/Storage'

const expect = require('chai').expect
let __global__ = {}
describe('Storage', function() {
  let newStorage = buildCustomStorage('fileSystem', (p, v)=>{__global__[p]=v}, (p)=>{return __global__[p]}, (p)=>{__global__[p] = undefined})
  let customStoragesMap = buildCustomStoragesMap('fileSystem', newStorage)

  describe('#buildCustomStorage()', function() {
    it('should build the custom storage', function() {
        expect(newStorage).to.have.property('fileSystem')
        expect(newStorage.fileSystem).to.have.property('setItem')
        expect(newStorage.fileSystem.setItem).to.be.a('function')
        expect(newStorage.fileSystem).to.have.property('getItem')
        expect(newStorage.fileSystem.getItem).to.be.a('function')
        expect(newStorage.fileSystem).to.have.property('removeItem')
        expect(newStorage.fileSystem.setItem).to.be.a('function')
    });
  });

  describe('#buildCustomStoragesMap()', function() {
    it('should build the custom storage map', function() {
        expect(customStoragesMap).to.have.property('fileSystem')
        expect(customStoragesMap).to.have.property('cookie')
        expect(customStoragesMap.fileSystem.setItem).to.be.a('function')
    });
  });

  describe('#StorageInstance', function(){
    let storage = new Storage('fileSystem', undefined, customStoragesMap)
    it('should not check custom storage', function(){
      let _testStorage = buildCustomStorage('disabledStorage', (p, v)=>{throw new Error('can not set')}, (p)=>{throw new Error('can not get')}, (p)=>{throw new Error('can not remove')})
      let _testCustomStoragesMap = buildCustomStoragesMap('disabledStorage', newStorage)
      expect(canUseStorage('disabledStorage', undefined, _testCustomStoragesMap)).to.be.equal(false)
    })

    it('should check custom storage', function(){
      expect(canUseStorage('fileSystem', undefined, customStoragesMap)).to.be.equal(true)
    })

    it('should not check standard local storage', function(){
      let _mockedLocalStorage = {
        setItem: () => {throw new Error('disabled')},
        getItem: () => {throw new Error('disabled')},
        removeItem: () => {throw new Error('disabled')}
      }
      expect(canUseStorage('fileSystem', _mockedLocalStorage)).to.be.equal(false)
    })

    it('should get the types map', function(){
      expect(Storage.getTypesMap()).to.have.all.keys('STORAGE', 'COOKIE')
    })

    it('should add custom storage to Storage instance', function(){
      expect(storage.STORAGES_MAP).to.have.property('fileSystem')
    })

    it('should set and get a value', function(){
      storage.setItem('a', 1)
      expect(storage.getItem('a')).to.be.a('number')
      storage.setItem('b', 'may be the good one')
      expect(storage.getItem('b')).to.be.equal('may be the good one')
    })
    it('should remove a value', function(){
      storage.setItem('a', 1)
      expect(storage.getItem('a')).to.be.a('number')
      storage.removeItem('b')
      expect(storage.getItem('b')).to.be.equal(undefined)
    })
    it('should get the type', function(){
      expect(storage.getType()).to.be.equal('fileSystem')
    })
    it('should get the method', function(){
      expect(storage.getMethod()).to.deep.be.equal(customStoragesMap.fileSystem)
    })

  })
});
