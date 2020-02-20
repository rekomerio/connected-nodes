class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.alpha = 0;
        this.minVelocity = 0.25;
        this.maxVelocity = 10;
        this.connections = [];
        this.randomizeVelocity();
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;

        if (Math.abs(this.vx) > this.minVelocity) this.vx *= 0.99;
        if (Math.abs(this.vy) > this.minVelocity) this.vy *= 0.99;

        if (Math.abs(this.vx) < this.minVelocity) this.vx *= 1.01;
        if (Math.abs(this.vy) < this.minVelocity) this.vy *= 1.01;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    randomizeVelocity() {
        this.vx = 1 - Math.random() * 2;
        this.vy = 1 - Math.random() * 2;
    }

    setVelocity(vx, vy) {
        this.vx = Math.abs(vx) < this.maxVelocity ? vx : this.vx;
        this.vy = Math.abs(vy) < this.maxVelocity ? vy : this.vy;
    }

    clearConnections() {
        this.connections = [];
    }

    distanceTo(x, y) {
        const x2 = Math.pow(Math.abs(this.x - x), 2);
        const y2 = Math.pow(Math.abs(this.y - y), 2);
        return Math.sqrt(x2 + y2);
    }
}

class Canvas {
    constructor(el) {
        this.context = el.getContext("2d");

        el.addEventListener("mousemove", e => {
            const maxDistance = 100;

            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.nodes.forEach(node => {
                const distance = node.distanceTo(x, y);

                if (distance < maxDistance) {
                    const distanceX = node.x - x;
                    const distanceY = node.y - y;
                    const { i, j } = getUnitVector(distanceX, distanceY);
                    const len = getVectorLength(distanceX, distanceY);
                    const scale = (1 / len) * 10;
                    node.setVelocity(node.vx + i * scale, node.vy + j * scale);
                }
            });
        });

        el.addEventListener("click", () => {
            this.drawCoordinates = !this.drawCoordinates;
        });

        this.width = el.width;
        this.height = el.height;
        this.nodes = [];
        this.isRunning = false;

        this.frameRate = 60;
        this.vectorLength = 200;
        this.showFps = false;
        this.drawCoordinates = false;
        this.nodeSize = 2;
        this.vectorThickness = 0.2;
        this.textColor = "#fff";
    }

    addNodes(num) {
        for (let i = 0; i < num; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            this.nodes.push(new Node(x, y));
        }
    }

    removeNodes(num) {
        let numRemoved = 0;
        while (numRemoved < num && this.nodes.length) {
            this.nodes.pop();
            ++numRemoved;
        }
    }

    begin() {
        this.renderLoop = setInterval(() => {
            this.render();
        }, 1000 / this.frameRate);

        this.updateLoop = setInterval(() => {
            this.update();
        }, 10);

        this.isRunning = true;
    }

    stop() {
        clearInterval(this.renderLoop);
        clearInterval(this.updateLoop);
        this.isRunning = false;
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    render() {
        this.clear();

        this.nodes.forEach(node => {
            this.drawVectorsFromNode(node);
            this.drawNode(node);
        });

        this.nodes.forEach(node => {
            node.clearConnections();
        });

        if (this.showFps) {
            this.debugFps();
        }
    }

    update() {
        this.nodes.forEach(node => {
            node.move();

            if (node.x < 0 || node.x > this.width || node.y < 0 || node.y > this.height) {
                node.alpha -= 0.02;
            } else if (node.alpha < 1) {
                node.alpha += 0.01;
            }

            if (node.alpha <= 0) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                node.moveTo(x, y);
                node.randomizeVelocity();
                node.alpha = 0.01;
            }
        });
    }

    debugFps() {
        const frameRate = Math.floor(1000 / (Date.now() - this.previous));
        this.context.font = "30px Arial";
        this.context.fillStyle = this.textColor;
        this.context.fillText("FPS: " + frameRate, 10, 50);
        this.previous = Date.now();
    }

    drawNode(node) {
        this.context.beginPath();
        this.context.arc(node.x, node.y, this.nodeSize, 0, 2 * Math.PI, false);
        this.context.fillStyle = `rgba(100, 10, 255, ${node.alpha})`;
        this.context.fill();

        if (this.drawCoordinates) {
            this.context.font = "10px Arial";
            this.context.fillStyle = this.textColor;
            this.context.fillText("X: " + node.x.toFixed(2), node.x + 10, node.y);
            this.context.fillText("Y: " + node.y.toFixed(2), node.x + 10, node.y + 10);
        }
    }

    drawVectorsFromNode(node) {
        const nodesInRange = this.nodes.filter(
            iNode => node.distanceTo(iNode.x, iNode.y) < this.vectorLength
        );

        nodesInRange.forEach(iNode => {
            // Check has the other node already rendered the vector. This will almost double the framerate!
            if (iNode.connections.includes(node)) {
                return;
            }

            let alpha = node.alpha > iNode.alpha ? iNode.alpha : node.alpha;
            /* Vector distance fading start */
            const fadeStart = this.vectorLength - this.vectorLength / 3;
            const distance = node.distanceTo(iNode.x, iNode.y);

            if (distance > fadeStart) {
                const fade = (fadeStart - (distance - this.vectorLength / 3)) / fadeStart;
                alpha *= fade;
            }
            /* Vector distance fading end */
            this.context.beginPath();
            this.context.lineWidth = this.vectorThickness;
            this.context.strokeStyle = `rgba(0, 100, 255, ${alpha}`;
            this.context.moveTo(node.x, node.y);
            this.context.lineTo(iNode.x, iNode.y);
            this.context.stroke();
            node.connections.push(iNode);
        });
    }
}

const getUnitVector = (i, j) => {
    const vectorLength = getVectorLength(i, j);
    return { i: i / vectorLength, j: j / vectorLength };
};

const getVectorLength = (i, j) => {
    return Math.sqrt(i ** 2 + j ** 2);
};
