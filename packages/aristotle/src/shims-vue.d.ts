declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'draw2d' {
  // @ts-ignore
  export { policy, util, Connection, Port, Canvas, layout } from 'draw2d'
}

declare module '@aristotle/logic-circuit' {
  // @ts-ignore
  export { Circuit, CircuitNode, InputNode, OutputNode, Nor, Or, LogicValue } from '@aristotle/logic-circuit'
}
