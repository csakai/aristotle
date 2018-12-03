import CircuitNode from './CircuitNode'
import LogicValue from '../types/LogicValue'

class OutputNode extends CircuitNode {
  update (value) {
    this.newValue = value
    this.value = value
  }
}

export default OutputNode