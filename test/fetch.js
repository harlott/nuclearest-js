import fetch from '../src/fetch'

import chai, {expect, assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import cloneDeep from 'lodash/cloneDeep'

chai.use(chaiAsPromised)

describe('fetch', () => {
    it('expect to handle timeout by default timing', async () => {
      let fetchOptions = {
        method: 'GET'
      }
      try {
          const resProcessed = await fetch('http://localhost:3000/get-with-timeout')
          console.log(`resProcessed = ${JSON.stringify(resProcessed)}`)
          expect(resProcessed).to.have.property('code').to.be.equal('suca')
      } catch(err){
          console.log(`err = ${JSON.stringify(err)}`)
      }



    })

})
