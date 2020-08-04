// Until the defs are updated... https://github.com/uuidjs/uuid/issues/502
declare module 'uuid' {
  export {v1, v3, v4, v5, stringify, parse} from 'uuid'
  export declare function validate(uuid: string): boolean
}
