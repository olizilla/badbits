#!/usr/bin/env node

import sade from 'sade'
import { readFileSync } from 'node:fs'
import { hash, add } from './badbits.js'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), { encoding: 'utf-8' }))
const cli = sade('badbits')

cli
  .version(pkg.version)
  // .option('--global, -g', 'An example global flag')
  // .option('-c, --config', 'Provide path to custom config', 'foo.config.js')

cli
  .command('add <cid>', 'add cid to the list')
  .example('add QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
  .example('add QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/foo/bar')
  .action(async (cidPath) => {
    console.log(await hash(cidPath))
  })

cli
  .command('hash <cid>', 'convert cid to denylist key format')
  .example('hash QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
  .example('hash QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/foo/bar')
  .action(async (cidPath) => {
    console.log(await hash(cidPath))
  })

cli.parse(process.argv)
