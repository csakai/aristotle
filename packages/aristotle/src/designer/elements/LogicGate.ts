import Element from '@/designer/Element'
import { CircuitNode, Nor, Or } from '@aristotle/logic-circuit'
import { renderGate } from '@aristotle/logic-gates'

export default class LogicGate extends Element {
  private gateType: string

  constructor (id: string, name: string, gateType: string) {
    super(id, name)

    this.gateType = gateType
    this.render(true)
    this.node = this.getCircuitNode(id)
    this.node.on('change', this.updateWireColor)
  }

  public updateWireColor = (value: number) => {
    this.setOutputConnectionColor(this.getWireColor(value))
  }

  public getSvg = (color: string) => {
    return renderGate('NOR', 2, color)
  }

  private getCircuitNode = (id: string): CircuitNode => {
    switch (this.gateType) {
      case 'NOR':
        return new Nor(id)
      case 'OR':
      default:
        return new Or(id)
    }
  }
}