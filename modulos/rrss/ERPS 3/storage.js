/**
 * storage.js
 * Manejo de datos en localStorage
 */

const Storage = {
  KEYS: {
    EMPLEADOS: 'cf_empleados',
    DOCUMENTOS: 'cf_documentos',
  },

  // Empleados
  getEmpleados() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.EMPLEADOS)) || [];
    } catch {
      return [];
    }
  },

  saveEmpleados(lista) {
    localStorage.setItem(this.KEYS.EMPLEADOS, JSON.stringify(lista));
  },

  addEmpleado(empleado) {
    const lista = this.getEmpleados();
    lista.push(empleado);
    this.saveEmpleados(lista);
  },

  updateEmpleado(id, datos) {
    const lista = this.getEmpleados().map(e =>
      e.id === id ? { ...e, ...datos } : e
    );
    this.saveEmpleados(lista);
  },

  deleteEmpleado(id) {
    const lista = this.getEmpleados().filter(e => e.id !== id);
    this.saveEmpleados(lista);
  },

  getEmpleadoById(id) {
    return this.getEmpleados().find(e => e.id === id) || null;
  },

  // Documentos
  getDocumentos() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.DOCUMENTOS)) || [];
    } catch {
      return [];
    }
  },

  saveDocumentos(lista) {
    localStorage.setItem(this.KEYS.DOCUMENTOS, JSON.stringify(lista));
  },

  addDocumento(doc) {
    const lista = this.getDocumentos();
    lista.push(doc);
    this.saveDocumentos(lista);
  },

  deleteDocumento(id) {
    const lista = this.getDocumentos().filter(d => d.id !== id);
    this.saveDocumentos(lista);
  },

  clearDocumentos() {
    this.saveDocumentos([]);
  },

  getDocumentoById(id) {
    return this.getDocumentos().find(d => d.id === id) || null;
  },
};
