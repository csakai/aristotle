import Or from './Or'
import LogicValue from '../types/LogicValue'

class Nor extends Or {
  protected eval (): LogicValue {
    switch (super.eval()) {
      case LogicValue.TRUE:
        return LogicValue.FALSE
      case LogicValue.FALSE:
        return LogicValue.TRUE
      default:
        return LogicValue.UNKNOWN
    }
  }
}

export default Nor