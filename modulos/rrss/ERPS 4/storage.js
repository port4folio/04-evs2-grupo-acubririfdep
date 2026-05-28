/**
 * storage.js
 * Capa de persistencia en localStorage para la app de Licencias Médicas.
 */

const Storage = (() => {

  const KEYS = {
    empleados : 'licencias_empleados',
    licencias : 'licencias_medicas',
  };

  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  }

  function _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /* ── EMPLEADOS ── */
  function getEmpleados()        { return _get(KEYS.empleados); }
  function addEmpleado(emp)      { const list = getEmpleados(); list.push(emp); _set(KEYS.empleados, list); }
  function deleteEmpleado(id)    {
    // También elimina sus licencias
    _set(KEYS.empleados, getEmpleados().filter(e => e.id !== id));
    _set(KEYS.licencias, getLicencias().filter(l => l.empleadoId !== id));
  }

  /* ── LICENCIAS ── */
  function getLicencias()        { return _get(KEYS.licencias); }
  function addLicencia(lic)      { const list = getLicencias(); list.push(lic); _set(KEYS.licencias, list); }
  function deleteLicencia(id)    { _set(KEYS.licencias, getLicencias().filter(l => l.id !== id)); }
  function updateLicencia(updated) {
    _set(KEYS.licencias, getLicencias().map(l => l.id === updated.id ? updated : l));
  }

  /* ── RESET ── */
  function clearAll() {
    localStorage.removeItem(KEYS.empleados);
    localStorage.removeItem(KEYS.licencias);
  }

  return {
    getEmpleados, addEmpleado, deleteEmpleado,
    getLicencias, addLicencia, deleteLicencia, updateLicencia,
    clearAll,
  };

})();
