// src/utils/localStorageUtils.js

// Función para obtener el número de la semana del año
export const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // Ajusta el domingo de 0 a 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Función para obtener el inicio de la semana (Lunes)
export const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para que el Lunes sea el primer día (0)
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0); // Establece la hora a las 00:00:00.000
    return startOfWeek;
};

// Función para obtener los nombres de los días de la semana en el orden que necesitamos
// Lunes (0) a Domingo (6)
export const getDiasSemanaNombres = () => {
    return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
};

// Función para obtener el índice del día actual (Lunes = 0, Domingo = 6)
export const getDiaActualIndex = () => {
    const today = new Date();
    const day = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    // Convierte el día de JS (Domingo=0) a nuestro formato (Lunes=0)
    return day === 0 ? 6 : day - 1;
};

// <--- AÑADE ESTA FUNCIÓN AQUÍ (o donde quieras, pero asegúrate de que esté)
export const getTodayFormattedDate = () => {
    const today = new Date();
    // Retorna la fecha en formato 'YYYY-MM-DD'
    return today.toISOString().split('T')[0];
};
// <--- FIN DE LA FUNCIÓN AÑADIDA


// Función para cargar datos de localStorage
export const cargarDatos = (key, valorPorDefecto) => {
    try {
        const data = localStorage.getItem(key);
        if (data === null) {
            console.log(`No se encontraron datos para la clave '${key}'. Usando valor por defecto.`);
            return valorPorDefecto;
        }
        // Intentar parsear y luego limpiar el objeto para evitar referencias de Chart.js o React
        const parsedData = JSON.parse(data);
        const cleanedData = JSON.parse(JSON.stringify(parsedData));
        console.log(`Datos cargados de '${key}':`, cleanedData);
        return cleanedData;
    } catch (error) {
        console.error(`Error al cargar datos de localStorage para la clave '${key}':`, error);
        return valorPorDefecto;
    }
};

// Función para guardar datos en localStorage
export const guardarDatos = (key, data) => {
    try {
        // Limpiar el objeto antes de guardar para evitar referencias cíclicas o de Chart.js/React
        const dataToStore = JSON.parse(JSON.stringify(data));
        localStorage.setItem(key, JSON.stringify(dataToStore));
        console.log(`Datos guardados en localStorage para la clave '${key}'.`);
    } catch (error) {
        console.error(`Error al guardar datos en localStorage para la clave '${key}':`, error);
    }
};