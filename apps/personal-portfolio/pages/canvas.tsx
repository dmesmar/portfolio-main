import { useLocation, Navigate, Router } from 'react-router-dom';
import { LayoutCanvas } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';


 const apiKey = process.env.API_KEY || '';

// Interfaz para los elementos del historial
interface PredictionItem {
  id: string;
  image: string; // base64
  prediction: string;
  actual: string | null; // Valor corregido
  isCorrect: boolean | null; // Feedback del usuario
}
 
function CanvasRecognition() {
  if (window.location.href.includes("/canvas/")) {
    window.location.replace("https://www.dariomesasmarti.com/portfolio");
  }
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
  type Status = 'idle' | 'loading' | 'ok' | 'fail';

  const StatusDot: React.FC<{ status: Status }> = ({ status }) => {
    const color =
      status === 'ok'    ? 'green'  :
      status === 'fail'  ? 'red'    :
      status === 'loading' ? 'orange' : 'gray';

    return (
      <span
        className="status-dot"
        style={{ backgroundColor: color }}
      />
    );
  };

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

  const [apiStatus,    setApiStatus]    = useState<Status>('idle');
  const [modelStatus,  setModelStatus]  = useState<Status>('idle');

  /* Comprueba /api/ping */

  const checkApi = async () => {
    setApiStatus('loading');
    var url = "https://digitscnn-production.up.railway.app/api"
    try {
      const r = await fetch(url + '/ping', {
        headers: {
          'X-API-Key': apiKey
        }});
      setApiStatus(r.ok ? 'ok' : 'fail');
    } catch {
      setApiStatus('fail');
    }
  };


  /* Comprueba /api/model */
  const checkModel = async () => {
    setModelStatus('loading');
    var url = "https://digitscnn-production.up.railway.app/api"
    try {
      const r = await fetch(url + '/model', {
        headers: {
          'X-API-Key': apiKey
        }});
      const data = await r.json();
      setModelStatus(r.ok && data.model_exists ? 'ok' : 'fail');
    } catch {
      setModelStatus('fail');
    }
  };

  const handlePredict = async (): Promise<void> => {
  try {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas no disponible');

    const b64 = canvas.toDataURL('image/png').split(',')[1];

    // -------- llamada al backend (query-param escapado) ---------------
    const url = `https://digitscnn-production.up.railway.app/api/predict?b64=${encodeURIComponent(b64)}`;
    const response = await fetch(url,
      { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        }});
        console.log(apiKey)
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

    const trainingData = predictionHistory
      .filter(item => item.actual !== null)
      .map(item => ({
        b64: item.image,
        label: item.actual,
      }));

    if (trainingData.length === 0) {
      setTrainingStatus('No hay datos suficientes para entrenar el modelo.');
      return;
    }

    // Enviar cada muestra individualmente
    for (let i = 0; i < trainingData.length; i++) {
      const sample = trainingData[i];
      const response = await fetch('https://digitscnn-production.up.railway.app/api/add-sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(sample),
      });

      if (!response.ok) {
        throw new Error(`Error al enviar muestra ${i + 1}`);
      }

      setTrainingStatus(`Muestra ${i + 1} enviada correctamente`);
    }

    setTrainingStatus('Todas las muestras fueron enviadas. Reentrenando modelo...');

    // Llamar al endpoint que hace el entrenamiento completo
    const trainResponse = await fetch('https://digitscnn-production.up.railway.app/api/train', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
    });
    
    if (!trainResponse.ok) {
      throw new Error('Error al entrenar el modelo');
    }

    const result = await trainResponse.json();
    setTrainingStatus(`Entrenamiento completado. Estado: ${result.status}`);

    setPredictionHistory([])
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    setTrainingStatus(`Error: ${errorMsg}`);
  }
};


  // Colores predefinidos
  const predefinedColors = ['#000000', '#FFFFFF'];

  return (
  <LayoutCanvas wrapperClass="main-aboutpage" title={lang.canvas.title.digits}>
    <section className="contact-area">
      <div className="container">
        {/* Aquí va la introducción al reconocimiento de dígitos*/}
        <div data-aos="zoom-in">
          <h1 className="section-heading" data-aos="fade-up">
          {lang.portfolio.projects.digits.title}
        </h1>
      <div className="d-flex project-infos-wrap shadow-box mb-24">
        <img src="/assets/bg1.png" alt="BG" className="bg-img" />
        <div className="project-details-info flex-1">
          <h3 className="text-xl font-bold mb-3">{lang.portfolio.projects.digits.title}</h3>
          <p>
            <b>
              {lang.portfolio.projects.digits.b1text}
            </b>
          </p>
        </div>
      </div>
      <div className="d-flex project-infos-wrap shadow-box mb-24">
        <img src="/assets/bg1.png" alt="BG" className="bg-img" />        
        <div className="project-details-info flex-1">
          <h3 className="text-xl font-bold mb-3">{lang.portfolio.projects.digits.b2title1}</h3>
          <ul className="technology-list">
            <li>
              {lang.portfolio.projects.digits.b2text1.py}
            </li>
            <li>
              {lang.portfolio.projects.digits.b2text1.tf}
            </li>
            <li>
              {lang.portfolio.projects.digits.b2text1.api}
            </li>
            <li>
              {lang.portfolio.projects.digits.b2text1.git}
            </li>
          </ul>
        </div>

        <div className="project-details-info flex-1">
          <h3 className="text-xl font-bold mb-3">{lang.portfolio.projects.digits.b2title2}</h3>
          <ul className="feature-list">
            <li>{lang.portfolio.projects.digits.b2text2.c1}</li>
            <li>{lang.portfolio.projects.digits.b2text2.c2}</li>
          </ul>
        </div>
      </div>
  </div>
  </div >
  <div className="separador-proyectos-medio"></div>
  <hr></hr>
  <div className="separador-proyectos-medio"></div>
  <div className="container">
        <div className="gx-row d-flex justify-content-between gap-24">

          <div className="col-lg-4" data-aos="zoom-in">
            <div className="shadow-box text-center extraPadding">
              <h3 className="mb-3">{lang.canvas.title.status}</h3>
              <div className="d-flex flex-column align-items-center">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div style={{width: "120px"}}>
                    <Button size="sm" className="w-100" onClick={checkApi}>
                      {lang.canvas.buttons.api}
                    </Button>
                  </div>
                  <StatusDot status={apiStatus} />
                  {apiStatus === 'loading' && <Spinner size="sm" className="ms-2" />}
                </div>
                <div className="d-flex align-items-center justify-content-center">
                  <div style={{width: "120px"}}>
                    <Button size="sm" className="w-100" onClick={checkModel}>
                      {lang.canvas.buttons.model}
                    </Button>
                  </div>
                  <StatusDot status={modelStatus} />
                  {modelStatus === 'loading' && <Spinner size="sm" className="ms-2" />}
                </div>
              </div>
            </div>
          </div>

          {/*          Parte Derecha            */}

          <div className="col-lg-8" data-aos="zoom-in">
            <div className="shadow-box extraPadding">
              <h1
                className="text-center mb-4"
              > {lang.canvas.title.digits}</h1>

              <p className="text-center mb-4">
                {lang.canvas.subtitles.digits}
              </p>

              <canvas
                ref={canvasRef}
                width={350}
                height={350}
                className='canvas'
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />

              {/* Herramientas de dibujo */}
              <div className="d-flex align-items-center justify-content-center mt-4 flex-wrap">

                {/* Paleta rápida */}
                <div className="me-4 mb-2">
                  <div className="d-flex">
                    {predefinedColors.map((color, i) => (
                      <div
                        key={i}
                        onClick={() => setBrushColor(color)}
                        style={{
                          backgroundColor: color,
                          width: '25px',
                          height: '25px',
                          margin: '0 3px',
                          border: brushColor === color ? '2px solid #666' : '1px solid #ccc',
                          cursor: 'pointer',
                          borderRadius: '3px',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Tamaño del pincel */}
                <div className="mb-2">
                  <label htmlFor="brushSize" className="me-2">{lang.canvas.size}:</label>
                  <input
                    type="range"
                    id="brushSize"
                    min={5}
                    max={30}
                    value={brushSize}
                    onChange={e => setBrushSize(+e.target.value)}
                    style={{ width: '100px' }}
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="buttons-group d-flex justify-content-center mt-4">
                <Button
                  className="theme-btn submit-btn me-2"
                  onClick={handlePredict}
                >
                  {lang.canvas.buttons.predict}
                </Button>
                <Button
                  className="theme-btn"
                  onClick={handleClearCanvas}
                >
                  {lang.canvas.buttons.clear}
                </Button>
              </div>

              {/* Error */}
              {errorMessage && (
                <Alert color="danger" className="mt-3 text-center">
                  {errorMessage}
                </Alert>
              )}

              {/* Historial */}
              {predictionHistory.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-center mb-3">{lang.canvas.title.history}</h4>
                  <div className="table-responsive">
                    <Table bordered hover >
                      <thead >
                        <tr>
                          <th>{lang.canvas.table_predict.image}</th>
                          <th>{lang.canvas.table_predict.prediction}</th>
                          <th>{lang.canvas.table_predict.real}</th>
                          <th>{lang.canvas.table_predict.status}</th>
                        </tr>
                      </thead>
                      <tbody >
                        {predictionHistory.slice(0, 5).map(item => (
                          <tr  key={item.id} >
                            <td style={{ width: '100px' }}>
                              <img  className='image-table'
                                src={`data:image/png;base64,${item.image}`}
                                alt=""
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

                  <div className="text-center mt-3">
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
        <ModalHeader toggle={closePredictionModal} className='modalCanvas'>
          {lang.canvas.title.modal}
        </ModalHeader>

        <ModalBody className='modalCanvas'>
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
          {lang.canvas.prediction}:&nbsp;
          <strong>{prediction.digit}</strong>
          &nbsp;({(prediction.prob * 100).toFixed(1)}%)
        </h4>

        {/* Lista de probabilidades */}
        <ul className="list-group mt-3 uLmodalCanvas">
          {prediction.distribution.map(([d, p]) => (
            <li
              key={d}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {d}
              <span className="canvasPercentage badge bg-secondary rounded-pill ">
                {(p * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>

        {/* Retroalimentación */}
        <div className="mt-4">
          <p>{lang.canvas.isCorrect}</p>
          <Button
            color="success"
            className="me-2"
            onClick={() => sendFeedback(prediction.digit.toString(), true)}
          >
            ✓ {lang.canvas.buttons.yes}
          </Button>
          <Button
            color="danger"
            onClick={() => sendFeedback(prediction.digit.toString(), false)}
          >
            ✗ {lang.canvas.buttons.no}
          </Button>
        </div>

              {/* Corrección manual */}
              {showCorrection && (
                <div className="mt-4">
                  <label>{lang.canvas.correctNumber}:</label>
                  <select
                    className="form-select mx-auto mt-2"
                    style={{ maxWidth: 100 }}
                    onChange={(e) => sendCorrection(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {lang.canvas.choose}
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

        <ModalFooter className='modalCanvas'>
          <Button color="primary" onClick={closePredictionModal} className='canvasButton'>
            {lang.canvas.buttons.close}
          </Button>
        </ModalFooter>
      </Modal>
      <div className="separador-proyectos"></div>
    </LayoutCanvas>
  );
}

export default CanvasRecognition;