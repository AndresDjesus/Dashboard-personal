// src/utils/localStorageUtils.js

/**
 * Carga datos desde localStorage.
 * @param {string} key La clave bajo la cual se almacenan los datos.
 * @param {any} defaultValue El valor por defecto a retornar si no se encuentran datos.
 * @returns {any} Los datos cargados o el valor por defecto.
 */
export const cargarDatos = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        const parsedData = JSON.parse(item);
        // Asegurarse de que el array devuelto sea una copia limpia
        if (Array.isArray(parsedData)) {
            return parsedData.map(val => val); // Crea un nuevo array con los mismos valores
        }
        return parsedData;
    } catch (error) {
        console.error(`Error al cargar datos de ${key} desde localStorage:`, error);
        return defaultValue;
    }
};

/**
 * Guarda datos en localStorage.
 * @param {string} key La clave bajo la cual se almacenarán los datos.
 * @param {any} value Los datos a guardar.
 */
export const guardarDatos = (key, value) => {
    try {
        // Limpiar el objeto/array antes de guardar
        const cleanedValue = JSON.parse(JSON.stringify(value));
        localStorage.setItem(key, JSON.stringify(cleanedValue));
    } catch (error) {
        console.error(`Error al guardar datos en ${key} en localStorage:`, error);
    }
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD.
 * @returns {string} La fecha actual en formato "YYYY-MM-DD".
 */
export const getDiaActual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Mes + 1 y asegurar 2 dígitos
    const day = today.getDate().toString().padStart(2, '0'); // Día del mes y asegurar 2 dígitos
    return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha del Lunes de la semana actual como objeto Date.
 * Considera el Lunes como el primer día de la semana.
 * @returns {Date} Un objeto Date representando el Lunes de la semana actual a las 00:00:00.
 */
export const getStartOfWeek = () => {
    const today = new Date();
    const day = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    // Calcula la diferencia para llegar al Lunes.
    // Si hoy es Lunes (1), diff para llegar al Lunes es 0.
    // Si hoy es Domingo (0), queremos ir al Lunes de esta semana, que fue hace 6 días.
    const diff = today.getDate() - (day === 0 ? 6 : day - 1); 

    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), diff);
    startOfWeek.setHours(0, 0, 0, 0); // Establece la hora a medianoche para evitar problemas de zona horaria
    return startOfWeek;
};

/**
 * Obtiene los nombres cortos de los días de la semana, comenzando por Lunes.
 * @returns {string[]} Un array con los nombres de los días: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].
 */
export const getDiasSemanaNombres = () => {
    return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
};

/**
 * Obtiene el índice del día actual de la semana según nuestro array de nombres (0 para Lun, 6 para Dom).
 * @returns {number} El índice del día actual (0-6).
 */
export const getDiaActualIndex = () => {
    const today = new Date();
    const day = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    // Convierte el día de JS (Domingo=0) a nuestro formato (Lunes=0)
    return day === 0 ? 6 : day - 1; 
};

/**
 * Obtiene el número de semana ISO 8601 para una fecha dada.
 * @param {Date} d La fecha para la cual calcular el número de semana.
 * @returns {number} El número de semana ISO 8601.
 */
export const getWeekNumber = (d) => {
    // Copia la fecha para no modificar el original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Establece al jueves más cercano: fecha actual + 4 - número de día actual
    // Hace que el número de día del domingo sea 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Obtiene el primer día del año
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calcula las semanas completas hasta el jueves más cercano
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
};