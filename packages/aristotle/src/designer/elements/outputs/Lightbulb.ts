import Element from '@/designer/Element'
import { OutputNode } from '@aristotle/logic-circuit'
import render from '@aristotle/logic-gates'

export default class Lightbulb extends Element {
  private bgColor: string = '#808080'

  constructor (name: string) {
    super(name)

    this.node = new OutputNode(name)
    this.node.on('change', this.updateWireColor)
    this.render(true)
  }

  protected getSvg = (color: string) => {
    const svg = {
      right: [], left: [
        { label: '*', type: 'input' }
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
