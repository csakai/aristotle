import Element from '@/designer/Element'
import { CircuitNode, Nor, Or } from '@aristotle/logic-circuit'
import render from '@aristotle/logic-gates'

export default class LogicGate extends Element {
  private gateType: string

  constructor (name: string, gateType: string) {
    super(name)

    this.gateType = gateType
    this.render(true)
    this.node = this.getCircuitNode()
    this.node.on('change', this.updateWireColor)
  }

  private getCircuitNode = (): CircuitNode => {
    switch (this.gateType) {
      case 'NOR':
        return new Nor(this.name)
      case 'OR':
      default:
        return new Or(this.name)
    }
  }

  protected getSvg = (color: string) => {
    const svg = {
      left: [
        { label: 'IN1', type: 'input' },
        { label: 'IN2', type: 'input' }
      ], right: [
        { label: 'OUT', type: 'output' }
      ], top: [], bottom: []
    }

    return render(svg, color)
  }

  public updateWireColor = (value: string) => {
    this.setOutputConnectionColor(this.getWireColor(value))
  }
}
