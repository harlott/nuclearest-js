import chai, {expect, assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

describe('windowEventMock', function() {
  it('can test with global Event mocked', function (done) {
    const eventName = 'myEvent'
    const eventListener = function () {
      done()
    };

    window.addEventListener(eventName, eventListener);
    let event = new Event(eventName);
    window.dispatchEvent(eventName);
    window.removeEventListener(eventName, eventListener);
    window.dispatchEvent(eventName);
  })
})
