import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import './Pacientes.css';

const Pacientes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [editando, setEditando] = useState(false);
  const [extrasEditados, setExtrasEditados] = useState({});
  const [notasMedicas, setNotasMedicas] = useState([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [notaEditando, setNotaEditando] = useState(null); // índice de la nota en edición
  const [textoEditado, setTextoEditado] = useState('');

useEffect(() => {
  setTimeout(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, 100);
}, [id]);




  useEffect(() => {
    fetch(`http://localhost:5000/api/patients/${id}`)
      .then(res => res.json())
      .then(data => {
        setPaciente(data);
        setNotasMedicas([...data.notas_medicas].reverse());
      })
      .catch(err => {
        console.error("❌ Error al cargar paciente:", err);
      });
  }, [id]);

  const handleExtrasChange = (key, value) => {
    setExtrasEditados(prev => ({ ...prev, [key]: value }));
  };

  const guardarExtras = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${id}/extras`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extrasEditados)
      });

      const data = await res.json();
      if (res.ok) {
        setPaciente(prev => ({ ...prev, ...data.extras }));
        setEditando(false);
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (err) {
      console.error('❌ Error guardando extras:', err);
    }
  };

  const agregarNota = async () => {
    if (!nuevaNota.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/patients/${id}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota: nuevaNota })
      });

      const data = await res.json();
      if (res.ok) {
        setNotasMedicas([...data.notas_medicas].reverse());
        setPaciente(prev => ({ ...prev, notas_medicas: data.notas_medicas }));
        setNuevaNota('');
      } else {
        alert(data.error || 'Error al guardar la nota');
      }
    } catch (err) {
      console.error('❌ Error al agregar nota:', err);
    }
  };

const guardarNotasActualizadas = async (nuevasNotas) => {
  try {
    const res = await fetch(`http://localhost:5000/api/patients/${id}/notas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas_medicas: nuevasNotas })
    });

    const data = await res.json();
    if (res.ok) {
      setNotasMedicas(data.notas_medicas);
      setPaciente(prev => ({ ...prev, notas_medicas: data.notas_medicas }));
      setNotaEditando(null);
    } else {
      alert(data.error || 'Error al guardar');
    }
  } catch (err) {
    console.error('❌ Error actualizando notas:', err);
  }
};

const eliminarNota = (index) => {
  const nuevasNotas = [...notasMedicas];
  nuevasNotas.splice(index, 1);
  guardarNotasActualizadas(nuevasNotas);
};

const iniciarEdicion = (index) => {
  setNotaEditando(index);
  setTextoEditado(notasMedicas[index].nota);
};

const guardarEdicion = (index) => {
  const nuevasNotas = [...notasMedicas];
  nuevasNotas[index].nota = textoEditado;
  guardarNotasActualizadas(nuevasNotas);
};

const cancelarEdicion = () => {
  setNotaEditando(null);
  setTextoEditado('');
};


  if (!paciente) {
    return <div className="paciente-container">Cargando datos del paciente...</div>;
  }

  const CAMPOS_BASE = new Set([
    "id", "nombre", "edad", "genero", "telefono", "clinica_id",
    "altura_cm", "peso_kg", "tipo_sangre", "alergias", "medicamentos", "cirugias",
    "telefono_casa", "telefono_celular", "foto_url", "notas_medicas"
  ]);

  const camposExtras = Object.entries(paciente)
    .filter(([clave]) => !CAMPOS_BASE.has(clave));

  const formatearClave = (clave) =>
    clave.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="paciente-container">
      <div className="paciente-card">
        <div className="paciente-header">
          <img
  loading="eager"
  src={paciente.foto_url || "/Portrait_Placeholder.png"}
  alt={`Foto de ${paciente.nombre}`}
  className="paciente-imagen"
/>

          <h2 className="paciente-nombre">{paciente.nombre}</h2>
        </div>

        <div className="paciente-info">
          <div className="paciente-col">
            <p>Edad: {paciente.edad}</p>
            <p>Altura: {paciente.altura_cm || "No registrada"}</p>
            <p>Alergias: {paciente.alergias || "No registradas"}</p>
            <p>Peso: {paciente.peso_kg || "No registrado"}</p>
          </div>
          <div className="paciente-col">
            <p>Cirugías: {paciente.cirugias || "No registradas"}</p>
            <p>Tipo de sangre: {paciente.tipo_sangre || "No registrado"}</p>
            <p>Medicamentos: {paciente.medicamentos || "No registrados"}</p>
          </div>

          {camposExtras.length > 0 && (
            <div className="paciente-extra">
              <h3>Información adicional</h3>
              {camposExtras.map(([clave, valor]) => (
                <p key={clave}>
                  {formatearClave(clave)}: {valor || "No disponible"}
                </p>
              ))}

              {!editando ? (
                <button className="boton-editar" onClick={() => {
                  const initExtras = Object.fromEntries(camposExtras);
                  setExtrasEditados(initExtras);
                  setEditando(true);
                }}>
                  Editar información adicional
                </button>
              ) : (
                <div className="form-edicion-extras">
                  {Object.entries(extrasEditados).map(([clave, valor]) => (
                    <div key={clave}>
                      <label>{formatearClave(clave)}:</label>
                      <input
                        value={valor}
                        onChange={e => handleExtrasChange(clave, e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="botones-edicion">
                    <button className="boton-guardar" onClick={guardarExtras}>Guardar</button>
                    <button className="boton-cancelar" onClick={() => setEditando(false)}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección de notas médicas */}
        <div className="paciente-notas">
          <h3>Notas médicas</h3>
          {notasMedicas.length > 0 ? (
  <ul>
    {notasMedicas.map((item, index) => (
  <li key={index} className="nota-item">
    {notaEditando === index ? (
      <>
        <div className="nota-fecha"><strong>{item.fecha}:</strong></div>
        <textarea
          value={textoEditado}
          onChange={(e) => setTextoEditado(e.target.value)}
        />
        <div className="botones-edicion">
          <button className="boton-guardar" onClick={() => guardarEdicion(index)}>Guardar</button>
          <button className="boton-cancelar" onClick={cancelarEdicion}>Cancelar</button>
        </div>
      </>
    ) : (
      <>
        <div className="nota-fecha"><strong>{item.fecha}:</strong></div>
        <p className="nota-texto">{item.nota}</p>
        <div className="botones-edicion">
          <button className="boton-editar" onClick={() => iniciarEdicion(index)}>Editar</button>
          <button className="boton-eliminar" onClick={() => eliminarNota(index)}>Eliminar</button>
        </div>
      </>
    )}
  </li>
))}


  </ul>
) : (
  <p>No hay notas médicas registradas.</p>
)}


          <textarea
            placeholder="Escribe una nueva nota..."
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
          ></textarea>
          <button className="boton-guardar" onClick={agregarNota}>Agregar nota</button>
        </div>

        <button className="paciente-volver" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default Pacientes;
