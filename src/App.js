import React, {useState, useRef} from 'react'
import CytoscapeComponent from 'react-cytoscapejs';

function App() {
  const height = window.innerHeight/2;
  const width = window.innerWidth;
  const elements = [];
  const OP = {
    Add:{color:"blue", op:"Add"},
    Mul: {color:"green", op:"Mul"},
    Div:{color:"yellow", op:"Div"},
    Sub:{color:"red", op:"Sub"},
    Input:{color:"gray", op:"Input"}
  }
  const stylesheet = [
      {
        selector: 'node',
        style: {
          //'background-color': '#666',
          'label': 'data(label)' // here you can label the nodes 
        }
      },
      {
        'selector': 'edge',
        'style': {
          'width': 3,
          'line-color': '#666',
          'target-arrow-color': '#666',
          'target-arrow-shape': 'triangle' 
        },
      },
      {
        'selector':':selected',
        'style': {
          'background-color': 'SteelBlue',
          'line-color': 'SteelBlue',
          'target-arrow-color': 'black',
          'source-arrow-color': 'black'
        }
      },
      {
        'selector': '.Add',
        'style': {
          'background-color': OP.Add.color
        },
      },
      {
        'selector': '.Mul',
        'style': {
          'background-color': OP.Mul.color    
        }
      },
      {
        'selector': '.Div',
        'style': {
          'background-color': OP.Div.color
        }
      },
      {
        'selector': '.Sub',
        'style': {
          'background-color': OP.Sub.color
        }
      },
      {
        'selector': '.Input',
        'style': {
          'background-color': OP.Input.color
        }
      }
  ]
  const xCenter = width/2;
  const yCenter = height/2;
  let myCyRef = null;
  const [inputValue, setInputValue] = useState(0)

  const onSubmitAddNodeInput = function() {
    if(myCyRef.elements(':selectednode').length===0){
      const newNode = `Input ${myCyRef.nodes().length + 1}`;
      myCyRef.add({data: {id: newNode, label: newNode}, 'classes': OP.Input, position: {x:xCenter, y:yCenter}});
      myCyRef.add({data:{id:`${newNode} Value`, label:`Value: ${inputValue}`,parent:newNode}, position: {x:xCenter, y:yCenter}})
    }
  }

  const onClickAddNodeOp = function(nodeType) {
    if (myCyRef.elements(':selectednode').length === 2){
      const newNode = `${nodeType.op} ${myCyRef.nodes().length + 1}`;
      myCyRef.add({data: {id: newNode, label: newNode, color: nodeType.color}, 'classes': nodeType.op, position: {x:xCenter + 300, y:yCenter + 200}});
      myCyRef.elements(':selectednode').forEach(node => myCyRef.add({ data: { source: node.data('id'), target:newNode , label: `Edge {this.data('id')} to {node}`}}))
      console.log(nodeType.op)
    }
  }

  function cySetUp() {
    myCyRef.selectionType('additive'); 
    myCyRef.center();
    onRightClickNode();
  }

  //listeners
  function onRightClickNode(){
    myCyRef.on('cxttap', "node", function(event){
      myCyRef.elements(':selectednode').forEach(node => myCyRef.add({ data: { source: this.data('id'), target: node.data('id'), label: `Edge {this.data('id')} to {node}`}}))
    })
  }
  
  return (
    <div>
      <CytoscapeComponent
        elements={elements}
        style={{width:width, height:height}}
        cy = {(cy) => {myCyRef = cy; cySetUp()}}
        stylesheet={stylesheet}
      />
      <input
        type="number"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
      />
      <button onClick={onSubmitAddNodeInput}>Add Input</button>
      <button onClick={() => onClickAddNodeOp(OP.Add)}>Add node</button>
      <button onClick={() => onClickAddNodeOp(OP.Sub)}>Subtract node</button>
      <button onClick={() => onClickAddNodeOp(OP.Mul)}>Multiply node</button>
      <button onClick={() => onClickAddNodeOp(OP.Div)}>Divide node</button>
    </div>
  );
}

export default App;
