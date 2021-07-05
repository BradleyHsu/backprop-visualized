import React, {useState} from 'react'
import ReactDOM from 'react-dom';
import Cytoscape from 'cytoscape'

function Graph() {
    const container = ReactDOM.findDOMNode(this);
    const id = "myCy";
    const className = "graph";
    const [height, setHeight] = useState(window.innerHeight/2);
    const [width, setWidth] = useState(window.innerWidth);
    const [elements, setElements] = useState([
        { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
        { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 }},
        { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2'}}
        ])
    const style = {
        width: width,
        height: height
    }
    let cy = new Cytoscape({
        container: document.getElementById('cy'),
        elements: [elements],
          style: [
              {
                  selector: 'node',
                  style: {style
                  }
              }]      
      });
    return(
        React.createElement('div', {
            id, className, style
        })
    )
}

export default Graph