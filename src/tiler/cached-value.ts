// Type voodoo, as seen here:
// https://spin.atomicobject.com/2017/04/11/typescript-represent-function-properties/
// This creates a specific type for a function with an additional property.
declare type UpdateFunction<T> = () => T
export interface Cache<T> extends UpdateFunction<T> { dirty: boolean }

export default function createCache<T> (update: UpdateFunction<T>): Cache<T> {
  let value

  // PointList function will only recalculate its value if marked as dirty.
  function cachedValue (): T {
    if (cachedValue.dirty) {
      value = update()
      cachedValue.dirty = false
    }

    return value
  }

  // Mark list as dirty on creation.
  cachedValue.dirty = true

  return cachedValue
}
