class NeuralNetwork {
    constructor() {
        this.layers = [];
        this.connections = [];
        this.networkType = 'feedforward';
    }

    setNetworkType(type) {
        this.networkType = type;
        this.updateConnections();
        this.drawNetwork();
    }

    addLayer(neurons) {
        this.layers.push({
            neurons: neurons,
            outputs: new Array(neurons).fill(0)
        });
        this.updateConnections();
        this.drawNetwork();
    }

    updateConnections() {
        this.connections = [];
        
        switch(this.networkType) {
            case 'rbf':
                // RBF networks have full connectivity between input-hidden and hidden-output
                const hiddenLayers = this.layers.slice(1, -1);
                const inputLayer = this.layers[0];
                const outputLayer = this.layers[this.layers.length - 1];
                
                // Connect input to all hidden layers
                hiddenLayers.forEach((hiddenLayer, hiddenIndex) => {
                    for(let i = 0; i < inputLayer.neurons; i++) {
                        for(let j = 0; j < hiddenLayer.neurons; j++) {
                            this.connections.push({
                                from: { layer: 0, neuron: i },
                                to: { layer: hiddenIndex + 1, neuron: j },
                                weight: Math.random() * 2 - 1
                            });
                        }
                    }
                });
                
                // Connect all hidden layers to output
                hiddenLayers.forEach((hiddenLayer, hiddenIndex) => {
                    for(let i = 0; i < hiddenLayer.neurons; i++) {
                        for(let j = 0; j < outputLayer.neurons; j++) {
                            this.connections.push({
                                from: { layer: hiddenIndex + 1, neuron: i },
                                to: { layer: this.layers.length - 1, neuron: j },
                                weight: Math.random() * 2 - 1
                            });
                        }
                    }
                });
                break;

            case 'cascade':
                // Cascade-forward networks connect each layer to all subsequent layers
                for(let i = 0; i < this.layers.length; i++) {
                    for(let j = i + 1; j < this.layers.length; j++) {
                        const currentLayer = this.layers[i];
                        const nextLayer = this.layers[j];
                        
                        for(let k = 0; k < currentLayer.neurons; k++) {
                            for(let l = 0; l < nextLayer.neurons; l++) {
                                this.connections.push({
                                    from: { layer: i, neuron: k },
                                    to: { layer: j, neuron: l },
                                    weight: Math.random() * 2 - 1
                                });
                            }
                        }
                    }
                }
                break;

            default: // feedforward
                // Standard feedforward (default) connection pattern
                for(let i = 0; i < this.layers.length - 1; i++) {
                    const currentLayer = this.layers[i];
                    const nextLayer = this.layers[i + 1];
                    
                    for(let j = 0; j < currentLayer.neurons; j++) {
                        for(let k = 0; k < nextLayer.neurons; k++) {
                            this.connections.push({
                                from: { layer: i, neuron: j },
                                to: { layer: i + 1, neuron: k },
                                weight: Math.random() * 2 - 1
                            });
                        }
                    }
                }
        }
    }

    drawNetwork() {
        const canvas = document.getElementById('networkCanvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections
        this.connections.forEach(conn => {
            const startLayer = this.layers[conn.from.layer];
            const endLayer = this.layers[conn.to.layer];
            
            const startX = (conn.from.layer + 1) * (canvas.width / (this.layers.length + 1));
            const startY = (conn.from.neuron + 1) * (canvas.height / (startLayer.neurons + 1));
            
            const endX = (conn.to.layer + 1) * (canvas.width / (this.layers.length + 1));
            const endY = (conn.to.neuron + 1) * (canvas.height / (endLayer.neurons + 1));
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(52, 152, 219, ${Math.abs(conn.weight)})`;
            ctx.lineWidth = Math.abs(conn.weight) * 2;
            ctx.stroke();
        });

        // Draw neurons
        this.layers.forEach((layer, layerIndex) => {
            for(let i = 0; i < layer.neurons; i++) {
                const x = (layerIndex + 1) * (canvas.width / (this.layers.length + 1));
                const y = (i + 1) * (canvas.height / (layer.neurons + 1));
                
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.fillStyle = '#e74c3c';
                ctx.fill();
                ctx.strokeStyle = '#c0392b';
                ctx.stroke();
            }
        });
    }
}

const network = new NeuralNetwork();

// Initialize with input and output layers
network.addLayer(3); // Input layer
network.addLayer(4); // Hidden layer
network.addLayer(2); // Output layer

function addLayer() {
    const layerSize = Math.floor(Math.random() * 5) + 2; // Random between 2-6 neurons
    network.addLayer(layerSize);
    updateLayerList();
}

function simulateTraining() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 3;
        if(progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }, 100);
}

function updateLayerList() {
    const layerList = document.getElementById('layer-list');
    layerList.innerHTML = network.layers
        .map((layer, index) => `Layer ${index + 1}: ${layer.neurons} neurons`)
        .join('<br>');
}

// Handle window resize
window.addEventListener('resize', () => {
    network.drawNetwork();
});

// Initial setup
network.drawNetwork();
updateLayerList();
