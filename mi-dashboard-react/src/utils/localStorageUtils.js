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

export const getStartOfWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajusta para que el Lunes sea el inicio (si es Domingo, retrocede 6 días)
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};

/**
 * Devuelve un array con los nombres abreviados de los días de la semana, empezando por Lunes.
 */
export const getDiasSemanaNombres = () => ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Devuelve el índice del día actual de la semana (0 para Lunes, 6 para Domingo).
 * Esto es diferente a getDiaActual() que devuelve 0 para Domingo.
 * Esta función está adaptada para el array que empieza en Lunes.
 */
export const getDiaActualIndex = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    return (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Si es Domingo (0), lo mapea a 6 (último índice). Si no, resta 1.
};