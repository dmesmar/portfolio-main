import { Layout } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button } from 'reactstrap';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';

function CanvasRecognition() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(10); // Añadí control de tamaño también

  // Idioma actual
  const langCode = getCurrentLanguage();
  const langMap = { en, es, ca };
  const lang = langMap[langCode];

  useEffect(() => {
    initCanvas();
  }, []);

  // Inicializa el canvas con un fondo blanco
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Actualizar estilo del pincel
  const updateBrushStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round'; // Añadido para mejorar las esquinas
    ctx.strokeStyle = brushColor;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    // Aplicar estilo de pincel
    updateBrushStyle(ctx);
    
    // Comenzar un nuevo path cada vez que empezamos a dibujar
    ctx.beginPath();
    
    // Obtener la posición inicial
    const position = getPointerPosition(e, canvas);
    if (position) {
      ctx.moveTo(position.x, position.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Siempre actualizar el estilo antes de dibujar
    updateBrushStyle(ctx);

    // Obtener la posición actual
    const position = getPointerPosition(e, canvas);
    if (position) {
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
      // Iniciar nuevo punto para evitar problemas con la función lineTo
      ctx.beginPath();
      ctx.moveTo(position.x, position.y);
    }
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.stroke();
    ctx.beginPath(); // Comenzar un nuevo path al terminar
    setIsDrawing(false);
  };

  // Función auxiliar para obtener la posición del puntero
  const getPointerPosition = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } | null => {
    const rect = canvas.getBoundingClientRect();
    
    // Evento de mouse
    if ('nativeEvent' in e && 'offsetX' in e.nativeEvent) {
      return {
        x: (e as React.MouseEvent).nativeEvent.offsetX,
        y: (e as React.MouseEvent).nativeEvent.offsetY
      };
    }
    // Evento táctil
    else if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return null;
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setPrediction(null);
    setErrorMessage(null);
  };

  const handlePredict = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dataURL = canvas.toDataURL('image/png');

      const response = await fetch('https://digitscnn-production.up.railway.app/add-sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'x-api-key': 'TU_API_KEY',
        },
        body: JSON.stringify({ image_base64: dataURL }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
      
      const result = await response.json();
      setPrediction(result.prediction);
      setErrorMessage(null);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMessage(errorMsg);
      setPrediction(null);
    }
  };

  // Colores predefinidos para elegir rápidamente
  const predefinedColors = ['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF'];

  return (
    <Layout wrapperClass="main-aboutpage" title="Canvas Recognition">
      <section className="contact-area">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8" data-aos="zoom-in">
              <div className="shadow-box" style={{ padding: '25px' }}>
                <h1
                  className="text-center mb-4"
                  dangerouslySetInnerHTML={{
                    __html: 'Reconocimiento de Dígitos',
                  }}
                ></h1>
                
                <p className="text-center mb-4">
                  Dibuja un número del 0 al 9 y pulsa "Predecir" para ver el resultado.
                </p>

                <div className="canvas-container d-flex justify-content-center">
                  <canvas
                    ref={canvasRef}
                    width={350}
                    height={350}
                    style={{ 
                      border: '2px solid #000', 
                      cursor: 'crosshair',
                      touchAction: 'none',
                      backgroundColor: '#fff',
                      borderRadius: '4px'
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>

                {/* Control de herramientas de dibujo */}
                <div className="d-flex align-items-center justify-content-center mt-4 flex-wrap">
                  {/* Selector de color personalizado */}
                  <div className="me-4 mb-2">
                    <label htmlFor="colorPicker" className="me-2">Color:</label>
                    <input 
                      type="color" 
                      id="colorPicker"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      style={{ 
                        width: '40px', 
                        height: '40px',
                        padding: '0',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  
                  {/* Paleta de colores predefinidos */}
                  <div className="me-4 mb-2">
                    <div className="d-flex">
                      {predefinedColors.map((color, index) => (
                        <div 
                          key={index}
                          onClick={() => setBrushColor(color)}
                          style={{
                            backgroundColor: color,
                            width: '25px',
                            height: '25px',
                            margin: '0 3px',
                            border: brushColor === color ? '2px solid #666' : '1px solid #ccc',
                            cursor: 'pointer',
                            borderRadius: '3px'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Control de tamaño */}
                  <div className="mb-2">
                    <label htmlFor="brushSize" className="me-2">Tamaño:</label>
                    <input 
                      type="range" 
                      id="brushSize"
                      min={5}
                      max={30}
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>

                <div className="buttons-group d-flex justify-content-center mt-4">
                  <Button
                    className="theme-btn submit-btn me-2"
                    onClick={handlePredict}
                  >
                    Predecir
                  </Button>
                  <Button className="theme-btn" onClick={handleClearCanvas}>
                    Limpiar
                  </Button>
                </div>

                {/* Mostrar resultado o error */}
                {prediction && (
                  <Alert color="success" className="mt-3 text-center">
                    Predicción: <strong>{prediction}</strong>
                  </Alert>
                )}
                {errorMessage && (
                  <Alert color="danger" className="mt-3 text-center">
                    {errorMessage}
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default CanvasRecognition;