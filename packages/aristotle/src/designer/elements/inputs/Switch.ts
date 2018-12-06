import Element from '@/designer/Element'
import { InputNode, LogicValue } from '@aristotle/logic-circuit'
import render from '@aristotle/logic-gates'

export default class Switch extends Element {
  private bgColor: string = '#808080'

  constructor (name: string) {
    super(name)

    this.node = new InputNode(name)
    this.node.on('change', this.updateWireColor)
    this.render(true)
    super.on('click', this.toggle)
  }

  private toggle = () => {
    const newValue = this.node.value === LogicValue.TRUE ? LogicValue.FALSE : LogicValue.TRUE
    this.node.setValue(newValue)
    this.canvas.step(true)
    this.canvas.circuit.enqueueInputs()
  }

  protected getSvg = (color: string) => {
    const svg = {
      left: [], right: [
        { label: '*', type: 'output' }
      ], top: [], bottom: []
    }

    return render(svg, color, this.bgColor)
  }

  public updateWireColor = (value: string) => {
    this.bgColor = this.getWireColor(value)
    this.setOutputConnectionColor(this.bgColor)
    this.render()
  }
}