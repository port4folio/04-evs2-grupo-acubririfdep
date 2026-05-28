/**
 * documentos.js
 * Lógica de generación de contratos y finiquitos
 */

const TIPOS_CONTRATO = {
  indefinido: 'plazo indefinido',
  plazo_fijo: 'plazo fijo',
  obra_faena: 'obra o faena',
};

const Documentos = {

  /**
   * Genera el texto completo de un contrato de trabajo
   * @param {Object} empleado - Datos del trabajador
   * @param {Object} empleador - Datos de la empresa
   * @returns {string}
   */
  generarContrato(empleado, empleador) {
    const hoy = new Date().toLocaleDateString('es-CL', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const fechaInicio = new Date(empleado.inicio + 'T00:00:00').toLocaleDateString('es-CL', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const sueldoFmt = Number(empleado.sueldo).toLocaleString('es-CL');
    const tipoContrato = TIPOS_CONTRATO[empleado.tipoContrato] || empleado.tipoContrato;
    const depto = empleado.departamento ? `, perteneciente al departamento de ${empleado.departamento}` : '';
    const direccionTrabajador = empleado.direccion || 'no indicada';

    return `CONTRATO INDIVIDUAL DE TRABAJO
${'='.repeat(60)}

En ${empleador.direccion}, a ${hoy}, entre:

EMPLEADOR:
  Razón social   : ${empleador.empresa}
  RUT            : ${empleador.rutEmp}
  Representante  : ${empleador.rep}
  Domicilio      : ${empleador.direccion}
  (en adelante "el Empleador")

TRABAJADOR:
  Nombre         : ${empleado.nombre}
  RUT            : ${empleado.rut}
  Domicilio      : ${direccionTrabajador}
  Email          : ${empleado.email || 'no indicado'}
  Teléfono       : ${empleado.telefono || 'no indicado'}
  (en adelante "el Trabajador")

Se celebra el siguiente Contrato Individual de Trabajo:

${'─'.repeat(60)}
CLÁUSULA PRIMERA – NATURALEZA Y DURACIÓN
${'─'.repeat(60)}
El presente contrato es de ${tipoContrato} y rige a partir
del ${fechaInicio}.

${'─'.repeat(60)}
CLÁUSULA SEGUNDA – CARGO Y FUNCIONES
${'─'.repeat(60)}
El Trabajador se desempeñará en el cargo de ${empleado.cargo}${depto}.
Deberá cumplir con todas las tareas, responsabilidades y
funciones inherentes al cargo, así como las instrucciones
que imparta el Empleador.

${'─'.repeat(60)}
CLÁUSULA TERCERA – REMUNERACIÓN
${'─'.repeat(60)}
El Empleador pagará al Trabajador una remuneración mensual
bruta de $${sueldoFmt} (pesos chilenos), sujeta a los
descuentos legales previsionales y tributarios de ley.

El pago se realizará por mes vencido, dentro de los primeros
5 días hábiles del mes siguiente.

${'─'.repeat(60)}
CLÁUSULA CUARTA – JORNADA DE TRABAJO
${'─'.repeat(60)}
La jornada ordinaria de trabajo será de 40 horas semanales,
distribuidas de lunes a viernes, en el horario que establezca
el Empleador conforme a las necesidades del servicio.

Las horas extraordinarias serán pactadas de conformidad con
el artículo 32 del Código del Trabajo.

${'─'.repeat(60)}
CLÁUSULA QUINTA – LUGAR DE TRABAJO
${'─'.repeat(60)}
El lugar de prestación de servicios será en ${empleador.direccion},
sin perjuicio de que el Empleador pueda destinarlo temporalmente
a otras dependencias, conforme a lo dispuesto en el artículo 12
del Código del Trabajo.

${'─'.repeat(60)}
CLÁUSULA SEXTA – OBLIGACIONES DEL TRABAJADOR
${'─'.repeat(60)}
El Trabajador se obliga a:
  a) Cumplir puntual y fielmente las funciones de su cargo.
  b) Guardar absoluta reserva de la información y datos
     de la empresa y sus clientes.
  c) Respetar el Reglamento Interno de Orden, Higiene
     y Seguridad de la empresa.
  d) Mantener un comportamiento acorde a las normas de
     convivencia y respeto laboral.
  e) Comunicar de inmediato cualquier situación que pueda
     afectar el normal desarrollo de sus funciones.

${'─'.repeat(60)}
CLÁUSULA SÉPTIMA – BENEFICIOS Y DERECHOS
${'─'.repeat(60)}
El Trabajador tendrá derecho a los beneficios establecidos
por la legislación laboral vigente, incluyendo feriado anual,
licencias médicas, permiso de maternidad/paternidad y demás
derechos consagrados en el Código del Trabajo.

${'─'.repeat(60)}
CLÁUSULA OCTAVA – TÉRMINO DEL CONTRATO
${'─'.repeat(60)}
El presente contrato podrá ponerse término conforme a las
causales establecidas en los artículos 159, 160 y 161 del
Código del Trabajo, con los derechos y obligaciones que
correspondan a cada causal.

${'─'.repeat(60)}
CLÁUSULA NOVENA – LEGISLACIÓN APLICABLE
${'─'.repeat(60)}
En todo lo no previsto en este contrato, se aplicarán las
normas del Código del Trabajo, sus reglamentos y demás
legislación laboral y previsional vigente en la República
de Chile.

${'='.repeat(60)}
FIRMAS
${'='.repeat(60)}

Leído y aprobado por las partes, firman en dos ejemplares
del mismo tenor y fecha, quedando uno en poder de cada parte.


_________________________________    _________________________________
${empleador.rep.padEnd(33)}${empleado.nombre}
EMPLEADOR                            TRABAJADOR
${empleador.empresa.padEnd(33)}RUT: ${empleado.rut}
RUT: ${empleador.rutEmp}
`;
  },

  /**
   * Genera el texto completo de un finiquito laboral
   * @param {Object} empleado - Datos del trabajador
   * @param {Object} empleador - Datos de la empresa
   * @param {Object} fin - Datos específicos del finiquito
   * @returns {string}
   */
  generarFiniquito(empleado, empleador, fin) {
    const hoy = new Date().toLocaleDateString('es-CL', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const fechaTermino = new Date(fin.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const sueldoFmt = Number(empleado.sueldo).toLocaleString('es-CL');
    const indemnizacion = Number(fin.indemnizacion) || 0;
    const vacaciones   = Number(fin.vacaciones) || 0;
    const otros        = Number(fin.otros) || 0;
    const total        = indemnizacion + vacaciones + otros;

    const fechaInicio = new Date(empleado.inicio + 'T00:00:00').toLocaleDateString('es-CL', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const desglose = [
      indemnizacion ? `  - Indemnización por años de servicio  : $${indemnizacion.toLocaleString('es-CL')}` : '',
      vacaciones    ? `  - Vacaciones proporcionales           : $${vacaciones.toLocaleString('es-CL')}` : '',
      otros         ? `  - Otros haberes                       : $${otros.toLocaleString('es-CL')}` : '',
    ].filter(Boolean).join('\n') || '  - Sin haberes adicionales';

    const observaciones = fin.observaciones
      ? `\n${'─'.repeat(60)}\nCUARTO – OBSERVACIONES ESPECIALES\n${'─'.repeat(60)}\n${fin.observaciones}\n`
      : '';

    return `FINIQUITO LABORAL
${'='.repeat(60)}

En ${empleador.direccion}, a ${hoy}:

COMPARECEN:

EMPLEADOR:
  Razón social   : ${empleador.empresa}
  RUT            : ${empleador.rutEmp}
  Representante  : ${empleador.rep}
  Domicilio      : ${empleador.direccion}

TRABAJADOR:
  Nombre         : ${empleado.nombre}
  RUT            : ${empleado.rut}
  Cargo          : ${empleado.cargo}
  Remuneración   : $${sueldoFmt} brutos mensuales
  Fecha ingreso  : ${fechaInicio}
  Fecha término  : ${fechaTermino}

${'─'.repeat(60)}
PRIMERO – TÉRMINO DE LA RELACIÓN LABORAL
${'─'.repeat(60)}
Las partes ponen término a la relación laboral que las
vinculaba a contar del ${fechaTermino}, conforme a la
causal: ${fin.causalTexto}.

${'─'.repeat(60)}
SEGUNDO – LIQUIDACIÓN DE HABERES
${'─'.repeat(60)}
El Empleador pagará al Trabajador la suma total de:

  TOTAL: $${total.toLocaleString('es-CL')} (pesos chilenos)

Desglose:
${desglose}

El pago se realizará al momento de la firma del presente
instrumento, mediante los medios de pago convenidos.

${'─'.repeat(60)}
TERCERO – DECLARACIÓN DE FINIQUITO
${'─'.repeat(60)}
El Trabajador declara que:

  1. Con el pago de los montos indicados en la cláusula
     segunda, recibe completo y cabal pago de todos los
     haberes, remuneraciones, indemnizaciones, beneficios
     y derechos derivados del contrato de trabajo y de la
     legislación laboral vigente.

  2. Nada más tiene que reclamar del Empleador por concepto
     alguno relacionado con el contrato de trabajo que los
     unía, dando por terminada en forma definitiva cualquier
     obligación laboral, previsional o de otra naturaleza
     entre las partes.

  3. Renuncia a ejercer cualquier acción judicial o
     extrajudicial en contra del Empleador, sus socios,
     directivos o representantes, derivada de la relación
     laboral que existió entre las partes.
${observaciones}
${'─'.repeat(60)}
QUINTO – RATIFICACIÓN ANTE MINISTRO DE FE
${'─'.repeat(60)}
El presente finiquito deberá ser ratificado ante un Inspector
del Trabajo, Notario Público, el Presidente del Sindicato
o el Delegado del Personal, según corresponda, conforme al
artículo 177 del Código del Trabajo.

${'='.repeat(60)}
FIRMAS
${'='.repeat(60)}


_________________________________    _________________________________
${empleador.rep.padEnd(33)}${empleado.nombre}
EMPLEADOR                            TRABAJADOR
${empleador.empresa.padEnd(33)}RUT: ${empleado.rut}
RUT: ${empleador.rutEmp}


_________________________________
MINISTRO DE FE / TESTIGO
Nombre:
RUT:
Cargo:
`;
  },

  /**
   * Descarga un documento como archivo .txt
   * @param {string} contenido
   * @param {string} nombreArchivo
   */
  descargar(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Genera un nombre de archivo seguro
   */
  nombreArchivo(tipo, nombreEmpleado) {
    const nombre = nombreEmpleado.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const fecha  = new Date().toISOString().slice(0, 10);
    return `${tipo}_${nombre}_${fecha}.txt`;
  },
};
