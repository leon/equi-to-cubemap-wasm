import fs from 'fs'
import loader from '@assemblyscript/loader'

export default loader.instantiateSync(fs.readFileSync(__dirname + '/build/optimized.wasm'), {
  /* imports */
})
