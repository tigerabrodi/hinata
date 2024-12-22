import { expect, it } from 'vitest'
import { formatImageFilename } from './utils'

it('should format image filename', () => {
  expect(formatImageFilename({ imageDescription: 'Hello World' })).toBe(
    'hello_world'
  )

  expect(formatImageFilename({ imageDescription: 'Hello World 123' })).toBe(
    'hello_world_123'
  )

  expect(
    formatImageFilename({ imageDescription: 'Hello...Worldlolok123!!' })
  ).toBe('helloworldlolok123')

  expect(
    formatImageFilename({ imageDescription: '.ok!-uhm,isthisgonnawork World' })
  ).toBe('okuhmisthisgonnawork_world')
})
