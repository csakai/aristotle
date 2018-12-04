import CircuitNode from '../base/CircuitNode'
import InputNode from '../base/InputNode'
import Connection from '../types/Connection';
/*
class Circuit {
  queue = []

  nodes = []

  inputs = []

  addNode (node) {
    if (node instanceof InputNode) {
      this.inputs.push(node)
    }
    this.nodes.push(node)
    this.enqueueInputs()
  }

  addConnection (source, target, index) {
    source.outputs.push({ node: target, index })
  }

  enqueueInputs () {
    this.queue = [...this.inputs]
  }

  updateQueue (added, removed) {
    added.forEach((node) => {
      if (this.queue.indexOf(node) === -1) {
        this.queue.push(node)
      }
    })
    this.queue.splice(this.queue.indexOf(removed), 1)
  }

  snapshotState () {
    const data = this.nodes.reduce((state, node) => ({
      ...state,
      [node.name]: node.value
    }), {})
    return JSON.stringify(data)
  }

  next () {
    const prevState = this.prevState

    this.queue.forEach((node) => {
      this.updateQueue(node.propagate(), node)
    })

    const state = this.snapshotState()

    if (!this.isComplete() && state === prevState) {
      this.prevState = state
      this.next()
    } else {
      this.prevState = state
    }
  }

  debug () {
    console.log('------ CIRCUIT DEBUG ------', this.queue)
    this.nodes.forEach(({ name, value, newValue }) => {
      console.log(`${name}:`, value)
    })
  }

  isComplete () {
    return this.queue.length === 0
  }
}
*/

class Circuit {
  queue: Array<CircuitNode> = []

  nodes: Array<CircuitNode> = []

  inputs: Array<InputNode> = []

  isValueChanged: boolean = false

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
    this.reset()
  }

  addConnection (source: CircuitNode, target: CircuitNode, index: number) {
    source.outputs.push(new Connection(target, index))
    this.reset()
  }

  removeConnection (source: CircuitNode, index: number) {
    console.log('Removing connection from/index: ', source, index)
    const connectionIndex = source
      .outputs
      .filter((connection) => connection.index === index)
      .map((connection) => connection.index)
      .pop()

    source.outputs.splice(connectionIndex, 1)
    this.reset()
  }

  removeNodeOutputs (source: CircuitNode) {
    console.log('Removing node outputs of: ', source)
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
    console.log('queue is now: ', this.queue)
  }

  debug () {
    console.log('------ CIRCUIT DEBUG ------', this.queue)
    this.nodes.forEach(({ name, value, newValue }) => {
      console.log(`${name}:`, value, newValue)
    })
  }

  reset () {
    //this.nodes.forEach((node) => node.reset())
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
