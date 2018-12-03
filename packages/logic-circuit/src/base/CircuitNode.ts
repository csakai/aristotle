import LogicValue from '../types/LogicValue'
import Connection from '../types/Connection'

class CircuitNode {
  inputValues: Array<LogicValue> = []

  outputs: Array<Connection> = []

  isValueChanged: boolean = false

  name: string

  constructor (name) {
    this.name = name
  }

  value: LogicValue = LogicValue.UNKNOWN

  newValue: LogicValue = LogicValue.UNKNOWN

  protected eval (): LogicValue {
    return this.value
  }

  updateOutputs (newValue: LogicValue) {
    this.outputs.forEach(({ node, index }: Connection) => {
      node.update(newValue, index)
    })
  }

  protected valueCount (compare: LogicValue): number {
    return this
      .inputValues
      .filter((value) => value === compare)
      .length
  }

  update (value: LogicValue, index: number) {
    this.inputValues[index] = value
    this.newValue = this.eval()
  }

  propagate (): Array<CircuitNode> {
    if (this.value !== this.newValue) {
      this.isValueChanged = true
      this.value = this.newValue
      this.updateOutputs(this.newValue)
      this.newValue = LogicValue.UNKNOWN
      
      return this.outputs.map(({ node }) => node)
    }
    return []
  }
}

export default CircuitNode