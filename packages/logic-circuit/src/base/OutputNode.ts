import CircuitNode from './CircuitNode'

class OutputNode extends CircuitNode {
  update (value) {
    this.newValue = value
    this.value = value
  }
}

export default OutputNode
