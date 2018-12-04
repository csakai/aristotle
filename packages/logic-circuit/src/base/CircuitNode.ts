import Connection from '../types/Connection'
import LogicValue from '../types/LogicValue'

class CircuitNode {
  inputValues: Array<number> = []

  outputs: Array<Connection> = []

  isValueChanged: boolean = false

  name: string

  constructor (name) {
    this.name = name
  }

  value: number = LogicValue.UNKNOWN

  newValue: number = LogicValue.UNKNOWN

  events: Array<{ eventType: string, callback: Function }> = []

  protected eval (): number {
    return this.value
  }

  updateOutputs (newValue: number) {
    this.outputs.forEach(({ node, index }: Connection) => {
      node.update(newValue, index)
    })
  }

  protected valueCount (compare: number): number {
    return this
      .inputValues
      .filter((value) => value === compare)
      .length
  }

  update (value: number, index: number) {
    this.inputValues[index] = value
    this.newValue = this.eval()
  }

  propagate (): Array<CircuitNode> {
    if (this.value !== this.newValue) {
      this.isValueChanged = true
      this.value = this.newValue
      this.updateOutputs(this.newValue)
      this.invokeEvent('change', this.newValue)
      this.newValue = LogicValue.UNKNOWN

      return this.outputs.map(({ node }) => {
        return node
      })
    }
    return []
  }

  on (eventType: string, callback: Function) {
    this.events.push({ eventType, callback })
  }

  invokeEvent (eventType: string, value: number) {
    this.events.forEach((event) => {
      if (event.eventType === eventType) {
        event.callback(value)
      }
    })
  }

  reset () {
    this.value = LogicValue.UNKNOWN
    this.newValue = LogicValue.UNKNOWN
  }
}


export default CircuitNode
