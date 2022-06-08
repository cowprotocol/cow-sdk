type UnionKeys<T> = T extends T ? keyof T : never
type StrictUnionHelper<T, TAll> = T extends any ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>> : never
export type StrictUnion<T> = StrictUnionHelper<T, T>
