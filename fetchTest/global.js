import Storage, { buildCustomStorage, buildCustomStoragesMap} from '../src/Storage'

before(function() {
  console.log('global setup');
  global.document = {}
  global.window = {}
  global.navigator = {}
  global.context = {
    browser: {
      navigator:{
        userAgent: {
          edge: 'ieEdge'
        }
      }
    },
    node: {
      navigator: {
        userAgent:'node.js'
      }
    }
  }
  global.__global__ = {}
  global.newStorage = buildCustomStorage('fileSystem', (p, v)=>{global.__global__[p]=v}, (p)=>{return global.__global__[p]}, (p)=>{global.__global__[p] = undefined})
  global.customStoragesMap = buildCustomStoragesMap('fileSystem', global.newStorage)
  global.storage = new Storage('fileSystem', undefined, global.customStoragesMap)
});
