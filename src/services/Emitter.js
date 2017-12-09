let EventEmitter = require('events').EventEmitter

let _instance = null
export default class Emitter{
    constructor(){
      this.eventEm = new EventEmitter();
      this.eventEm.setMaxListeners(100)
      if (_instance === null){
          _instance = this
      }

      return _instance
    }
    emitGeneric(eventType, resObj){
        this.eventEm.emit(eventType, resObj);
    }
    on(eventType, callback){
        return this.eventEm.on(eventType, callback);
    }
    removeListener(eventType, callback){
        return this.eventEm.removeListener(eventType, callback);
    }
    removeAllListeners(eventType){
        return this.eventEm.removeAllListeners(eventType);
    }
}
