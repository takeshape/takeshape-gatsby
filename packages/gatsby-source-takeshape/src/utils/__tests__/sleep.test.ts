import sleep from '../sleep'
import flushPromises from 'flush-promises'

jest.useFakeTimers()

it(`sleep`, async () => {
  let resolved = false
  sleep(500).then(() => {
    resolved = true
  })

  jest.advanceTimersByTime(499)
  await flushPromises()
  expect(resolved).toBe(false)
  jest.advanceTimersByTime(1)
  await flushPromises()
  expect(resolved).toBe(true)
})
