import Circuit from '../Circuit'
import InputNode from '../InputNode'
import CircuitNode from '../CircuitNode'
import Connection from '../../types/Connection'
import LogicValue from '../../types/LogicValue'
import Nor from '../../gates/Nor'

describe('Circuit', () => {
  let circuit: Circuit

  beforeEach(() => {
    circuit = new Circuit()
  })

  describe('addNode()', () => {
    describe('when the node is an InputNode', () => {
      let node

      beforeEach(() => {
        node = new InputNode('MY_INPUT')
      })

      it('should add it to the input list', () => {
        circuit.addNode(node)

        expect(circuit.inputs).toContain(node)
      })

      it('should update the queue with the node', () => {
        jest.spyOn(circuit, 'updateQueue')
        circuit.addNode(node)

        expect(circuit.updateQueue).toHaveBeenCalledTimes(1)
        expect(circuit.updateQueue).toHaveBeenCalledWith([node])
      })

      it('should add it to the nodes list', () => {
        circuit.addNode(node)

        expect(circuit.nodes).toContain(node)
      })
    })

    describe('when the node is not an InputNode', () => {
      let node

      beforeEach(() => {
        node = new Nor('NOR_1')
      })

      it('should not update the queue', () => {
        jest.spyOn(circuit, 'updateQueue')
        circuit.addNode(node)

        expect(circuit.updateQueue).not.toHaveBeenCalled()
      })

      it('should add it to the nodes list', () => {
        circuit.addNode(node)

        expect(circuit.nodes).toContain(node)
      })
    })
  })

  describe('removeNode()', () => {
    describe('when the node is an InputNode', () => {
      let node

      beforeEach(() => {
        node = new InputNode('MY_INPUT')
        circuit.nodes.push(node)
      })

      it('should remove it from the input list', () => {
        circuit.inputs.push(node)
        circuit.removeNode(node)

        expect(circuit.inputs).not.toContain(node)
      })

      it('should reset the circuit', () => {
        jest.spyOn(circuit, 'reset')
        circuit.removeNode(node)

        expect(circuit.reset).toHaveBeenCalledTimes(1)
      })

      it('should call `removeNodeOutputs()` with the given node', () => {
        jest.spyOn(circuit, 'removeNodeOutputs')
        circuit.removeNode(node)

        expect(circuit.removeNodeOutputs).toHaveBeenCalledTimes(1)
        expect(circuit.removeNodeOutputs).toHaveBeenCalledWith(node)
      })

      it('should step the circuit', () => {
        jest.spyOn(circuit, 'next')
        circuit.removeNode(node)

        expect(circuit.next).toHaveBeenCalledTimes(1)
      })

      it('should remove it from, the nodes list', () => {
        circuit.removeNode(node)

        expect(circuit.nodes).not.toContain(node)
      })
    })

    describe('when the node is not an InputNode', () => {
      let node

      beforeEach(() => {
        node = new Nor('NOR_1')
      })

      it('should call `removeNodeOutputs()` with the given node', () => {
        jest.spyOn(circuit, 'removeNodeOutputs')
        circuit.removeNode(node)

        expect(circuit.removeNodeOutputs).toHaveBeenCalledTimes(1)
        expect(circuit.removeNodeOutputs).toHaveBeenCalledWith(node)
      })

      it('should not reset the circuit', () => {
        jest.spyOn(circuit, 'reset')
        circuit.removeNode(node)

        expect(circuit.reset).not.toHaveBeenCalled()
      })

      it('should step the circuit', () => {
        jest.spyOn(circuit, 'next')
        circuit.removeNode(node)

        expect(circuit.next).toHaveBeenCalledTimes(1)
      })

      it('should remove it from, the nodes list', () => {
        circuit.removeNode(node)

        expect(circuit.nodes).not.toContain(node)
      })
    })
  })

  describe('addConnection()', () => {
    let sourceNode: CircuitNode
    let targetNode: CircuitNode
    let dummyNode: CircuitNode

    beforeEach(() => {
      sourceNode = new InputNode('MY_INPUT')
      targetNode = new Nor('NOR_1')
      dummyNode = new Nor('NOR_2')

      circuit.addNode(sourceNode)
      circuit.addNode(targetNode)
      circuit.addNode(dummyNode)
      circuit.addConnection(sourceNode, dummyNode, 0)
    })

    it('should add a new connection entry to the source node outputs list', () => {
      expect(sourceNode.outputs).toHaveLength(1)

      circuit.addConnection(sourceNode, targetNode, 0)

      expect(sourceNode.outputs).toHaveLength(2)
      expect(sourceNode.outputs[1]).toBeInstanceOf(Connection)
      expect(sourceNode.outputs[1].node).toEqual(targetNode)
      expect(sourceNode.outputs[1].index).toEqual(0)
    })

    it('should set the source node value to hi-Z', () => {
      circuit.addConnection(sourceNode, targetNode, 0)

      expect(sourceNode.value).toEqual(LogicValue.UNKNOWN)
    })

    it('should update the queue with the source node', () => {
      jest.spyOn(circuit, 'updateQueue')
      circuit.addConnection(sourceNode, targetNode, 0)

      expect(circuit.updateQueue).toHaveBeenCalledTimes(1)
      expect(circuit.updateQueue).toHaveBeenCalledWith([sourceNode])
    })

    it('should step the circuit', () => {
      jest.spyOn(circuit, 'next')
      circuit.addConnection(sourceNode, targetNode, 0)

      expect(circuit.next).toHaveBeenCalledTimes(1)
    })
  })

  describe('removeConnection()', () => {
    let sourceNode: CircuitNode
    let targetNode: CircuitNode
    let dummyNode: CircuitNode

    beforeEach(() => {
      sourceNode = new InputNode('MY_INPUT')
      targetNode = new Nor('NOR_1')
      dummyNode = new Nor('NOR_2')

      circuit.addNode(sourceNode)
      circuit.addNode(targetNode)
      circuit.addNode(dummyNode)
      circuit.addConnection(sourceNode, dummyNode, 0)
      circuit.addConnection(sourceNode, targetNode, 0)
    })

    it('should update the target node\'s value to hi-Z', () => {
      const sourceIndex = 1
      const targetIndex = 0

      jest.spyOn(targetNode, 'update')
      circuit.removeConnection(sourceNode, targetIndex)

      expect(targetNode.update).toHaveBeenCalledTimes(1)
      expect(targetNode.update).toHaveBeenCalledWith(LogicValue.UNKNOWN, targetIndex)
    })

    it('should remove the connection from the source node\'s outputs list', () => {
      const sourceIndex = 1
      const targetIndex = 0

      expect(sourceNode.outputs[sourceIndex]).toBeInstanceOf(Connection)
      expect(sourceNode.outputs[sourceIndex].node).toEqual(targetNode)

      circuit.removeConnection(sourceNode, targetIndex)

      expect(sourceNode.outputs[sourceIndex]).not.toBeDefined()
    })

    it('should update the queue with the source node', () => {
      jest.spyOn(circuit, 'updateQueue')
      circuit.addConnection(sourceNode, targetNode, 0)

      expect(circuit.updateQueue).toHaveBeenCalledTimes(1)
      expect(circuit.updateQueue).toHaveBeenCalledWith([sourceNode])
    })

    it('should step the circuit', () => {
      jest.spyOn(circuit, 'next')
      circuit.addConnection(sourceNode, targetNode, 0)

      expect(circuit.next).toHaveBeenCalledTimes(1)
    })
  })
})
