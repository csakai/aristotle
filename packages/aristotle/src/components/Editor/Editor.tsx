import Canvas from '@/designer/Canvas'
// @ts-ignore
import Gate from '@/designer/Gate'
import { Component, Vue } from 'vue-property-decorator'
import { LogicValue, Circuit, InputNode, Nor, OutputNode } from '@aristotle/logic-circuit'

@Component
export default class extends Vue {
  public panning: boolean = false
  public canvas: any
  public canvasWidth: number = 1600
  public canvasHeight: number = 1600

  public pan () {
    this.canvas.setMouseMode('PANNING')
  }

  public select () {
    this.canvas.setMouseMode('SELECTION')
  }

  public step () {
    // this.canvas.circuit.next()
    // this.canvas.circuit.debug()
    const next = (n: number) => {
      console.log(`------------ PASS ${n} ------------`)
      this.canvas.circuit.next()
      this.canvas.circuit.debug()

      if (!this.canvas.circuit.isComplete()) {
        setTimeout(() => next(n + 1), 1000)
      }
    }
    next(1)
  }

  public mounted () {
    this.canvas = new Canvas('canvas')

    const R = new Gate('Input', 'R')
    const S = new Gate('Input', 'S')

    const NOR_1 = new Gate('Nor', 'NOR_1')
    const NOR_2 = new Gate('Nor', 'NOR_2')

    const OUT_1 = new Gate('Output', 'OUT_1')
    const OUT_2 = new Gate('Output', 'OUT_2')

    this.canvas.addNode(R, 0, 350)
    this.canvas.addNode(S, 0, 450)
    this.canvas.addNode(NOR_1, 200, 350)
    this.canvas.addNode(NOR_2, 200, 450)
    this.canvas.addNode(OUT_1, 400, 350)
    this.canvas.addNode(OUT_2, 400, 450)

    this.canvas.newConnection(NOR_1, NOR_2, 1)
    this.canvas.newConnection(S, NOR_2, 0)
    this.canvas.newConnection(NOR_2, NOR_1, 1)
    this.canvas.newConnection(R, NOR_1, 0)
    this.canvas.newConnection(NOR_1, OUT_1, 0)
    this.canvas.newConnection(NOR_2, OUT_2, 0)

    R.setValue(LogicValue.TRUE)
    S.setValue(LogicValue.FALSE)
  }

  public render () {
    return (
      <div id='app'>
        <button onClick={this.pan}>Panning Mode</button>
        <button onClick={this.select}>Select Mode</button>
        <button onClick={this.step}>Step</button>
        <div id='canvasWrapper'>
          <div
            id='canvas'
            style={{
              width: this.canvasWidth + 'px',
              height: this.canvasHeight + 'px'
            }}
          />
        </div>
      </div>
    )
  }
}
