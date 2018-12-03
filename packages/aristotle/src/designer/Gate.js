import draw2d from 'draw2d'

// gate svg imports
import svgAnd from '@/assets/logical-and.svg'
import svgNand from '@/assets/logical-nand.svg'
import svgXnor from '@/assets/logical-xnor.svg'
import svgOr from '@/assets/logical-or.svg'

import render from '@aristotle/logic-gates'

const Gates = {
    AND: 'AND',
    NAND: 'NAND',
    OR: 'OR',
    NOR: 'NOR',
    XOR: 'XOR',
    XNOR: 'XNOR'
}

const svg = {
  top: [
    { label: 'ABC', type: 'input' },
    { label: 'B', type: 'input' },
    { label: 'CEEEE', type: 'input' },
    { label: 'DEF', type: 'input' }
  ],
  left: [
    { label: 'ABC', type: 'input' },
    { label: 'EDB', type: 'input' }
  ],
  bottom: [
    { label: 'Q', type: 'input' },
    { label: 'sfdfsd', type: 'input' }
  ],
  right: [
    { label: 'EWAA', type: 'output' },
    { label: 'BDE', type: 'output' },
    { label: 'SS', type: 'output' },
    { label: 'RRR', type: 'output' }
  ]
}

class Gate extends draw2d.shape.basic.Image {
    constructor (gateType) {
      super({ resizeable: false })

      this.render()
      this.on('click', this.click)
      this.on('added', this.addEventListeners)
    }

    addEventListeners = () => {
      this.canvas.on('select', this.updateSelectionColor)
      this.canvas.on('reset', this.updateSelectionColor)
      this.canvas.html[0].addEventListener('click', this.updateSelectionColor)
    }

    render = () => {
      const { path, width, height, ports } = render(svg, '#000')

      this.setPath(path)
      this.setWidth(width)
      this.setHeight(height)
      this.setPorts(ports)
    }

    updateSelectionColor = (selection, event) => {
      const isSelected = !!~this.canvas.selection.all.data.indexOf(this)
      const color = isSelected ? '#ff0000' : '#000'

      this.setPath(render(svg, color).path)
    }

    setPorts = (ports) => {
      ports.forEach(({ x, y, type }) => {
        this.createPort(type, new draw2d.layout.locator.XYAbsPortLocator(x, y))
      })
    }

    setOutputConnectionColor = (color) => {
        this
            .getConnections()
            .data
            .filter((connection) => connection.getSource().parent === this)
            .forEach((connection) => connection.setColor(color))
    }

    click = () => {
        this.setOutputConnectionColor('#0000ff')
    }
}

export default Gate