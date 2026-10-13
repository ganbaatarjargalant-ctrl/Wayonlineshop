import { useCartStore } from './cartStore'

beforeEach(() => {
  useCartStore.setState({ courseIds: [] })
})

test('add dedupes, remove, clear', () => {
  const s = useCartStore.getState()
  s.add('c1')
  s.add('c1')
  s.add('c2')
  expect(useCartStore.getState().courseIds).toEqual(['c1', 'c2'])
  s.remove('c1')
  expect(useCartStore.getState().courseIds).toEqual(['c2'])
  s.clear()
  expect(useCartStore.getState().courseIds).toEqual([])
})

test('persists to way.cart', () => {
  useCartStore.getState().add('c3')
  expect(localStorage.getItem('way.cart')).toContain('c3')
})

test('corrupted way.cart rehydrates to empty without throwing', async () => {
  localStorage.setItem('way.cart', '{bad')
  await useCartStore.persist.rehydrate()
  expect(useCartStore.getState().courseIds).toEqual([])
})
