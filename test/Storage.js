import assert from 'assert'
import { buildCustomStorage } from '../src/Storage'
import { buildCustomStoragesMap } from '../src/Storage'


describe('Storage', function() {
  describe('#buildCustomStorage()', function() {
    it('should build the custom storage', function() {
        let newStorage = buildCustomStorage('fileSystem', ()=>{}, ()=>{}, ()=>{})
        assert.equal(newStorage, {'fileSystem':{setValue: () =>{}, getValue: ()=>{}, removeValue: ()=>{}}})
    });
  });
  describe('#buildCustomStoragesMap()', function() {
    it('should not pass with bad parameters', function() {
      try{
          let newStorage = buildCustomStoragesMap('fileSystem', {setVale:()=>{}, getValue: ()=>{}, removeValue: ()=>{}})
      } catch(e){
        console.log(e)
      }

    });
  });
});
