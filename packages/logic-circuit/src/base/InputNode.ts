import CircuitNode from './CircuitNode'
import LogicValue from '../types/LogicValue'

class InputNode extends CircuitNode {
  inputValues = [LogicValue.UNKNOWN]

  setValue (value) {
    this.newValue = value
    this.eval = () => value
  }
}

export default InputNode