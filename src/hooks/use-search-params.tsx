import { createMemo } from 'solid-js'
import { useLocation } from 'solid-start'

export const useURLSearchParams = <T extends string[]>(...vars: T) => {
  const location = useLocation()
  const memo = createMemo(() => {
    const search = new URLSearchParams(location.search)
    const result: Record<string, string | null> = {}
    for (const v of vars) {
      result[v] = search.get(v)
    }
    return result as {
      [key in T[number]]: string
    }
  })
  return memo
}
