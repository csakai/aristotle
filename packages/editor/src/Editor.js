import draw2d from 'draw2d'
import Canvas from './Canvas'
import { Circuit } from '@aristotle/logic-circuit'
import Connection from './Connection'
import EditorModel from './models/EditorModel'
import ClipboardService from './services/ClipboardService'
import SerializationService from './services/SerializationService'
import uuid from './utils/uuid'

export default class Editor extends Canvas {
  constructor (elementId) {
    super(elementId)

    this.circuit = new Circuit()
    this.clipboard = new ClipboardService(this)
    this.installEditPolicies()
  }

  /**
   * Adds a node to the Editor and its circuit instance.
   *
   * @param {Element} node - element node to add
   * @param {Number} x - x-axis screen coordinates to add the element at
   * @param {Number} y - y-axis screen coordinates to add the element at
   */
  addNode (node, x, y) {
    this.add(node, x, y)
    this.circuit.addNode(node.node)
    this.step(true)
  }

  /**
   * Connects two elements together in the Editor and its circuit instance.
   *
   * @param {Element} source - source node
   * @param {Element} target - target node
   * @param {Number} index - input index at the target to connect to
   */
  addConnection = (source, target, index) => {
    const connection = new Connection(this.circuit)

    connection.setSource(source.getOutputPort(0))
    connection.setTarget(target.getInputPort(index))

    this.add(connection)
    this.step(true)
  }

  /**
   * Handles a toolbox drop event.
   *
   * @param {HTMLElement} element
   */
  onDrop = (element) => {
    const { x, y } = this.getDraggedCoordinates()
    const node = SerializationService.getNode(uuid(), { type: 'LogicGate', subtype: 'NOR' })

    this.addNode(node, x, y)
  }

  /**
   * Runs the circuit evaluation.
   * It will debug in a step-through manner if the `debug` property is set to `true`.
   * It will evaluate automatically until the circuit has no more updates.
   *
   * @param {Boolean} [force = false] - if true, forces the circuit to re-evaluate even if complete
   */
  step = (force = false) => {
    if (!this.circuit.isComplete() || force) {
      this.circuit.next()

      if (!this.debug) {
        setTimeout(() => this.step())
      }
    }
  }

  /**
   * Sets the mouse mode of the editor.
   *
   * @param {MouseMode} mode - valid values are: PANNING or SELECTION
   */
  setMouseMode = (mode) => {
    switch (mode) {
      case 'PANNING':
        this.installEditPolicy(new draw2d.policy.canvas.PanningSelectionPolicy())
        break
      case 'SELECTION':
      default:
        this.installEditPolicy(new draw2d.policy.canvas.BoundingboxSelectionPolicy())
        break
    }
    this.mouseMode = mode
  }

  /**
   * Returns a new instance of a Connection.
   *
   * @returns {Connection}
   */
  createConnection = () => {
    return new Connection(this.circuit)
  }

  /**
   * Installs basic edit policies for the editor.
   *
   * @private
   */
  installEditPolicies = () => {
    this.installEditPolicy(new draw2d.policy.canvas.ShowGridEditPolicy())
    this.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({
      createConnection: this.createConnection
    }))
  }

  getEditorModel = () => {
    return new EditorModel({
      canUndo: this.commandStack.canUndo(),
      canRedo: this.commandStack.canRedo(),
      selectionCount: this.getSelection().getSize(),
      mouseMode: this.mouseMode,
      debug: this.debug
    })
  }

  updateElement = (payload) => {
    this
      .getPrimarySelection()
      .updateSettings(payload)
  }

  load = (data) => {
    SerializationService.deserialize(this, data)
  }

  applyCommand = (command) => {
    switch (command.command) {
      case 'UNDO':
        try {
          this.commandStack.undo()
        } catch (e) {
          this.commandStack.redo()
          this.commandStack.undostack = []
          this.fireEvent('commandStackChanged')
        }
        break
      case 'REDO':
        try {
          this.commandStack.redo()
        } catch (e) {
          this.commandStack.undo()
          this.commandStack.redostack = []
          this.fireEvent('commandStackChanged')
        }
        break
      case 'CUT':
        console.log('not implemented')
        break
      case 'PASTE':
        this.clipboard.paste()
        break
      case 'UPDATE_ELEMENT':
        this.updateElement(command.payload)
        break
    }
  }
}