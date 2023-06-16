import { FsBlockstore } from 'blockstore-fs'
import { FSDatastore, Key } from 'datastore-fs'

class BS {
  constructor (store) {
    this.store = store
  }
}

export function getBlockStore (path = '~/.badbits/blocks') {
  return new FsBlockstore(path)
}

export function getHead (path = '~/.badbits/data') {
  return new FSDatastore(path)
}
