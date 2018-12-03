import CircuitNode from '../base/CircuitNode'
import InputNode from '../base/InputNode'
import LogicValue from '../types/LogicValue'

class Circuit {
  queue: Array<CircuitNode> = []

  nodes: Array<CircuitNode> = []

  inputs: Array<InputNode> = []

  isValueChanged: boolean = false

  add (node: CircuitNode) {
    if (node instanceof InputNode) {
      this.inputs.push(node)
    }
    this.nodes.push(node)
    this.enqueueInputs()
  }

  enqueueInputs () {
    this.queue = [...this.inputs]
  }

  updateQueue (added: Array<CircuitNode>, removed: CircuitNode) {
    added.forEach((node) => {
      if (this.queue.indexOf(node) === -1) {
        this.queue.push(node)
      }
    })
    this.queue.splice(this.queue.indexOf(removed), 1)
  }

  debug () {
    this.nodes.forEach(({ name, value }) => {
      console.log(`${name}:`, value)
    })
  }

  next () {
    this.isValueChanged = false
    
    this.queue.forEach((node) => {
      this.updateQueue(node.propagate(), node)
      
      if (node.isValueChanged) {
        this.isValueChanged = true
        node.isValueChanged = false
      }
    })
    
    if (!this.isComplete() && !this.isValueChanged) {
      // if the queue is not finished but no value in the circuit has changed, probe again
      return this.next()
    }
  }

  isComplete (): boolean {
    return this.queue.length === 0
  }
}

export default Circuit