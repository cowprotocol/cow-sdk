export class ViemParamType {
  public name: string
  public type: string
  public baseType: string
  public indexed: boolean
  public components: ViemParamType[]
  public arrayLength: number
  public arrayChildren: ViemParamType | null

  constructor(type: string) {
    this.name = ''
    this.type = this.normalizeType(type)
    this.indexed = false
    this.components = []
    this.arrayLength = -1
    this.arrayChildren = null

    this.baseType = this.parseBaseType(this.type)

    if (this.baseType === 'array') {
      this.arrayChildren = new ViemParamType(this.getArrayElementType(this.type))
    }
  }

  private normalizeType(type: string): string {
    // Normalize uint types to uint256 for compatibility with ethers
    if (type === 'uint') return 'uint256'
    if (type === 'int') return 'int256'
    return type
  }

  private parseBaseType(type: string): string {
    if (type.includes('[]')) return 'array'
    if (type.startsWith('tuple') || type.includes('(')) return 'tuple'
    if (type.startsWith('uint') || type.startsWith('int')) return 'number'
    if (type === 'bool') return 'boolean'
    if (type === 'string') return 'string'
    if (type === 'bytes' || type.startsWith('bytes')) return 'bytes'
    if (type === 'address') return 'address'
    if (type.startsWith('fixed') || type.startsWith('ufixed')) return 'fixed'
    if (type.startsWith('function')) return 'function'
    return 'unknown'
  }

  private getArrayElementType(type: string): string {
    return type.replace('[]', '')
  }
}
