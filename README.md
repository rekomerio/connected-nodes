# Connected nodes

Animated nodes on html canvas creating connections to each others while moving.

## Public members

```
    width: 1920,
    height: 800,
    numNodes: 50,
    vectorLength: 200,
    frameRate: 60,
    showFps: false,
    nodeSize: 2,
    vectorThickness: 0.1,
    textColor: "#fff"
```

## Example component for using with React

See in action in my portfolio:
[https://rekomerio-portfolio.web.app](https://rekomerio-portfolio.web.app)

```
import React, { useRef, useEffect } from "react";
import Canvas from "../utils/Canvas";

const Nodes = props => {
    const canvas = useRef(null);
    const el = useRef(null);

    useEffect(() => {
        canvas.current = new Canvas(el.current);
        canvas.current.addNodes(props.numNodes);
        canvas.current.frameRate = props.frameRate;
        canvas.current.begin();

        return () => canvas.current.stop();
    }, []);

    useEffect(() => {
        const {
            showFps,
            nodeSize,
            vectorLength,
            vectorThickness,
            textColor,
            frameRate,
            width,
            height
        } = props;
        canvas.current.showFps = showFps;
        canvas.current.nodeSize = nodeSize;
        canvas.current.vectorLength = vectorLength;
        canvas.current.vectorThickness = vectorThickness;
        canvas.current.textColor = textColor;
        canvas.current.frameRate = frameRate;
        canvas.current.width = width;
        canvas.current.height = height;
    }, [props]);

    useEffect(() => {
        const existingNodes = canvas.current.nodes.length;
        const { numNodes } = props;

        if (numNodes < existingNodes) {
            canvas.current.removeNodes(existingNodes - numNodes);
        }

        if (numNodes > existingNodes) {
            canvas.current.addNodes(numNodes - existingNodes);
        }
    }, [props.numNodes]);

    return (
        <canvas
            ref={el}
            className={props.className}
            style={props.style}
            width={props.width}
            height={props.height}
        />
    );
};

Nodes.defaultProps = {
    width: 1920,
    height: 800,
    numNodes: 50,
    vectorLength: 200,
    frameRate: 60,
    showFps: false,
    nodeSize: 2,
    vectorThickness: 0.1,
    textColor: "#fff",
    style: null,
    className: null
};

export default Nodes;
```
