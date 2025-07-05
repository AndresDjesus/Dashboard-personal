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
export const getDiaActual = () => {
    const today = new Date();
    // Obtiene el año, mes y día
    const year = today.getFullYear();
    // getMonth() es base 0, así que sumamos 1. Agregamos '0' si es menor de 10.
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    // getDate() es el día del mes. Agregamos '0' si es menor de 10.
    const day = today.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`; // Ejemplo: "2025-07-06"
};

export const getStartOfWeek = () => {
    const today = new Date();
    const day = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para que el Lunes sea el primer día (día 1) de la semana
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0); // Establece la hora a medianoche para evitar problemas de zona horaria
    return startOfWeek; // Devuelve un objeto Date
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