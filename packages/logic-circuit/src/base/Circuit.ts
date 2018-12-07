import CircuitNode from '../base/CircuitNode'
import InputNode from '../base/InputNode'
import Connection from '../types/Connection'
import LogicValue from '../types/LogicValue'

class Circuit {
  /**
   * The debugger processing queue.
   *
   * @type {Array<CircuitNode>}
   */
  public queue: Array<CircuitNode> = []

  /**
   * A list of all the nodes in the circuit.
   *
   * @type {Array<CircuitNode>}
   */
  public nodes: Array<CircuitNode> = []

  /**
   * A list of all input nodes in the circuit.jest
   *
   * @type {Array<CircuitNode>}
   */
  public inputs: Array<InputNode> = []

  /**
   * Adds a node to the circuit and its appropriate queue(s).
   *
   * @param {CircuitNode} node - node to add
   */
  public addNode (node: CircuitNode) {
    if (node instanceof InputNode) {
      this.inputs.push(node)
      this.updateQueue([node])
    }
    this.nodes.push(node)
  }

  /**
   * Removes a node from the circuit and its appropriate queue(s).
   *
   * @param {CircuitNode} node - node to remove
   */
  public removeNode (node: CircuitNode) {
    if (node instanceof InputNode) {
      this.inputs.splice(this.inputs.indexOf(node), 1)
      this.reset()
    }
    this.nodes.splice(this.nodes.indexOf(node), 1)
    this.removeNodeOutputs(node)
    this.next()
  }

  /**
   * Adds a connection entry from the source node to the target node on the given index.
   *
   * @param {CircuitNode} source - source node
   * @param {CircuitNode} target - target node
   * @param {Number} targetIndex - entry index on the target node for the connection
   */
  addConnection (source: CircuitNode, target: CircuitNode, targetIndex: number) {
    source.outputs.push(new Connection(target, targetIndex))
    source.value = LogicValue.UNKNOWN
    this.updateQueue([source])
    this.next()
  }

  removeConnection (source: CircuitNode, sourceIndex: number) {
    source
      .outputs
      .concat()
      .forEach(({ node, index }: Connection, i: number) => {
        if (sourceIndex === i) {
          // reset the input of the target for this connection to hi-Z
          node.update(LogicValue.UNKNOWN, index)

          // remove the output entry at the source
          source.outputs.splice(sourceIndex, 1)

          // place the target node in the queue for processing
          this.updateQueue([node])
        }
      })
    this.next()
  }

  removeNodeOutputs (source: CircuitNode) {
    for (let i: number = 0; i < source.outputs.length; i++) {
      this.removeConnection(source, i)
    }
  }

  updateQueue (added: Array<CircuitNode>, removed: CircuitNode = null) {
    const removedIndex = this.queue.indexOf(removed)

    added.forEach((node) => {
      if (~this.queue.indexOf(node)) {
        this.queue.push(node)
      }
    })

    if (~removedIndex) {
      this.queue.splice(removedIndex, 1)
    }
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
