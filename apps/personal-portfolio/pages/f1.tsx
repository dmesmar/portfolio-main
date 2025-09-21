import { useEffect, useState } from 'react';
import { LayoutCanvas } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import { Modal, ModalHeader, ModalBody, Button, Input, List } from 'reactstrap';
import Papa from 'papaparse';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';
import _, { map } from 'underscore';


interface Driver {
  driverId: string | number;
  driverRef: string;
  number: string;
  code: string;
  forename: string;
  surname: string;
  dob: string;
  nationality: string;
  nRaces: number;
  nRacesWon: number;
  nPodiums: number;
  h2hrW: number;
  h2hrL: number;
}

interface Constructor {
  constructorId: string | number;
  constructorRef: string;
  name: string;
  nationality: string;
  url: string;
}

interface Circuit {
  circuitId: string | number;
  circuitRef: string;
  name: string;
  location: string;
  country: string;
  lat: string;
  lng: string;
  alt: string;
  url: string;
  street: string;
}

const ROW_GAP_PX = 40;
const N_DRIVERS = Array.from({length: 862}, (_, i) => i + 1)
const N_CONSTRUCTORS = Array.from({ length: 215 }, (_, i) => i + 1).filter(n => n !== 43 && n!==165 && n!==166 && n!=212);
const N_CIRCUITS = Array.from({ length: 80 }, (_, i) => i + 1).filter(n => n !== 72 && n!==23 && n!==74);


