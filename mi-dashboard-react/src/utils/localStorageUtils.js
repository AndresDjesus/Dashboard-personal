// Función para inicializar o cargar datos de localStorage
export function cargarDatos(clave, valorPorDefecto) {
    try {
        const datosGuardados = localStorage.getItem(clave);
        return datosGuardados ? JSON.parse(datosGuardados) : valorPorDefecto;
    } catch (e) {
        console.error(`Error cargando datos de localStorage para la clave "${clave}":`, e);
        return valorPorDefecto; // Retorna el valor por defecto en caso de error
    }
}

// Función para guardar datos en localStorage
export function guardarDatos(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
    } catch (e) {
        console.error(`Error guardando datos en localStorage para la clave "${clave}":`, e);
    }
}

// Función para obtener el índice del día actual (0=Domingo, 1=Lunes, etc.)
export function getDiaActual() {
    const hoy = new Date();
    return hoy.getDay();
}