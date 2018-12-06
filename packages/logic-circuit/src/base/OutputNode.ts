import CircuitNode from './CircuitNode'

class OutputNode extends CircuitNode {
  update (value) {
    this.newValue = value
  }
}

export default OutputNode
