import readline from 'node:readline'
import { pipeline } from 'node:stream/promises'
import { createReadStream } from 'node:fs'
import { setImmediate } from 'node:timers/promises'
import { CID } from 'multiformats/cid'
import * as Block from 'multiformats/block'
import * as raw from 'multiformats/codecs/raw'
import { base32 } from 'multiformats/bases/base32'
import { identity } from 'multiformats/hashes/identity'
import { sha256 } from 'multiformats/hashes/sha2'
import { ShardBlock, put } from '@alanshaw/pail'
import { MemoryBlockstore } from '@alanshaw/pail/block'
import ora from 'ora'
import { getBlockStore, getDataStore } from './blocks'

const NO_REASON = await Block.encode({ value: new Uint8Array(), codec: raw, hasher: identity })

/**
 * @param {string} cidPath
 */
export function add (cidPath) {
  const bs = getBlockStore()
  const kv = getDataStore()
  const head = kv.get('head')
}

/**
 * @param {string} src
 */
export async function storeAll (src) {
  const init = await ShardBlock.create()
  const bs = new MemoryBlockstore([init])
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
          bs.deleteSync(block.cid)
        }
        for (const block of additions) {
          bs.putSync(block.cid, block.bytes)
        }
        // @ts-expect-error Link vs CID
        head = root
        await setImmediate() // makes spinner work...
      }
      spinner.stop()
      return { bs, head, keys }
    }
  )
}

/**
 * Convert a cid string plus optional path into a hashed denylist key.
 *
 * The input CID is normalized to a CIDv1 base32 string with a slash suffix then an optional path.
 * That string is sha256 hashed and the digest is returned as hexadecimal string.
 *
 * @param {string} cidPath
 */
export async function hash (cidPath) {
  const [cidStr, ...path] = cidPath.split('/')
  const cid = CID.parse(cidStr).toV1().toString(base32.encoder)
  const cidv1Path = `${cid}/${path.join('/')}`
  const digest = await sha256.encode(new TextEncoder().encode(cidv1Path))
  return Array.from(digest, x => x.toString(16).padStart(2, '0')).join('')
}
