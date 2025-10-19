import React, { useState, useRef, useEffect } from 'react';
import './PaintSection.css';

function PaintSection() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('draw');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const floodFill = (startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Get the color at the starting pixel
    const startPos = (startY * canvas.width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];
    
    // Convert fill color to RGB
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = fillColor;
    tempCtx.fillRect(0, 0, 1, 1);
    const fillData = tempCtx.getImageData(0, 0, 1, 1).data;
    const fillR = fillData[0];
    const fillG = fillData[1];
    const fillB = fillData[2];
    
    // If the starting color is the same as fill color, return
    if (startR === fillR && startG === fillG && startB === fillB) {
      return;
    }
    
    // Flood fill using stack-based approach
    const stack = [[startX, startY]];
    const visited = new Set();
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
        continue;
      }
      
      const key = `${x},${y}`;
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      
      const pos = (y * canvas.width + x) * 4;
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      const a = data[pos + 3];
      
      // Check if this pixel matches the start color
      if (r === startR && g === startG && b === startB && a === startA) {
        // Fill this pixel
        data[pos] = fillR;
        data[pos + 1] = fillG;
        data[pos + 2] = fillB;
        data[pos + 3] = 255;
        
        // Add neighboring pixels to stack
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const startDrawing = (e) => {
    const pos = getMousePos(e);
    
    // If fill tool is selected, flood fill on click
    if (tool === 'fill') {
      floodFill(Math.floor(pos.x), Math.floor(pos.y), color);
      return;
    }
    
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    const ctx = canvasRef.current.getContext('2d');

    if (tool === 'draw') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'erase') {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = brushSize * 3;
      ctx.lineCap = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };



  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setGeneratedImage('');
    setStatus('');
  };

    const generateImage = async () => {
    setIsProcessing(true);
    setStatus('Sending your drawing to ModelsLab...');
    setGeneratedImage('');

    try {
        const canvas = canvasRef.current;
        const imageBase64 = canvas.toDataURL('image/png');

        const apiResponse = await fetch('http://localhost:3001/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64,
                prompt: prompt || 'realistic, professional, detailed artwork',
                strength: 0.98
            })
        });

        const result = await apiResponse.json();
        console.log('📦 API Response:', result);

        if (result.success && result.output) {
            // Handle both string or array
            let imageData = Array.isArray(result.output) ? result.output[0] : result.output;
            
            console.log('🔍 Image data type:', typeof imageData);
            console.log('🔍 First 100 chars:', imageData.substring(0, 100));

            // Clean up the base64 string
            imageData = imageData.trim();

            // Create proper data URL for display
            let displayUrl;
            if (imageData.startsWith('http')) {
                // It's already a URL
                displayUrl = imageData;
            } else if (imageData.startsWith('data:')) {
                // It already has the data URL prefix
                displayUrl = imageData;
            } else {
                // It's raw base64, add the prefix
                displayUrl = `data:image/png;base64,${imageData}`;
            }

            console.log('✅ Display URL (first 100 chars):', displayUrl.substring(0, 100));

            setGeneratedImage(displayUrl);
            setStatus('✅ Done! Generated image below.');
        } else {
            throw new Error(result.error || 'No image generated');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        setStatus(`Error: ${error.message}`);
    } finally {
        setIsProcessing(false);
    }
};

  const colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];

  return (
    <div className="paint-app">
      <div className="paint-container">
        <div className="paint-header">
          <h1 className="paint-title">CREATIVITY AWAITS</h1>
          <p className="paint-subtitle">Anything that you can think of!</p>
        </div>
        
        <div className="paint-workspace">
          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-left">
              <button
                onClick={() => setTool('draw')}
                className={`tool-btn ${tool === 'draw' ? 'tool-btn-active' : 'tool-btn-default'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Draw
              </button>
              
              <button
                onClick={() => setTool('erase')}
                className={`tool-btn ${tool === 'erase' ? 'tool-btn-active' : 'tool-btn-default'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Erase
              </button>
              
              <button
                onClick={() => setTool('fill')}
                className={`tool-btn ${tool === 'fill' ? 'tool-btn-active' : 'tool-btn-default'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Fill
              </button>
            </div>
            <div className="toolbar-right">
              <button
                onClick={clearCanvas}
                className="tool-btn tool-btn-clear"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
              
              <button
                onClick={generateImage}
                disabled={isProcessing}
                className="tool-btn tool-btn-generate"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {isProcessing ? 'Processing...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div className="color-palette">
            <span className="color-label">Color:</span>
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`color-btn ${color === c ? 'color-btn-active' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-picker"
            />
          </div>

          {/* Brush Size */}
          <div className="brush-size-control">
            <span className="brush-label">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="brush-slider"
            />
            <span className="brush-value">{brushSize}px</span>
          </div>
            <div className="prompt-control">
            <span className="prompt-label">Prompt (optional):</span>
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., oil painting, anime style, photorealistic..."
                className="prompt-input"
            />
            </div>
          {/* Canvas */}
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={900}
              height={500}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="paint-canvas"
            />
          </div>

          {/* Status */}
          {status && (
            <div className="status-box">
              <p className="status-text">{status}</p>
            </div>
          )}

          {/* Generated Image */}
         {generatedImage && (
            <div className="result-box">
                <p className="result-title">Generated Result:</p>
                <a href={generatedImage} target="_blank" rel="noopener noreferrer">
                <img 
                    src={generatedImage} 
                    alt="Generated artwork" 
                    className="result-image"
                />
                </a>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default PaintSection;