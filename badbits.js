import readline from 'node:readline'
import { Readable } from 'node:stream'
import { createReadStream } from 'node:fs'
import { setImmediate } from 'node:timers/promises'
import * as Block from 'multiformats/block'
import * as raw from 'multiformats/codecs/raw'
import { identity } from 'multiformats/hashes/identity'
import { ShardBlock, put } from '@alanshaw/pail'
import ora from 'ora'

const BADBITS_URL = 'https://badbits.dwebops.pub/badbits.deny'
const NO_REASON = await Block.encode({ value: new Uint8Array(), codec: raw, hasher: identity })

/**
 * Yield each sha256 hashed CID in the badbits deny list
 * @see: https://badbits.dwebops.pub
 */
export async function * badbits (src = BADBITS_URL, { signal } = {}) {
  const res = await fetch(src, signal)
  const lines = readline.createInterface({ input: Readable.fromWeb(res.body) })
  for await (const line of lines) {
    if (!line.startsWith('//')) continue
    yield line.substring(2)
  }
}

/**
 * Yield each sha256 hashed CID in the badbits deny list from a file
 * @see: https://badbits.dwebops.pub
 */
export async function * badbitsFS (src) {
  const input = createReadStream(src)
  const lines = readline.createInterface({ input })
  for await (const line of lines) {
    if (!line.startsWith('//')) continue
    yield line.substring(2)
  }
}

class BS {
  constructor () {
    this.map = new Map()
  }

  async get (cid) {
    return this.map.get(cid.toString())
  }

  async put (block) {
    return this.map.set(block.cid.toString(), block)
  }

  async delete (cid) {
    return this.map.delete(cid.toString())
  }
}

export async function storeAll (src) {
  const init = await ShardBlock.create()
  const bs = new BS()
  await bs.put(init)

  let head = init.cid
  let keys = 0
  let rm = []
  const spinner = ora(`Reading ${src}`).stopAndPersist().start()
  for await (const key of badbitsFS(src)) {
    spinner.text = '' + keys
    keys++
    const { root, additions, removals } = await put(bs, head, key, NO_REASON.cid)
    for (const block of additions) {
      await bs.put(block)
    }
    rm = rm.concat(removals)
    head = root
    // makes spinner work...
    await setImmediate()
  }
  for (const block of rm) {
    await bs.delete(block.cid)
  }
  spinner.stop()
  return { bs, head, keys }
}

const { bs, head, keys } = await storeAll(process.argv[2])

const count = bs.map.size

console.log('⁂ pail')
console.log(`# ${head}`)
console.log(`- blocks ${count} (${bs.map.get(head.toString()).bytes.length})`)
console.log(`- keys ${keys}`)
