import Element from '../Element'
import { Buffer, Nor } from '@aristotle/logic-circuit'
import getPortIndex from '../utils/getPortIndex'
import { IntegratedCircuitSVG } from '../svg'

/**
 * @description Embedded/integrated circuit element class. This takes an ordinary circuit definition
 * and assembles a subcircuit, where the inputs and outputs are buffers. When these buffers change,
 * the signal is propagated and the circuit is evaluated. This extends Element and renders an IC SVG.
 * @class IntegratedCircuit
 * @extends Element
 */
export default class IntegratedCircuit extends Element {
  /**
   * Constructor.
   *
   * @param {String} id
   * @param {Object} circuit
   * @param {Object} circuit.ports - list of port definitions
   * @param {Object} circuit.elements - list of node definitions
   * @param {Object} circuit.connections - list of connection entries
   */
  constructor (id, { ports, elements, connections }) {
    super(id)

    this.connectionEntries = connections
    this.elementEntries = elements
    this.ports = ports
    
    this.on('added', this.buildCircuit)

    this.initializeSvgRenderer()
    this.initializeCircuitNode()
    this.render()
  }

  initializeSvgRenderer = () => {
    this.svgRenderer = new IntegratedCircuitSVG({
      primaryColor: '#ffffff',
      secondaryColor: '#1C1D24',
      wires: this.ports,
      title: 'test' // TODO
    })
  }

  initializeCircuitNode = () => {
    this.nodes = this.elementEntries.map(this.getInitializedNode)
    this.inputIds = this.getNodeListByType(this.elementEntries, 'input')
    this.outputIds = this.getNodeListByType(this.elementEntries, 'output')

  }

  /**
   * Returns the id of the node that the given connection is connected to.
   * The connection can be either to an input port or an output one.
   *
   * @param {Connection} connection
   * @returns {String} id of connected node
   */
  getCircuitNodeId = (connection) => {
    const source = connection.getSource()
    const target = connection.getTarget()

    if (source.parent === this) {
      return this.outputIds[getPortIndex(source, 'output')]
    }
    return this.inputIds[getPortIndex(target, 'input')]
  }

  /**
   * Returns a circuit node with the matching id.
   *
   * @param {String} nodeId
   * @returns {LogicNode}
   */
  getCircuitNodeById = (nodeId) => {
    return this
      .nodes
      .filter((node) => node.name === nodeId)
      .pop()
  }

  /**
   * Returns the circuit node that the given connection is connected to.
   * 
   * @override {Element.getCircuitNode}
   * @param {Connection} connection
   * @returns {CircuitNode}
   */
  getCircuitNode = (connection) => {
    const nodeId = this.getCircuitNodeId(connection)

    return this.getCircuitNodeById(nodeId)
  }

  /**
   * Maps the ids of all nodes having the given type into an array.
   *
   * @param {Object[]} nodes - list of nodes to map ids from
   * @param {String} type - `input` or `output`
   * @returns {String[]} list of ids
   */
  getNodeListByType = (nodes, type) => {
    return nodes
      .filter(({ nodeType }) => nodeType === type)
      .sort((a, b) => a.portIndex - b.portIndex)
      .map(({ id }) => id)
  }

  getInitializedNode = ({ id, nodeType, portIndex }) => { // TODO: need to remap ids here too
    if (nodeType === 'input' || nodeType === 'output') {
      // replace inputs and outputs with buffers
      const node = new Buffer(id)

      if (nodeType === 'output') {
        // if the node is an output, propagate the color change
        node.on('change', this.setOutputConnectionColor.bind(this, id, portIndex))
      }

      node.forceContinue = true

      return node
    }

    return new Nor(id) // TODO
  }

  /**
   * Assembles the embedded circuit for the given nodes and connections.
   */
  buildCircuit = () => {
    this.nodes.forEach((el) => this.canvas.circuit.addNode(el)) //.bind(this))

    this.connectionEntries.forEach(({ inputId, outputId, targetIndex }) => {
      const input = this.getCircuitNodeById(inputId)
      const output = this.getCircuitNodeById(outputId)

      this.canvas.circuit.addConnection(input, output, targetIndex)
    })
  }

  setOutputConnectionColor = (nodeId, portIndex, value) => {
    const color = this.getWireColor(value)

    super
      .getConnections()
      .data
      .filter((connection) => connection.getSource().parent === this)
      .filter((connection) => getPortIndex(connection.getSource(), 'output') === portIndex)
      .forEach((connection) => connection.setColor(color))
  }

  getSvg = (color) => {
    return this.svgRenderer.getSvgData()
  }
}