function F1() {
  const langCode = getCurrentLanguage();
  const langMap = { en, es, ca };
  const lang = langMap[langCode];
  const [confirmarAPIModalOpen, setConfirmarAPIModalOpen] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [constructors, setConstructors] = useState<Constructor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [numPilotos, setNumPilotos] = useState(20);
  const [formaPuntos, setFormaPuntos] = useState("")
  const [selectedDriverIndex, setselectedDriverIndex] = useState<number | null>(null);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);
  const [selectedDriver, setselectedDriver] = useState<Driver | Constructor | null>(null);
  const [pilots, setPilots] = useState<(Driver | null)[]>(Array(24).fill(null));
  const [teamLeaders, setTeamLeaders] = useState<(Constructor | null)[]>(Array(Math.ceil(24 / 2)).fill(null));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [numCircuitos, setNumCircuitos] = useState(24);
  const [circuitModalOpen, setCircuitModalOpen] = useState(false);
  const [selectedCircuitIndex, setSelectedCircuitIndex] = useState<number | null>(null);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [circuitSearchTerm, setCircuitSearchTerm] = useState('');
  const [circuitPage, setCircuitPage] = useState(1);
  const [selectedCircuits, setSelectedCircuits] = useState<(Circuit | null)[]>(Array(24).fill(null));
  const [circuitConfirmModalOpen, setCircuitConfirmModalOpen] = useState(false);

  
  const toggleCircuitConfirmModal = () =>
    setCircuitConfirmModalOpen((v) => !v);

  useEffect(() => {
    Papa.parse('/assets/drivers.csv', {
      download: true,
      header: true,
      dynamicTyping: false,
      complete: (result) => setDrivers((result.data as Driver[]) || []),
    });

    Papa.parse('/assets/constructors.csv', {
      download: true,
      header: true,
      dynamicTyping: false,
      complete: (result) => setConstructors((result.data as Constructor[]) || []),
    });

    Papa.parse('/assets/circuits.csv', {
      download: true,
      header: true,
      dynamicTyping: false,
      complete: (result) => setCircuits((result.data as Circuit[]) || []),
    });
  }, []);

  const teamsCount = Math.ceil(numPilotos / 2);
  const teamsPerFullRow = numPilotos === 20 ? 5 : 4;
  const rows: number[][] = [];
  for (let i = 0; i < teamsCount; i += teamsPerFullRow) {
    const sliceLen = Math.min(teamsPerFullRow, teamsCount - i);
    const row = Array.from({ length: sliceLen }, (_, k) => i + k);
    rows.push(row);
  }


  const teamsCountSummary = Math.ceil(numPilotos / 2);
  let rowsSummary: number[][] = [];

  if (teamsCountSummary <= 6) {
    rowsSummary.push(Array.from({ length: teamsCountSummary }, (_, i) => i));
  } else {
    const mitad = Math.ceil(teamsCountSummary / 2);
    const primeraFila = Array.from({ length: mitad }, (_, i) => i);
    const segundaFila = Array.from(
      { length: teamsCountSummary - mitad },
      (_, i) => mitad + i
    );
    rowsSummary = [primeraFila, segundaFila];
  }


  const toggleModal = () => setModalOpen((v) => !v);
  const toggleConfirmModal = () => setConfirmModalOpen((v) => !v);
  const toggleCircuitModal = () => setCircuitModalOpen((v) => !v);
  const sendToAPI = async () => {
    const pilotoIds = pilots
      .filter((p): p is Driver => p !== null)
      .map((p) => p.driverId);

    const circuitIds = selectedCircuits
      .filter((c): c is Circuit => c !== null)
      .map((c) => c.circuitId);

    const payload = {
      pilotos: pilotoIds,
      circuitos: circuitIds,
      sistemaPuntuacion: formaPuntos || "A",
  };

  console.log("Datos preparados para enviar a la API:");
  console.log(JSON.stringify(payload, null, 2)); // JSON válido y formateado
  const url = `http://127.0.0.1:8000/api/setInitialData`;
    const response = await fetch(url, { 
      method: 'POST',
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload, null, 2)
     });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.log(err)
      throw new Error(err.detail ?? `HTTP ${response.status}`);
    }
    console.log(response.statusText)
  // TODO: Esto se envía en una llamada inicial en la cual se dejan guardados los parámeteros para todo el rato
  setConfirmarAPIModalOpen(true);
  };


  const handleSummaryPilotClick = (pilotIndex: number) => {
  setselectedDriverIndex(pilotIndex);  
  setSelectedTeamIndex(null);
  setselectedDriver(pilots[pilotIndex]);
  setModalOpen(true);
  };
  const handleSummaryTeamClick = (teamIndex: number) => {
  setSelectedTeamIndex(teamIndex);
  setselectedDriverIndex(null);
  setselectedDriver(teamLeaders[teamIndex]);
  setModalOpen(true);
  };



  const handleCardClick = (index: number) => {
    setselectedDriverIndex(index);
    setSelectedTeamIndex(null);
    setSearchTerm('');
    setCurrentPage(1);
    setModalOpen(true);
  };

  const handleTeamLeaderClick = (teamIndex: number) => {
    setSelectedTeamIndex(teamIndex);
    setselectedDriverIndex(null);
    setSearchTerm('');
    setCurrentPage(1);
    setModalOpen(true);
  };

  const handleCircuitClick = (index: number) => {
    setSelectedCircuitIndex(index);
    setCircuitSearchTerm('');
    setCircuitPage(1);
    setCircuitModalOpen(true);
  };

  const chosenIds = new Set<string>(
    [
      ...pilots.filter(Boolean).map((p) => String((p as Driver).driverId)),
      ...teamLeaders.filter(Boolean).map((t) => String((t as Constructor).constructorId)),
    ].map(String)
  );

  const filteredDrivers = drivers.filter(
    (d) =>
      d && d.forename && d.surname &&
      !chosenIds.has(String(d.driverId)) &&
      `${d.forename} ${d.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConstructors = constructors.filter(
    (c) =>
      c && c.name &&
      !chosenIds.has(String(c.constructorId)) &&
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCircuits = circuits.filter(
    (c) =>
      c &&
      c.name &&
      c.name.toLowerCase().includes(circuitSearchTerm.toLowerCase())
  );

  const circuitsPerPage = 10;
  const totalCircuitPages = Math.max(1, Math.ceil(filteredCircuits.length / circuitsPerPage));
  const circuitStartIndex = (circuitPage - 1) * circuitsPerPage;
  const paginatedCircuits = filteredCircuits.slice(circuitStartIndex, circuitStartIndex + circuitsPerPage);

  const resultsPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(
      (selectedDriverIndex !== null ? filteredDrivers.length : filteredConstructors.length) /
        resultsPerPage
    )
  );
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedResults = (selectedDriverIndex !== null ? filteredDrivers : filteredConstructors).slice(
    startIndex,
    startIndex + resultsPerPage
  );

  const handleSelectDriver = (driver: Driver | Constructor) => {
    setselectedDriver(driver);
    setConfirmModalOpen(true);
  };
  const handleSelectCircuit = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setCircuitConfirmModalOpen(true);
  };

  const confirmAddCircuit = () => {
    if (selectedCircuit && selectedCircuitIndex !== null) {
      setSelectedCircuits((prev) => {
        const next = [...prev];
        next[selectedCircuitIndex] = selectedCircuit;
        return next;
      });
    }
    setCircuitConfirmModalOpen(false);
    setCircuitModalOpen(false);
    setSelectedCircuit(null);
    setSelectedCircuitIndex(null);
  };

  const confirmAddPilot = () => {
    if (selectedDriver && selectedDriverIndex !== null) {
      setPilots((prev) => {
        const next = [...prev];
        next[selectedDriverIndex] = selectedDriver as Driver;
        return next;
      });
    }
    if (selectedDriver && selectedTeamIndex !== null) {
      setTeamLeaders((prev) => {
        const next = [...prev];
        next[selectedTeamIndex] = selectedDriver as Constructor;
        return next;
      });
    }

    setConfirmModalOpen(false);
    setModalOpen(false);
    setselectedDriver(null);
    setselectedDriverIndex(null);
    setSelectedTeamIndex(null);
  };

  const cargarPlantilla = (escuderiasIds: number[], pilotosIds: number[]) => {
    
    const newTeamLeaders = escuderiasIds.map(
      (id) => constructors.find((c) => String(c.constructorId) === String(id)) || null
    );
    const newPilots = pilotosIds.map(
      (id) => drivers.find((d) => String(d.driverId) === String(id)) || null
    );

    setTeamLeaders((prev) => {
      const next = [...prev];
      for (let i = 0; i < newTeamLeaders.length; i++) {
        next[i] = newTeamLeaders[i] || null;
      }
      return next;
    });

    setPilots((prev) => {
      const next = [...prev];
      for (let i = 0; i < newPilots.length; i++) {
        next[i] = newPilots[i] || null;
      }
      return next;
    });
  }

  const selectPlantilla = (num: number) => {
    if (num == 2024) {
      const escuderiasIds = [9, 131, 6, 1, 117, 214, 3, 215, 15, 210];
      const pilotosIds = [
        830, 815, 1, 847, 844, 832, 846, 857, 4, 840,
        842, 839, 858, 848, 817, 852, 855, 822, 825, 807,
      ];
      cargarPlantilla(escuderiasIds, pilotosIds)
    }
    if (num == 0) {
      let drivers = _.sample(N_DRIVERS, 24);
      let constructores = _.sample(N_CONSTRUCTORS, 12);
      console.log(drivers)
      console.log(constructores)
      cargarPlantilla(constructores, drivers)
    }
  };

  const cargarPlantillaCircuitos = (circuitsIds: number[]) => {
  const newCircuits = circuitsIds.map(
    (id) => circuits.find((c) => String(c.circuitId) === String(id)) || null
  );

  setSelectedCircuits((prev) => {
    const next = [...prev];
    for (let i = 0; i < newCircuits.length; i++) {
      next[i] = newCircuits[i] || null;
    }
    return next;
  });
};


  const selectPlantillaCircuitos = (num: number) => {
    if (num == 2024) {
      const circuitIds = [3, 77, 1, 22, 17, 79, 21, 6, 7, 4, 70, 9, 11, 13, 39, 14, 73, 15, 69, 32, 18, 80, 78, 24]
      cargarPlantillaCircuitos(circuitIds)
    }
    if (num == 0) {
      let circuits = _.sample(N_CIRCUITS, 24);
      cargarPlantillaCircuitos(circuits)
    }
  };
  const cambiarFormaPuntuar = (str: string) => {
    setFormaPuntos(str);
    if (str in puntuacionesPorForma) {
      setPuntos(puntuacionesPorForma[str]);
    } else {
      setPuntos([]);
    }
  };

    const puntuacionesPorForma: Record<string, number[]> = {
    A: [8, 6, 4, 3, 2, 0, 0, 0, 0, 0, 1],
    B: [8, 6, 4, 3, 2, 1, 0, 0, 0, 0, 0],
    C: [9, 6, 4, 3, 2, 1, 0, 0, 0, 0, 0],
    D: [10, 6, 4, 3, 2, 0, 0, 0, 0, 0, 0],
    E: [10, 8, 6, 5, 4, 3, 2, 1, 0, 0, 0],
    F: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0],
    G: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 1],
    H: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0],
  };

  const [puntos, setPuntos] = useState<number[]>(puntuacionesPorForma['A']);


  return (
    <LayoutCanvas wrapperClass="main-aboutpage" title={lang.canvas.title.digits}>
      <div className="pilots-dropdown">
        TODO: EN CONSTRUCCIÓN: FALTA AÑADIR LA INTRODUCCIÓN + decisiones de diseño
      </div>
      <div className="pilots-dropdown">
        <label htmlFor="numPilotos" className="pilots-dropdown-label">Número de pilotos:</label>
        <select
          id="numPilotos"
          value={numPilotos}
          onChange={(e) => setNumPilotos(Number(e.target.value))}
          className="pilots-dropdown-select"
        >
          <option value={20}>20</option>
          <option value={22}>22</option>
          <option value={24}>24</option>
        </select>
      </div>

      <div className="teams-grid" style={{ marginLeft: 24 }}>
        {rows.map((row, rowIndex) => {
          const isCentered = row.length < teamsPerFullRow;
          const rowGapTotal = (row.length - 1) * ROW_GAP_PX;
          const teamWidthCalc = `calc((100% - ${rowGapTotal}px) / ${row.length})`;

          return (
            <div key={rowIndex} className={`team-row ${isCentered ? 'center' : ''}`}>
              {row.map((teamIndex) => {
                const pIndex1 = teamIndex * 2;
                const pIndex2 = pIndex1 + 1;
                return (
                  <div
                    key={teamIndex}
                    className="team-card"
                    style={{ width: teamWidthCalc, minWidth: 120 }}
                  >
                    <div
                      className={`team-leader-card ${teamLeaders[teamIndex] ? 'active' : ''}`}
                      onClick={() => handleTeamLeaderClick(teamIndex)}
                    >
                      {teamLeaders[teamIndex] ? teamLeaders[teamIndex]?.name : 'Elegir escudería'}
                    </div>
                    <div className="team-pilots">
                      {[pIndex1, pIndex2].map((pIdx) =>
                        pIdx < numPilotos ? (
                          <div
                            key={pIdx}
                            className={`pilot-card ${pilots[pIdx] ? 'active' : ''}`}
                            onClick={() => handleCardClick(pIdx)}
                          >
                            {pilots[pIdx] ? `${pilots[pIdx]?.forename} ${pilots[pIdx]?.surname}` : `Piloto ${pIdx + 1}`}
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className='drivers-button-span'>
        <Button color="success" className="cargar-plantilla" onClick={() => selectPlantilla(0)}>
        Cargar plantilla aleatoria
      </Button>
      <Button color="success" className="cargar-plantilla" onClick={() => selectPlantilla(2024)}>
        Cargar plantilla 2024
      </Button>
      </div>
        

      <div className="pilots-dropdown">
        <label htmlFor="numCircuitos" className="pilots-dropdown-label">Número de circuitos:</label>
        <select
          id="numCircuitos"
          value={numCircuitos}
          onChange={(e) => setNumCircuitos(Number(e.target.value))}
          className="pilots-dropdown-select"
        >
          {Array.from({ length: 11 }, (_, i) => 14 + i).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div className="teams-grid circuits-grid">
        <div className="team-row center flex-wrap">
          {Array.from({ length: numCircuitos }, (_, i) => (
            <div
              key={i}
              className={`circuit-card ${selectedCircuits[i] ? 'active' : ''}`}
              onClick={() => handleCircuitClick(i)}
            >
              {selectedCircuits[i] ? selectedCircuits[i]?.name : `Circuito ${i + 1}`}
            </div>
          ))}
        </div>
      </div>
      <div className='drivers-button-span'>
        <Button color="success" className="cargar-plantilla" onClick={() => selectPlantillaCircuitos(0)}>
          Cargar plantilla aleatoria
        </Button>
        <Button color="success" className="cargar-plantilla" onClick={() => selectPlantillaCircuitos(2024)}>
          Cargar plantilla 2024
        </Button>
      </div>
    
      <div className="pilots-dropdown">
    <label htmlFor="formaPuntos" className="pilots-dropdown-label">Forma de puntuar:</label>
    <select
      id="formaPuntos"
      value={formaPuntos}
      onChange={(e) => cambiarFormaPuntuar(e.target.value)}
      className="pilots-dropdown-select"
    >
      <option value={"A"}>1950-1959</option>
      <option value={"B"}>1960</option>
      <option value={"C"}>1961-1990</option>
      <option value={"D"}>1991-2002</option>
      <option value={"E"}>2003-2009</option>
      <option value={"F"}>2010-2018</option>
      <option value={"G"}>2019-2024</option>
      <option value={"H"}>2025</option>
      </select>
    </div>
    <div className="puntos-table-container">
  <table className="puntos-table horizontal">
    <thead>
      <tr>
        {puntos.slice(0, 10).map((_, index) => (
          <th key={index}>{index + 1}</th>
        ))}
        <th>FL</th>
      </tr>
    </thead>
    <tbody>
      <tr className="puntos-fila-valores">
        {puntos.slice(0, 10).map((p, index) => (
          <td key={index}>{p}</td>
        ))}
        <td>{puntos[10] || 0}</td>
      </tr>
    </tbody>
  </table>
</div>

        
        
    <div className="summary-section-resumen">
      <h2 className="summary-title">Resumen de pilotos</h2>
      <div className="summary-teams-grid">
      {rowsSummary.map((row, rowIndex) => (
        <div key={rowIndex} className="summary-team-row">
          {row.map((teamIndex) => {
            const pIndex1 = teamIndex * 2;
            const pIndex2 = pIndex1 + 1;
            const pilot1 = pilots[pIndex1];
            const pilot2 = pilots[pIndex2];
            const team = teamLeaders[teamIndex];

            return (
              <div key={teamIndex} className="summary-team-card">
                <div className="summary-team-border">
                  {team && (
                    <>
                      <img
                        className="summary-team-logo"
                        src={`/assets/constructors/${team.constructorId}.WEBP`}
                        alt={team.name}
                      />
                      <div className="summary-team-name">{team.name}</div>
                    </>
                  )}
                  <div className="summary-pilots-row">
                  {[pilot1, pilot2].map((pilot, idx) =>
                    pilot ? (
                      <div
                        key={idx}
                        className="summary-pilot-card active"
                        //onClick={() => handleSummaryPilotClick(pIndex1 + idx)}
                        //style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={`/assets/drivers/${pilot.driverId}.WEBP`}
                          alt={`${pilot.forename} ${pilot.surname}`}
                        />
                        <div className="summary-pilot-name">
                          {pilot.forename} {pilot.surname}
                        </div>
                      </div>
                    ) : (
                      <div key={idx} className="summary-pilot-card empty">
                        Piloto {pIndex1 + idx + 1}
                      </div>
                    )
                  )}
                </div>

                </div>
              </div>
            );
          })}
        </div>
      ))}
      </div>
      
      <div className="summary-circuits-section">
        <h2 className="summary-circuits-title">Resumen de circuitos</h2>
        <div className="summary-circuits-grid">
          {Array.from({ length: numCircuitos }, (_, i) => {
            const circuit = selectedCircuits[i];
            return (
              <div key={i} className="summary-circuit-card">
                <div className={`summary-circuit-border ${circuit ? 'active' : ''}`}>
                  <img
                    className="summary-circuit-img"
                    src={circuit ? `/assets/circuits/${circuit.circuitId}.WEBP` : ""}
                    alt={circuit ? circuit.name : `Circuito ${i + 1}`}
                  />
                  <div className="summary-circuit-name">
                    {circuit ? circuit.name : `Circuito ${i + 1}`}
                  </div>
                  {circuit && (
                    <div className="summary-circuit-location">
                      {circuit.location}, {circuit.country}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="summary-button-container">
        <Button color="success" onClick={sendToAPI}>Confirmar datos</Button>
      </div>
    </div>

      






          


      <Modal isOpen={modalOpen} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal}>
          {selectedDriverIndex !== null ? 'Seleccionar piloto' : 'Seleccionar escudería'}
        </ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder={selectedDriverIndex !== null ? 'Buscar piloto...' : 'Buscar escudería...'}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="mb-3"
          />
          {paginatedResults.length > 0 ? (
            <ul className="list-unstyled">
              {paginatedResults.map((d) => (
                <li key={selectedDriverIndex !== null ? String((d as Driver).driverId) : String((d as Constructor).constructorId)}>
                  <Button
                    color="link"
                    className="text-start w-100"
                    onClick={() => handleSelectDriver(d)}
                  >
                    {selectedDriverIndex !== null
                      ? `${(d as Driver).forename} ${(d as Driver).surname}`
                      : `${(d as Constructor).name} — ${(d as Constructor).nationality}`}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No se encontraron resultados.</p>
          )}
          {totalPages > 1 && (
            <div className="pagination-controls d-flex justify-content-between mt-3">
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>Anterior</Button>
              <span>Página {currentPage} de {totalPages}</span>
              <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>Siguiente</Button>
            </div>
          )}
        </ModalBody>
      </Modal>

      <Modal isOpen={confirmModalOpen} toggle={toggleConfirmModal} size="lg">
        <ModalHeader toggle={toggleConfirmModal}>
          {selectedDriverIndex !== null ? 'Ficha del piloto' : 'Ficha de escudería'}
        </ModalHeader>
        <ModalBody>
          {selectedDriver && (
            <div className="driver-detail">
              <div className="driver-info">
                <h3>
                  {selectedDriverIndex !== null
                    ? `${(selectedDriver as Driver).forename} ${(selectedDriver as Driver).surname} ${(selectedDriver as Driver).code && `(${(selectedDriver as Driver).code})`}`
                    : (selectedDriver as Constructor).name}
                </h3>
                {selectedDriverIndex !== null ? (
                  <>
                    <p><strong>Nacionalidad:</strong> {(selectedDriver as Driver).nationality}</p>
                    <p><strong>Número:</strong> {(selectedDriver as Driver).number}</p>
                    <p><strong>Carreras:</strong> {(selectedDriver as Driver).nRaces}</p>
                    <p><strong>Victorias:</strong> {(selectedDriver as Driver).nRacesWon}</p>
                    <p><strong>Podiums:</strong> {(selectedDriver as Driver).nPodiums}</p>
                    <p><strong>Head-to-head:</strong> {(selectedDriver as Driver).h2hrW}W - {(selectedDriver as Driver).h2hrL}L</p>
                  </>
                ) : (
                  <p><strong>Nacionalidad:</strong> {(selectedDriver as Constructor).nationality}</p>
                )}
                <Button color="primary" onClick={confirmAddPilot}>Añadir</Button>
              </div>
              <div className="driver-photo">
                <img
                  src={`/assets/${selectedDriverIndex !== null ? 'drivers' : 'constructors'}/${selectedDriverIndex !== null ? (selectedDriver as Driver).driverId : (selectedDriver as Constructor).constructorId}.WEBP`}
                  alt={selectedDriverIndex !== null
                    ? `${(selectedDriver as Driver).forename} ${(selectedDriver as Driver).surname}`
                    : (selectedDriver as Constructor).name}
                />
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>

      <Modal isOpen={circuitModalOpen} toggle={toggleCircuitModal} size="lg">
        <ModalHeader toggle={toggleCircuitModal}>Seleccionar circuito</ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Buscar circuito..."
            value={circuitSearchTerm}
            onChange={(e) => {
              setCircuitSearchTerm(e.target.value);
              setCircuitPage(1);
            }}
            className="mb-3"
          />
          {paginatedCircuits.length > 0 ? (
            <ul className="list-unstyled">
              {paginatedCircuits.map((c) => (
                <li key={String(c.circuitId)}>
                  <Button
                    color="link"
                    className="text-start w-100"
                    onClick={() => handleSelectCircuit(c)}
                  >
                    {c.name} — {c.country}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No se encontraron resultados.</p>
          )}
          {totalCircuitPages > 1 && (
            <div className="pagination-controls d-flex justify-content-between mt-3">
              <Button disabled={circuitPage === 1} onClick={() => setCircuitPage((p) => Math.max(p - 1, 1))}>Anterior</Button>
              <span>Página {circuitPage} de {totalCircuitPages}</span>
              <Button disabled={circuitPage === totalCircuitPages} onClick={() => setCircuitPage((p) => Math.min(p + 1, totalCircuitPages))}>Siguiente</Button>
            </div>
          )}
        </ModalBody>
      </Modal>

      <Modal isOpen={circuitConfirmModalOpen} toggle={toggleCircuitConfirmModal} size="lg">
        <ModalHeader toggle={toggleCircuitConfirmModal}>
          {selectedCircuit ? selectedCircuit.name : 'Ficha del circuito'}
        </ModalHeader>
        <ModalBody>
          {selectedCircuit && (
            <div className="driver-detail">
              <div className="driver-info">
                <h3>{selectedCircuit.name}</h3>
                <p><strong>Localización:</strong> {selectedCircuit.location}, {selectedCircuit.country}</p>
                <p><strong>Latitud:</strong> {selectedCircuit.lat}</p>
                <p><strong>Longitud:</strong> {selectedCircuit.lng}</p>
                <p><strong>Altitud:</strong> {selectedCircuit.alt}</p>
                <p><strong>Urbano:</strong> {selectedCircuit.street === '1' ? 'Sí' : 'No'}</p>
                <Button color="primary" onClick={confirmAddCircuit}>Añadir</Button>
              </div>
              <div className="driver-photo">
                <img
                  src={`/assets/circuits/${selectedCircuit.circuitId}.WEBP`}
                  alt={selectedCircuit.name}
                />
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
      <Modal isOpen={confirmarAPIModalOpen} toggle={() => setConfirmarAPIModalOpen(false)}>
        {/*
        TODO: La idea de este modal es que tengas botones para simular cada carrera
          Cada botón de cada carrera enviará un aviso a la API para que simule la siguiente carrera.
          Sólo se verá el botón de la primera carrera, y cuando se simule ésta, se pasará a deshabilitar ese botón y mostrar el siguiente
          Ideas: 
            -que cuando estén los resultados te los abra en un modal y cuando estés fuera de un modal simplemente se vea un resumen para que no ocupe mucho
            -una clasificación según va la temporada de pilotos y otra de constructores
            -una barra de porcentaje de lo que queda de la temporada
            -que mientras cargue te salte un spinner o algo
        */}
        <ModalHeader toggle={() => setConfirmarAPIModalOpen(false)}>
          En construcción
        </ModalHeader>
        <ModalBody>
          Esta funcionalidad está en construcción
        </ModalBody>
      </Modal>


    </LayoutCanvas>
  );
}

export default F1;
