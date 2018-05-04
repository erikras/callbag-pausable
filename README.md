# ⏯️ callbag-pausable

[Callbag](https://github.com/callbag/callbag) operator that allows data and talkbacks to pass through it freely until it received a data or talkback message of `PAUSE`, in which case it stops the downflow of data until it receives another data or talkback message of `RESUME`.

Think of it like a valve on a pipe.

## Usage

<!-- prettier-ignore -->
```js
import interval from 'callbag-interval'
import observe from 'callbag-observe'
import pipe from 'callbag-pipe'
import pausable, { PAUSE, RESUME } from 'callbag-pipe'

const source = pipe(interval(100), pausable)

setTimeout(() => {
  console.log('PAUSING')
  source(1, PAUSE)
}, 400)
setTimeout(() => {
  console.log('RESUMING')
  source(1, RESUME)
}, 1000)

observe(console.log)(source) // 0
                             // 1
                             // 2
                             // PAUSING
                             // RESUMING
                             // 9
                             // 10
                             // 11
                             // ...
```

<!-- prettier-ignore-end -->
