import CircuitNode from '../base/CircuitNode'
import InputNode from '../base/InputNode'
import Connection from '../types/Connection';
import LogicValue from '../types/LogicValue';

class Circuit {
  queue: Array<CircuitNode> = []

  nodes: Array<CircuitNode> = []

  inputs: Array<InputNode> = []

  addNode (node: CircuitNode) {
    if (node instanceof InputNode) {
      this.inputs.push(node)
    }
    this.nodes.push(node)
    this.enqueueInputs()
  }

  removeNode (node: CircuitNode) {
    if (node instanceof InputNode) {
      this.inputs.splice(this.inputs.indexOf(node), 1)
    }
    this.nodes.splice(this.nodes.indexOf(node), 1)
    this.removeNodeOutputs(node)
    this.enqueueInputs()
    this.next()
  }

  addConnection (source: CircuitNode, target: CircuitNode, index: number) {
    source.outputs.push(new Connection(target, index))
    source.value = LogicValue.UNKNOWN
    this.queue.push(source)
    this.next()
  }

  removeConnection (source: CircuitNode, index: number) {
    const connectionIndex = source
      .outputs
      .filter((connection) => connection.index === index)
      .map((connection) => connection.index)
      .pop()

    source.outputs.splice(connectionIndex, 1)
    source.value = LogicValue.UNKNOWN
    this.queue.push(source)
    this.next()
  }

  removeNodeOutputs (source: CircuitNode) {
    for (let i: number = 0; i < source.outputs.length; i++) {
      this.removeConnection(source, i)
    }
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
    this.nodes.forEach(({ name, value, newValue }) => {
      console.log(`${name}:`, value, newValue)
    })
  }

  reset () {
    this.nodes.forEach((node) => node.reset())
  }

  next () {
    let isValueChanged = false

    this.queue.forEach((node) => {
      this.updateQueue(node.propagate(), node)

      if (node.isValueChanged) {
        isValueChanged = true
        node.isValueChanged = false
      }
    })

    if (!this.isComplete() && !isValueChanged) {
      // if the queue is not finished but no value in the circuit has changed, probe again
      return this.next()
    }
  }

  isComplete (): boolean {
    return this.queue.length === 0
  }
}


export default Circuit
