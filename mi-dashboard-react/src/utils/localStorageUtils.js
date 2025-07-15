import { notifications } from '@mantine/notifications'; // Importar para usar notificaciones

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

// Función para cargar datos de localStorage
export const cargarDatos = (clave, valorPorDefecto) => {
    try {
        const datosGuardados = localStorage.getItem(clave);
        if (datosGuardados === null) {
            return valorPorDefecto;
        }
        return JSON.parse(datosGuardados);
    } catch (error) {
        console.error(`Error al cargar datos de ${clave} desde localStorage:`, error);
        // Mostrar una notificación de error al usuario
        notifications.show({
            title: 'Error de Carga',
            message: `No se pudieron cargar los datos de "${clave}". Se usará el valor predeterminado.`,
            color: 'red',
        });
        return valorPorDefecto;
    }
};

// Función para guardar datos en localStorage
export const guardarDatos = (clave, datos) => {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
    } catch (error) {
        console.error(`Error al guardar datos de ${clave} en localStorage:`, error);
        // Manejar el caso de que el almacenamiento esté lleno
        if (error.name === 'QuotaExceededError') {
            notifications.show({
                title: 'Espacio de Almacenamiento Lleno',
                message: 'No hay suficiente espacio para guardar más datos. Libera espacio o contacta al soporte.',
                color: 'red',
                autoClose: false, // Mantener visible hasta que el usuario la cierre
            });
        } else {
            notifications.show({
                title: 'Error al Guardar',
                message: `No se pudieron guardar los datos de "${clave}".`,
                color: 'red',
            });
        }
    }
};

// Función para borrar todos los datos de localStorage
export const clearAllData = () => {
    try {
        localStorage.clear();
        notifications.show({
            title: 'Datos Borrados',
            message: 'Todos los datos de tu dashboard han sido eliminados. Recargando...',
            color: 'green',
        });
        // Recargar la página para resetear el estado de la aplicación
        window.location.reload(); 
    } catch (error) {
        console.error("Error al borrar todos los datos de localStorage:", error);
        notifications.show({
            title: 'Error al Borrar Datos',
            message: 'No se pudieron borrar todos los datos.',
            color: 'red',
        });
    }
};

// Función para exportar todos los datos a un archivo JSON
export const exportAllData = () => {
    try {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                // Intentar parsear si es JSON, de lo contrario guardar como string
                allData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                allData[key] = localStorage.getItem(key);
            }
        }
        const dataStr = JSON.stringify(allData, null, 2); // Formatear JSON con 2 espacios de indentación
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Nombre del archivo: dashboard_data_AAAA-MM-DD.json
        a.download = `dashboard_data_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Liberar el objeto URL
        notifications.show({
            title: 'Datos Exportados',
            message: 'Tus datos han sido exportados con éxito como archivo JSON.',
            color: 'green',
        });
    } catch (error) {
        console.error("Error al exportar datos:", error);
        notifications.show({
            title: 'Error al Exportar',
            message: 'No se pudieron exportar los datos.',
            color: 'red',
        });
    }
};

// Función para importar datos desde un archivo JSON
export const importAllData = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                // Opcional: preguntar al usuario si desea sobrescribir
                // Por simplicidad, aquí limpiaremos y luego importaremos
                localStorage.clear(); 
                for (const key in importedData) {
                    if (Object.hasOwnProperty.call(importedData, key)) {
                        // Guardar cada clave-valor importado en localStorage
                        localStorage.setItem(key, JSON.stringify(importedData[key]));
                    }
                }
                notifications.show({
                    title: 'Datos Importados',
                    message: 'Los datos han sido importados con éxito. Recargando la página...',
                    color: 'green',
                });
                resolve();
                window.location.reload(); // Recargar para aplicar los datos nuevos
            } catch (error) {
                console.error("Error al importar datos:", error);
                notifications.show({
                    title: 'Error de Importación',
                    message: 'El archivo no es un JSON válido o hubo un error al importar los datos.',
                    color: 'red',
                });
                reject(error);
            }
        };
        reader.onerror = (error) => {
            notifications.show({
                title: 'Error de Lectura',
                message: 'No se pudo leer el archivo.',
                color: 'red',
            });
            reject(error);
        };
        reader.readAsText(file); // Lee el contenido del archivo como texto
    });
};