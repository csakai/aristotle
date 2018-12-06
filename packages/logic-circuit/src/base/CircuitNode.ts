import Connection from '../types/Connection'
import LogicValue from '../types/LogicValue'
import OutputNode from './OutputNode'

class CircuitNode {
  inputValues: Array<number> = []

  outputs: Array<Connection> = []

  isValueChanged: boolean = false

  name: string

  value: number = LogicValue.UNKNOWN

  newValue: number = LogicValue.UNKNOWN

  events: Array<{ eventType: string, callback: Function }> = []

  needsCalculation: boolean = true

  constructor (name) {
    this.name = name
  }

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

      return this.outputs.map(({ node }) => node)
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
