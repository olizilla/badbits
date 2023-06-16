# badbits

> IPFS [badbits lists](https://badbits.dwebops.pub/) you can follow and fork

🧪 experiment: use [pail] to make content-addressed lists we can share, edit, sync and fork.

## Getting started

With `node` > 16, install the deps with `npm i` and run it

```sh
# pass the filename of the badbits file you want to test with
node badbits.js badbits.3000.txt
```

If you want to get the latest, full, > 8MB denylist run

```
npm run denylist
```

## Usage 

> SERVING SUGGESTION. NONE OF THIS IS IMPLEMENTED YET.
> Also, I just found out about https://github.com/ipfs/specs/pull/383 which may change things.

### Setup

```sh
# start a new list
badbits init
```

### Edit the list

```sh
# add a cid to the list 
badbits add bafybeibg3oyxu7zd2mds3j63rmoifzajegiedcqoj3hdsvkscvf5dmkooq

# add a cid + path to the list 
badbits add bafybeibg3oyxu7zd2mds3j63rmoifzajegiedcqoj3hdsvkscvf5dmkooq/badbits.txt

# take an item off the list
badbits rm bafybeibg3oyxu7zd2mds3j63rmoifzajegiedcqoj3hdsvkscvf5dmkooq
```

### Check the list

```sh
badbits bafybeibg3oyxu7zd2mds3j63rmoifzajegiedcqoj3hdsvkscvf5dmkooq
ok
```

```sh
badbits bafybeibg3oyxu7zd2mds3j63rmoifzajegiedcqoj3hdsvkscvf5dmkooq/badbits.txt
not ok
```

### Sync it

```sh
# send blocks and update remote head (w3clock)
badbits push
```

```sh
# update local head and pull blocks
badbits pull
```


[pail]: https://github.com/alanshaw/pail
