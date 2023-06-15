import readline from 'node:readline'
import { pipeline } from 'node:stream/promises'
import { createReadStream } from 'node:fs'
import { setImmediate } from 'node:timers/promises'
import * as Block from 'multiformats/block'
import * as raw from 'multiformats/codecs/raw'
import { identity } from 'multiformats/hashes/identity'
import { ShardBlock, put } from '@alanshaw/pail'
import ora from 'ora'

const NO_REASON = await Block.encode({ value: new Uint8Array(), codec: raw, hasher: identity })

class BS {
  constructor () {
    this.map = new Map()
  }

  async get (cid) {
    const bytes = this.map.get(cid.toString())
    if (!bytes) return undefined
    return { cid, bytes }
  }

  put (block) {
    return this.map.set(block.cid.toString(), block.bytes)
  }

  rm (cid) {
    return this.map.delete(cid.toString())
  }
}

/**
 * @param {string} src
 */
export async function storeAll (src) {
  const init = await ShardBlock.create()
  const bs = new BS()
  bs.put(init)
  let head = init.cid
  let keys = 0
  const spinner = ora(`Importing ${src}`).stopAndPersist().start()
  return pipeline(
    createReadStream(src),
    input => readline.createInterface({ input }),
    async function (src) {
      for await (const line of src) {
        if (!line.startsWith('//')) continue
        const key = line.substring(2)
        spinner.text = `${key} (${keys++})`
        const { root, additions, removals } = await put(bs, head, key, NO_REASON.cid)
        for (const block of removals) {
          bs.rm(block.cid)
        }
        for (const block of additions) {
          bs.put(block)
        }
        head = root
        await setImmediate() // makes spinner work...
      }
      spinner.stop()
      return { bs, head, keys }
    }
  )
}

const { bs, head, keys } = await storeAll(process.argv[2])

const count = bs.map.size

console.log(`# ${head}`)
console.log(`- blocks ${count}`)
console.log(`- keys ${keys}`)
