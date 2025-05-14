import { Layout } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';

// Interfaz para los elementos del historial
interface PredictionItem {
  id: string;
  image: string; // base64
  prediction: string;
  actual: string | null; // Valor corregido
  isCorrect: boolean | null; // Feedback del usuario
}

function CanvasRecognition() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [listPrediction, setListPrediction] = useState([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(10);

  type PredictionInfo = {
  digit: number;                       // ganador
  prob:  number;                       // prob. ganadora
  distribution: Array<[number, number]>; // [[dígito, prob], …] ordenado
};

const [prediction, setPrediction] = useState<PredictionInfo | null>(null);
  
  // Estados para modales y feedback
  const [predictionModalOpen, setPredictionModalOpen] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState<PredictionItem[]>([]);
  const [currentImageBase64, setCurrentImageBase64] = useState<string | null>(null);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<string | null>(null);

  // Idioma actual
  const langCode = getCurrentLanguage();
  const langMap = { en, es, ca };
  const lang = langMap[langCode];

  useEffect(() => {
    initCanvas();
    
    // Cargar historial de localStorage
    const savedHistory = localStorage.getItem('predictionHistory');
    if (savedHistory) {
      setPredictionHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('predictionHistory', JSON.stringify(predictionHistory));
  }, [predictionHistory]);

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
    ctx.lineJoin = 'round'; 
    ctx.strokeStyle = brushColor;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    updateBrushStyle(ctx);
    ctx.beginPath();
    
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

    updateBrushStyle(ctx);

    const position = getPointerPosition(e, canvas);
    if (position) {
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
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
    ctx.beginPath();
    setIsDrawing(false);
  };

  const getPointerPosition = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } | null => {
    const rect = canvas.getBoundingClientRect();
    
    if ('nativeEvent' in e && 'offsetX' in e.nativeEvent) {
      return {
        x: (e as React.MouseEvent).nativeEvent.offsetX,
        y: (e as React.MouseEvent).nativeEvent.offsetY
      };
    }
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
    setShowCorrection(false);
    setCurrentImageBase64(null);
  };

  const handlePredict = async (): Promise<void> => {
  try {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas no disponible');

    const b64 = canvas.toDataURL('image/png').split(',')[1];

    // -------- llamada al backend (query-param escapado) ---------------
    const url = `https://digitscnn-production.up.railway.app/predict?b64=${encodeURIComponent(b64)}`;
    const response = await fetch(url, { method: 'POST' });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail ?? `HTTP ${response.status}`);
    }
    const probs: Record<string, number> = await response.json();

    const entries: [number, number][] = Object
    .entries(probs)
    .map(([d, p]) => [Number(d), Number(p)] as [number, number])
    .sort((a, b) => b[1] - a[1]);

    const [bestDigit, bestProb] = entries[0];


    setPrediction({
      digit       : bestDigit,
      prob        : bestProb,
      distribution: entries
    });

    setCurrentImageBase64(b64);
    setErrorMessage(null);
    setShowCorrection(false);
    setPredictionModalOpen(true);

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error(msg);
    setErrorMessage(msg);
    setPrediction(null);
  }
};

  // Cerrar modal de predicción
  const closePredictionModal = () => {
    setPredictionModalOpen(false);
    setShowCorrection(false);
  };

  // Función para retroalimentación
  const sendFeedback = (predictedValue: string, isCorrect: boolean) => {
    if (!currentImageBase64) return;
    
    if (isCorrect) {
      // Si es correcto, añadir al historial
      addToHistory(currentImageBase64, predictedValue, predictedValue);
      closePredictionModal();
      handleClearCanvas();
    } else {
      // Si no es correcto, mostrar interfaz para corrección
      setShowCorrection(true);
    }
    
  };

  // Función para corrección
  const sendCorrection = (correctValue: string) => {
    if (!currentImageBase64 || prediction === null) return;
    
    // Añadir al historial con la corrección
    addToHistory(currentImageBase64, prediction.digit.toString(), correctValue);
    closePredictionModal();
    handleClearCanvas();
  };

  // Añadir predicción al historial
  const addToHistory = (imageBase64: string, predictedValue: string, actualValue: string) => {
    const newItem: PredictionItem = {
      id: Date.now().toString(),
      image: imageBase64,
      prediction: predictedValue,
      actual: actualValue,
      isCorrect: predictedValue === actualValue
    };
    
    setPredictionHistory(prev => [newItem, ...prev]);
  };

  // Enviar datos de entrenamiento al servidor
  const sendTrainingData = async () => {
    try {
      setTrainingModalOpen(true);
      setTrainingStatus('Enviando datos de entrenamiento...');
      
      // Filtrar solo los elementos con retroalimentación
      const trainingData = predictionHistory
        .filter(item => item.actual !== null)
        .map(item => ({
          image_base64: item.image,
          actual: item.actual
        }));
      
      if (trainingData.length === 0) {
        setTrainingStatus('No hay datos suficientes para entrenar el modelo.');
        return;
      }
      
      const response = await fetch('https://digitscnn-production.up.railway.app/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'x-api-key': 'TU_API_KEY_SECRETA',
        },
        body: JSON.stringify({ samples: trainingData }),
      });
      
      if (!response.ok) {
        throw new Error('Error al entrenar el modelo');
      }
      
      const result = await response.json();
      setTrainingStatus(`Entrenamiento completado. Estado: ${result.status}`);
      
      // Opcional: limpiar historial después del entrenamiento exitoso
      // setPredictionHistory([]);
      
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setTrainingStatus(`Error: ${errorMsg}`);
    }
  };

  // Colores predefinidos
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

                {/* Mostrar solo mensajes de error en la interfaz principal */}
                {errorMessage && (
                  <Alert color="danger" className="mt-3 text-center">
                    {errorMessage}
                  </Alert>
                )}

                {/* Historial de predicciones */}
                {predictionHistory.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-center mb-3">Historial de Predicciones</h4>
                    <div className="table-responsive">
                      <Table bordered hover>
                        <thead>
                          <tr>
                            <th>Imagen</th>
                            <th>Predicción</th>
                            <th>Real</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predictionHistory.slice(0, 5).map((item) => (
                            <tr key={item.id}>
                              <td style={{ width: '100px' }}>
                                <img 
                                  src={item.image} 
                                  alt="Digit" 
                                  style={{ width: '50px', height: '50px' }} 
                                />
                              </td>
                              <td>{item.prediction}</td>
                              <td>{item.actual}</td>
                              <td>
                                {item.isCorrect ? (
                                  <span className="text-success">✓</span>
                                ) : (
                                  <span className="text-danger">✗</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    
                    {/* Botón para entrenar */}
                    <div className="text-center mt-3">
                      <p className="text-muted mb-2">
                        Has contribuido con {predictionHistory.length} imágenes
                      </p>
                      <Button 
                        color="primary"
                        onClick={sendTrainingData}
                        disabled={predictionHistory.filter(i => i.actual !== null).length === 0}
                      >
                        Entrenar Modelo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Modal de predicción y retroalimentación */}
      <Modal isOpen={predictionModalOpen} toggle={closePredictionModal}>
  <ModalHeader toggle={closePredictionModal}>
    Resultado de la Predicción
  </ModalHeader>

  <ModalBody>
    {prediction && (
      <div className="text-center">

        {/* Imagen */}
        {currentImageBase64 && (
          <div className="mb-3">
            <img
              src={`data:image/png;base64,${currentImageBase64}`}
              alt="Digit"
              style={{ width: 150, height: 150, objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Dígito ganador */}
        <h4>
          Predicción:&nbsp;
          <strong>{prediction.digit}</strong>
          &nbsp;({(prediction.prob * 100).toFixed(1)}%)
        </h4>

        {/* Lista de probabilidades */}
        <ul className="list-group mt-3">
          {prediction.distribution.map(([d, p]) => (
            <li
              key={d}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {d}
              <span className="badge bg-primary rounded-pill">
                {(p * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>

        {/* Retroalimentación */}
        <div className="mt-4">
          <p>¿Es correcto el resultado?</p>
          <Button
            color="success"
            className="me-2"
            onClick={() => sendFeedback(prediction.digit.toString(), true)}
          >
            ✓ Sí
          </Button>
          <Button
            color="danger"
            onClick={() => sendFeedback(prediction.digit.toString(), false)}
          >
            ✗ No
          </Button>
        </div>

              {/* Corrección manual */}
              {showCorrection && (
                <div className="mt-4">
                  <label>Número correcto:</label>
                  <select
                    className="form-select mx-auto mt-2"
                    style={{ maxWidth: 100 }}
                    onChange={(e) => sendCorrection(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Elige
                    </option>
                    {[0,1,2,3,4,5,6,7,8,9].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={closePredictionModal}>
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Modal de estado de entrenamiento */}
      <Modal isOpen={trainingModalOpen} toggle={() => setTrainingModalOpen(false)}>
        <ModalHeader toggle={() => setTrainingModalOpen(false)}>
          Estado del Entrenamiento
        </ModalHeader>
        <ModalBody>
          <p>{trainingStatus}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setTrainingModalOpen(false)}>
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
}

export default CanvasRecognition;