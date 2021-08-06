import React, {useState, useRef} from 'react'
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import klay from 'cytoscape-klay';
import './App.css'
import { Button, ButtonGroup} from "@chakra-ui/react"
import { AddIcon, CloseIcon, MinusIcon} from "@chakra-ui/icons"

cytoscape.use( klay );

function App() {
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
        'selector':':child',
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
      },
      {
        'selector':'.rehighlighted',
        'style': {
          'background-color': 'red',
          'line-color': 'red',
          'target-arrow-color': 'red',
          'transition-property': 'background-color, line-color, target-arrow-color',
          'transition-duration': '0.5s'
        }
      }
  ]
  //location for node to be inserted
  //with layouts, shouldn't be necessary but just in case
  const height = window.innerHeight/2;
  const width = window.innerWidth;
  const xCenter = width/2;
  const yCenter = height/2;

  let myCyRef = null;

  //Used for input value form
  const [inputValue, setInputValue] = useState(1)


  const onSubmitAddNodeInput = function() {
    if(myCyRef.elements(':selectednode:orphan').length===0){
      //node name
      const newNode = `Input ${myCyRef.elements(':orphan').length + 1}`;
      //add node to graph
      myCyRef.add({data: {id: newNode, 
                          label: newNode, 'value': inputValue}, 
                  'classes': OP.Input, 
                  position: {x:xCenter, y:yCenter}});
      //add value to graph as child node
      myCyRef.add({data:{id:`${newNode} Value`, 
                         label:`Value: ${inputValue}`,
                         parent:newNode}, 
                   position: {x:xCenter, y:yCenter}})

      myCyRef.layout({name:'klay'}).run();
    }
  }

  const onClickAddNodeOp = function(nodeType) {
    //Should only add operation node if 2 nodes are selected
    if (myCyRef.elements(':selectednode:orphan').length === 2){
      //label 
      const newNode = `${nodeType.op} ${myCyRef.elements(':orphan').length + 1}`;
      //Add node to graph
      myCyRef.add({data: {id: newNode, label: newNode, color: nodeType.color}, 
                  'classes': nodeType.op, 
                  position: {x:xCenter + 300, y:yCenter + 200}});
      //Add edges to graph
      myCyRef.elements(':selectednode:orphan').forEach(
        node => myCyRef.add({ data: { source: node.data('id'), 
                                      target:newNode , 
                                      label: `Edge {this.data('id')} to {node}`}
                                    }))

      myCyRef.layout({name:'klay'}).run(); 
    }
    //for some god awful reason cytoscape.js only runs the layout if I run it twice
    myCyRef.layout({name:'klay'}).run();
  }

  function cySetUp() {
    myCyRef.selectionType('additive'); 
    myCyRef.center();
    onRightClickNode();
  }

  //listeners
  //Add edge on right click. Shouldn't be used by user, but exists just in case
  function onRightClickNode(){
    myCyRef.on('cxttap', "node", function(event){
      myCyRef.elements(':selectednode').forEach(
        node => myCyRef.add({ data: { source: this.data('id'), 
                                      target: node.data('id'), 
                                      label: `Edge {this.data('id')} to {node}`}
                                    }))
    })
  }

  //forward and backward pass here
  //Ignore my god awful, no good, horrific, messy, eye acid-ing code plz

  function dfsTopSort() {
    let adjacencyList = {};
    const vertices = [];
    myCyRef.elements(':orphan').forEach(function(node, index){
      if(!(node.data('id').includes('Input'))){
        vertices.push(node.data('id'));
        adjacencyList[node.data('id')] = new Set();
      }
    });
    console.log(adjacencyList);
    myCyRef.elements('edge').forEach(function(edge, index){
      if(!(edge.data('source').includes('Input'))){
        console.log(edge);
        if(adjacencyList[edge.data('source')]){
          adjacencyList[edge.data('source')].add(edge.data('target'));
        }
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
      inputIds.forEach(
        nodeId => inputValues.push(myCyRef.getElementById(nodeId).data('value')
                                                                            ));
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
  
    let i = 0;
    //I have to split it up like this for cytoscape.js animation to work
    //Otherwise it does this weird thing where it asyncs the graph updates
    const highlight  = function(){
      if (i < doHighlight.length){
        const element = doHighlight[i];
        i++;
        element.addClass('highlighted');
        if (element.isNode()){
          const nodeId = element.data('id');
          const value = element.data('value');
          let position = element.position();
          myCyRef.add({data:{id:`${nodeId} Value`, 
                             label:`Value: ${value}`,
                             parent:nodeId}});
          myCyRef.getElementById(`${nodeId} Value`).position(position); 
        }
        setTimeout(highlight, 1000);
      }
      myCyRef.layout({name:'klay'}).run();
    }
    highlight();
  }

  function backProp(){
    let doHighlight = [];

    myCyRef.elements(':orphan').forEach(function(node, index) {
                                            node.data('gradient', 0);
    })

    function backwards(node, input1, input2){
      const nodeId = node.data('id')
      const grad = node.data('gradient');
      const val1 = input1.data('value');
      const val2 = input2.data('value');
      console.log("backwards");
      console.log(grad)
      console.log(val1)
      console.log(val2)
      console.log(nodeId);
      console.log("backwards");

      if (nodeId.includes("Add")){
        console.log('hi!')
        console.log(grad);
        return([grad, grad]);
      }
      if (nodeId.includes("Mul")){
        return([grad * val1, grad * val2]);
      }
      if (nodeId.includes("Sub")){
        return([grad, -grad]);
      }
      if (nodeId.includes("Div")){
        return([grad/val2, grad * val1/(val2**2)]);
      }
    }
    
    const ordering = dfsTopSort().reverse();

    myCyRef.getElementById(ordering[0]).data('gradient', 1)

    for (const nodeId of ordering){
      if (nodeId.includes("Input")){
        continue;
      }
      const node = myCyRef.getElementById(nodeId);
      const inputEdges = myCyRef.elements(`[target="${nodeId}"]`);
      let inputNodes = [];
      inputEdges.forEach(edge => {
                        inputNodes.push(
                          myCyRef.getElementById(edge.data('source')));
                        });
      var [val1, val2] = backwards(node, inputNodes[0], inputNodes[1]);
      console.log(val1);
      console.log(val2);
      console.log("values")
      inputNodes[0].data('gradient', inputNodes[0].data('gradient') + val1);
      inputNodes[1].data('gradient', inputNodes[1].data('gradient') + val2);
      doHighlight.push(inputEdges[0]);
      doHighlight.push({'node' : inputNodes[0], 
                        'gradient' : inputNodes[0].data('gradient')});
      doHighlight.push(inputEdges[1]);
      doHighlight.push({'node' : inputNodes[1], 
                        'gradient' : inputNodes[1].data('gradient')});

    }
    console.log(doHighlight);
    let i = 0;

    const highlight  = function(){
      if (i < doHighlight.length){
        const element = doHighlight[i];
        i++;
        if (!(element.gradient)){
          console.log(element);
          console.log('lastest');
          element.addClass('rehighlighted');
        } else {
          element.node.addClass('rehighlighted');
          const nodeId = element.node.data('id');
          const gradient = element.gradient;
          let position = element.node.position();
          element.node.children().forEach(function(node, index){
            if (node.data('id').includes("Gradient")){
              node.remove();
            }
          })
          myCyRef.add({data:{id:`${nodeId} Gradient`, 
                             label:`Gradient: ${gradient}`,
                             parent:nodeId}});
          myCyRef.getElementById(`${nodeId} Gradient`).position(position); 
        }
        setTimeout(highlight, 1000);
      }
    myCyRef.layout({name:'klay'}).run();
    }
    highlight();
  } 
  
  const layout = { name: 'klay'};
  return (
    <div className = 'container'>
      <CytoscapeComponent
        elements={elements}
        className = 'Main-content'
        cy = {(cy) => {myCyRef = cy; cySetUp()}}
        stylesheet={stylesheet}
        layout={layout}
      />
      
      <input
        type="number"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
      />
      <Button variant = "outline" 
              onClick={onSubmitAddNodeInput}>
        <AddIcon/>
      </Button>

      <Button variant = "outline" 
              onClick={() => onClickAddNodeOp(OP.Add)}>
        <AddIcon/>
      </Button>

      <Button variant = "outline" 
              onClick={() => onClickAddNodeOp(OP.Sub)}>
        <MinusIcon/>
      </Button>

      <Button variant = "outline" 
              onClick={() => onClickAddNodeOp(OP.Mul)}>
        <CloseIcon/>
      </Button>

      <Button variant = "outline" 
              onClick={() => onClickAddNodeOp(OP.Div)}>
        Divide node
      </Button>

      <Button variant = "outline" 
              onClick = {forwardProp}>
        Forward Prop!
      </Button>

      <Button variant = "outline" 
              onClick = {backProp}>
        Backwards Prop!
      </Button>

      
      {/* for debugging purposes only
      <Button variant = "outline"
              onClick = {() => console.log(myCyRef.elements())}>
        Show elements
      </Button>

      <Button variant = "outline" 
              onClick = {dfsTopSort}>
        Top Sort!
      </Button>
      */}
    </div>
  );
}

export default App;
