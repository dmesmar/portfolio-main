import { useEffect, useState } from 'react';
import { LayoutCanvas } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import { Modal, ModalHeader, ModalBody, Button, Input } from 'reactstrap';
import Papa from 'papaparse';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';

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

const ROW_GAP_PX = 40;

function F1() {
  const langCode = getCurrentLanguage();
  const langMap = { en, es, ca };
  const lang = langMap[langCode];

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [constructors, setConstructors] = useState<Constructor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [numPilotos, setNumPilotos] = useState(20);
  const [selectedPilotIndex, setSelectedPilotIndex] = useState<number | null>(null);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);
  const [selectedPilot, setSelectedPilot] = useState<Driver | Constructor | null>(null);
  const [pilots, setPilots] = useState<(Driver | null)[]>(Array(24).fill(null));
  const [teamLeaders, setTeamLeaders] = useState<(Constructor | null)[]>(Array(Math.ceil(24 / 2)).fill(null));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
  }, []);

  const teamsCount = Math.ceil(numPilotos / 2);
  const teamsPerFullRow = numPilotos === 20 ? 5 : 4;
  const rows: number[][] = [];
  for (let i = 0; i < teamsCount; i += teamsPerFullRow) {
    const sliceLen = Math.min(teamsPerFullRow, teamsCount - i);
    const row = Array.from({ length: sliceLen }, (_, k) => i + k);
    rows.push(row);
  }

  const toggleModal = () => setModalOpen((v) => !v);
  const toggleConfirmModal = () => setConfirmModalOpen((v) => !v);

  const handleCardClick = (index: number) => {
    setSelectedPilotIndex(index);
    setSelectedTeamIndex(null);
    setSearchTerm('');
    setCurrentPage(1);
    setModalOpen(true);
  };

  const handleTeamLeaderClick = (teamIndex: number) => {
    setSelectedTeamIndex(teamIndex);
    setSelectedPilotIndex(null);
    setSearchTerm('');
    setCurrentPage(1);
    setModalOpen(true);
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

  const resultsPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(
      (selectedPilotIndex !== null ? filteredDrivers.length : filteredConstructors.length) /
        resultsPerPage
    )
  );
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedResults = (selectedPilotIndex !== null ? filteredDrivers : filteredConstructors).slice(
    startIndex,
    startIndex + resultsPerPage
  );

  const handleSelectDriver = (driver: Driver | Constructor) => {
    setSelectedPilot(driver);
    setConfirmModalOpen(true);
  };

  const confirmAddPilot = () => {
    if (selectedPilot && selectedPilotIndex !== null) {
      setPilots((prev) => {
        const next = [...prev];
        next[selectedPilotIndex] = selectedPilot as Driver;
        return next;
      });
    }
    if (selectedPilot && selectedTeamIndex !== null) {
      setTeamLeaders((prev) => {
        const next = [...prev];
        next[selectedTeamIndex] = selectedPilot as Constructor;
        return next;
      });
    }

    setConfirmModalOpen(false);
    setModalOpen(false);
    setSelectedPilot(null);
    setSelectedPilotIndex(null);
    setSelectedTeamIndex(null);
  };
  
  const cargarPlantilla2024 = () => {
    const escuderiasIds = [9, 131, 6, 1, 117, 214, 3, 215, 15, 210];
    const pilotosIds = [
      830, 815, 1, 847, 844, 832, 846, 857, 4, 840,
      842, 839, 858, 848, 817, 852, 855, 822, 825, 807,
    ];

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
  };

  return (
    <LayoutCanvas wrapperClass="main-aboutpage" title={lang.canvas.title.digits}>
      {/* Dropdown */}
      <div className="pilots-dropdown">
        <label htmlFor="numPilotos" className="pilots-dropdown-label">
          Número de pilotos:
        </label>
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

      {/* Contenedor de filas */}
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
                    {/* líder (escudería) */}
                    <div
                      className={`team-leader-card ${teamLeaders[teamIndex] ? 'active' : ''}`}
                      onClick={() => handleTeamLeaderClick(teamIndex)}
                    >
                      {teamLeaders[teamIndex] ? teamLeaders[teamIndex]?.name : 'Elegir escudería'}
                    </div>

                    {/* pilotos */}
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

      <Button color="success" className="cargar-plantilla" onClick={cargarPlantilla2024}>
        Cargar plantilla 2024
      </Button>

      {/* Modal principal */}
      <Modal isOpen={modalOpen} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal}>
          {selectedPilotIndex !== null ? 'Seleccionar piloto' : 'Seleccionar escudería'}
        </ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder={selectedPilotIndex !== null ? 'Buscar piloto...' : 'Buscar escudería...'}
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
                <li key={selectedPilotIndex !== null ? String((d as Driver).driverId) : String((d as Constructor).constructorId)}>
                  <Button
                    color="link"
                    className="text-start w-100"
                    onClick={() => handleSelectDriver(d)}
                  >
                    {selectedPilotIndex !== null
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
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
                Anterior
              </Button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                Siguiente
              </Button>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Modal confirmación */}
      <Modal isOpen={confirmModalOpen} toggle={toggleConfirmModal} size="lg">
        <ModalHeader toggle={toggleConfirmModal}>
          {selectedPilotIndex !== null ? 'Ficha del piloto' : 'Ficha de escudería'}
        </ModalHeader>
        <ModalBody>
          {selectedPilot && (
            <div className="driver-detail">
              <div className="driver-info">
                <h3>
                  {selectedPilotIndex !== null
                    ? `${(selectedPilot as Driver).forename} ${(selectedPilot as Driver).surname} ${(selectedPilot as Driver).code && `(${(selectedPilot as Driver).code})`}`
                    : (selectedPilot as Constructor).name}
                </h3>
                {selectedPilotIndex !== null ? (
                  <>
                    <p><strong>Nacionalidad:</strong> {(selectedPilot as Driver).nationality}</p>
                    <p><strong>Número:</strong> {(selectedPilot as Driver).number}</p>
                    <p><strong>Carreras:</strong> {(selectedPilot as Driver).nRaces}</p>
                    <p><strong>Victorias:</strong> {(selectedPilot as Driver).nRacesWon}</p>
                    <p><strong>Podiums:</strong> {(selectedPilot as Driver).nPodiums}</p>
                    <p><strong>Head-to-head:</strong> {(selectedPilot as Driver).h2hrW}W - {(selectedPilot as Driver).h2hrL}L</p>
                  </>
                ) : (
                  <p><strong>Nacionalidad:</strong> {(selectedPilot as Constructor).nationality}</p>
                )}
                <Button color="primary" onClick={confirmAddPilot}>
                  Añadir
                </Button>
              </div>

              <div className="driver-photo">
                <img
                  src={`/assets/${selectedPilotIndex !== null ? 'drivers' : 'constructors'}/${selectedPilotIndex !== null ? (selectedPilot as Driver).driverId : (selectedPilot as Constructor).constructorId}.WEBP`}
                  alt={selectedPilotIndex !== null
                    ? `${(selectedPilot as Driver).forename} ${(selectedPilot as Driver).surname}`
                    : (selectedPilot as Constructor).name}
                />
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    </LayoutCanvas>
  );
}

export default F1;
