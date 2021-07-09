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
          'mid-target-arrow-color': '#666',
          'mid-target-arrow-shape': 'triangle',
          'target-arrow-color': '#666',
          'target-arrow-shape': 'triangle'
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
      },
      {
        'value':':child',
        'style': {
          'text-valign':  "center"
        }
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
        'selector':'.highlighted',
        'style': {
          'background-color': '#61bffc',
          'line-color': '#61bffc',
          'target-arrow-color': '#61bffc',
          'transition-property': 'background-color, line-color, target-arrow-color',
          'transition-duration': '0.5s'
        }
      }
  ]
  const xCenter = width/2;
  const yCenter = height/2;
  let myCyRef = null;
  const [inputValue, setInputValue] = useState(0)


  const onSubmitAddNodeInput = function() {
    if(myCyRef.elements(':selectednode:orphan').length===0){
      const newNode = `Input ${myCyRef.elements(':orphan').length + 1}`;
      myCyRef.add({data: {id: newNode, label: newNode, 'value': inputValue}, 'classes': OP.Input, position: {x:xCenter, y:yCenter}});
      myCyRef.add({data:{id:`${newNode} Value`, label:`Value: ${inputValue}`,parent:newNode}, position: {x:xCenter, y:yCenter}})
    }
  }

  const onClickAddNodeOp = function(nodeType) {
    if (myCyRef.elements(':selectednode:orphan').length === 2){
      const newNode = `${nodeType.op} ${myCyRef.elements(':orphan').length + 1}`;
      myCyRef.add({data: {id: newNode, label: newNode, color: nodeType.color}, 'classes': nodeType.op, position: {x:xCenter + 300, y:yCenter + 200}});
      myCyRef.elements(':selectednode:orphan').forEach(node => myCyRef.add({ data: { source: node.data('id'), target:newNode , label: `Edge {this.data('id')} to {node}`}}))
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

  //forward and backward pass here

  function dfsTopSort() {
    let adjacencyList = {};
    const vertices = [];
    myCyRef.elements(':childless:orphan').forEach(function(node, index){
      vertices.push(node.data('id'));
      adjacencyList[node.data('id')] = new Set();
    });
    myCyRef.elements('edge').forEach(function(edge, index){
      if(!(edge.data('source').includes('Input'))){
        adjacencyList[edge.data('source')].add(edge.data('target'));
      }
    }); 
    
    let visited = {};
    let s = [];

    function dfsTopSortHelper(v, visited, s) {
      visited[v] = true;
      adjacencyList[v].forEach(function(node, index){
        if(!visited[node]) {
          dfsTopSortHelper(node, visited, s);
        }
      });
      s.push(v);
    }
    vertices.forEach(function(node, index){
      if(!visited[node]){
        dfsTopSortHelper(node, visited, s);
      }
    })

    const reversed = s.reverse();
    return(reversed)
  }

  function setValue(nodeId, value){
    const node = myCyRef.getElementById(nodeId);
    node.data('value', value)
    const position = node.position();
    myCyRef.getElementById(`${nodeId} Value`).position(position);
  }

  function forwardProp(){
    function doOp(nodeId, doHighlight){
      const inputIds = [];
      const inputEdges = myCyRef.elements(`[target="${nodeId}"]`);
      inputEdges.forEach(edge => {
                        inputIds.push(edge.data('source'));
                        });
      doHighlight.push(inputEdges);
      const inputValues = [];
      inputIds.forEach(nodeId => inputValues.push(myCyRef.getElementById(nodeId).data('value')));
      let value = null;
      if (nodeId.includes("Add")){
        value = inputValues[0] + inputValues[1];
      }
      if (nodeId.includes("Mul")){
        value = inputValues[0] * inputValues[1];
      }
      if (nodeId.includes("Sub")){
        value = inputValues[0] - inputValues[1];
      }
      if (nodeId.includes("Div")){
        value = inputValues[0]/inputValues[1];
      }
      setValue(nodeId, value)
      doHighlight.push(myCyRef.getElementById(nodeId));
    }
    const ordering = dfsTopSort();

    console.log(ordering);

    let doHighlight = [];

    for (const element of ordering){
      doOp(element, doHighlight)
    }
/*
    const apply = function(element, myCyRef){
      element.addClass('highlighted');
      if (element.isNode()){
        const nodeId = element.data('id');
        const value = element.data('value');
        let position = element.position();
        myCyRef.add({data:{id:`${nodeId} Value`, label:`Value: ${value}`,parent:nodeId}});
        myCyRef.getElementById(`${nodeId} Value`).position(position); 
      }
    }
*/
    let i = 0;
      
    const highlight  = function(){
      if (i < doHighlight.length){
        const element = doHighlight[i];
        i++;
        console.log(element);
          element.addClass('highlighted');
          if (element.isNode()){
            const nodeId = element.data('id');
            const value = element.data('value');
            let position = element.position();
            myCyRef.add({data:{id:`${nodeId} Value`, label:`Value: ${value}`,parent:nodeId}});
            myCyRef.getElementById(`${nodeId} Value`).position(position); 
          }
          setTimeout(highlight, 1000);
      }
    }
    highlight();
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
      <button onClick = {() => console.log(myCyRef.elements())}>Show elements</button>
      <button onClick = {dfsTopSort}>Top Sort!</button>
      <button onClick = {forwardProp}>Forward Prop!</button>
    </div>
  );
}

export default App;
