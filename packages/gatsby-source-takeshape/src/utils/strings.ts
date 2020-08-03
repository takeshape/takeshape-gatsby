import {format} from 'util'

export function tmpl<T extends unknown[]>(pattern: string) {
  return (...params: [...T]): string => {
    return format(pattern, ...params)
  }
}
