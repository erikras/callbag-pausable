import pausable, { PAUSE, RESUME } from './pausable'
import pipe from 'callbag-pipe'
import map from 'callbag-map'
import tap from 'callbag-tap'
import mock from 'callbag-mock'

describe('pausable', () => {
  it('should allow data to pass through', () => {
    const spy = jest.fn(x => x)
    const source = mock(true)
    const sink = mock()

    const callbag = pipe(
      source,
      map(x => x * 2),
      pausable,
      tap(spy)
    )

    callbag(0, sink)
    expect(spy).not.toHaveBeenCalled()

    source.emit(1, 10)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0]).toEqual([20])

    source.emit(1, 12)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy.mock.calls[1]).toEqual([24])

    source.emit(1, 14)
    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy.mock.calls[2]).toEqual([28])

    source.emit(1, 18)
    expect(spy).toHaveBeenCalledTimes(4)
    expect(spy.mock.calls[3]).toEqual([36])

    sink.emit(2)
  })

  it('should pause/resume the stream via pause/resume talkback messages', () => {
    const spy = jest.fn(x => x)
    const source = mock(true)
    const sink = mock()

    const callbag = pipe(
      source,
      map(x => x * 2),
      pausable,
      tap(spy)
    )

    callbag(0, sink)
    expect(spy).not.toHaveBeenCalled()

    source.emit(1, 10)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0]).toEqual([20])

    source.emit(1, 12)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy.mock.calls[1]).toEqual([24])

    sink.emit(1, PAUSE)

    source.emit(1, 14)
    expect(spy).toHaveBeenCalledTimes(2)

    source.emit(1, 15)
    expect(spy).toHaveBeenCalledTimes(2)

    sink.emit(1, RESUME)

    source.emit(1, 16)
    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy.mock.calls[2]).toEqual([32])

    source.emit(1, 18)
    expect(spy).toHaveBeenCalledTimes(4)
    expect(spy.mock.calls[3]).toEqual([36])

    sink.emit(2)
  })

  it('should pause/resume the stream via pause/resume data messages', () => {
    const spy = jest.fn(x => x)
    const source = mock(true)
    const sink = mock()

    const callbag = pipe(
      source,
      pausable,
      map(x => x * 2),
      tap(spy)
    )

    callbag(0, sink)
    expect(spy).not.toHaveBeenCalled()

    source.emit(1, 10)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0]).toEqual([20])

    source.emit(1, 12)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy.mock.calls[1]).toEqual([24])

    source.emit(1, PAUSE)
    expect(spy).toHaveBeenCalledTimes(2)

    source.emit(1, 14)
    expect(spy).toHaveBeenCalledTimes(2)

    source.emit(1, 15)
    expect(spy).toHaveBeenCalledTimes(2)

    source.emit(1, RESUME)

    source.emit(1, 16)
    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy.mock.calls[2]).toEqual([32])

    source.emit(1, 18)
    expect(spy).toHaveBeenCalledTimes(4)
    expect(spy.mock.calls[3]).toEqual([36])

    sink.emit(2)
  })

  it('should allow non-pause/resume talkbacks to pass through', () => {
    const spy = jest.fn(x => x)
    const source = mock(true)
    const sink = mock()

    const callbag = pipe(
      source,
      map(x => x * 2),
      pausable,
      tap(spy)
    )

    callbag(0, sink)
    expect(spy).not.toHaveBeenCalled()

    source.emit(1, 10)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0]).toEqual([20])

    sink.emit(1, 'hello')
    source.emit(1, 12)
    sink.emit(1, 'world')
    source.emit(1, 14)

    sink.emit(2)
    expect(source.getReceivedData()).toEqual(['hello', 'world'])
    expect(sink.getReceivedData()).toEqual([20, 24, 28])
  })

  it('should ignore messages that are not greetings', () => {
    // mainly for code coverage
    const source = mock(true)
    const callbag = pausable(source)
    callbag(1)
    callbag(2)
    callbag(42)
  })

  it('should ignore messages to talkback that are not data or termination', () => {
    // mainly for code coverage
    const source = mock(true)
    const sink = mock()
    const callbag = pipe(
      source,
      map(x => x * 2),
      pausable
    )
    callbag(0, sink)

    sink.emit(0)
    sink.emit('wrong')
    sink.emit(42)
  })

  it('should ignore data messages that are not greeting or data', () => {
    // mainly for code coverage
    const source = mock(true)
    const sink = mock()
    const callbag = pipe(
      source,
      map(x => x * 2),
      pausable
    )
    callbag(0, sink)

    source.emit(3)
    source.emit(4)
    source.emit(5)
  })

  it('should not care if data received but no talkback from source', () => {
    // mainly for code coverage
    const source = (t, d) => {
      if (t === 0) {
        const sink = d
        sink(0, undefined) // no talkback given
      }
    }
    const callbag = pausable(source)

    // start
    let talkback
    callbag(0, (t, d) => {
      if (t === 0) {
        talkback = d
      }
    })
    talkback(1, 'talkback data')

    // terminate
    callbag(2)
  })
})
