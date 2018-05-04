export const PAUSE = '__CALLBAG_PAUSABLE_PAUSE__'
export const RESUME = '__CALLBAG_PAUSABLE_RESUME__'
const pausable = source => {
  let paused = false
  return (type, data) => {
    if (type === 0) {
      const sink = data
      let talkback
      // give back talkback
      sink(0, (t, d) => {
        if (t === 1) {
          if (d === PAUSE) {
            paused = true
          } else if (d === RESUME) {
            paused = false
          } else {
            talkback(t, d)
          }
        } else if (t === 2 && talkback) {
          talkback(2)
        }
      })
      // register with source
      source(0, (t, d) => {
        if (t === 0) {
          talkback = d
        } else if (t === 1) {
          if (d === PAUSE) {
            paused = true
          } else if (d === RESUME) {
            paused = false
          } else if (!paused) {
            // pass along data to sink if not paused
            sink(t, d)
          }
        }
      })
    }
  }
}
export default pausable
