import { notifications } from '@mantine/notifications'; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

/**
 * Función auxiliar para convertir un array de objetos a formato CSV.
 * @param {Array<Object>} data El array de objetos a convertir.
 * @param {Array<string>} headers Un array opcional de strings para los encabezados.
 * @returns {string} El contenido del archivo CSV.
 */
const convertToCsv = (data, headers) => {
    if (!data || data.length === 0) return '';

    // Si no se proporcionan encabezados, usar las claves del primer objeto
    const actualHeaders = headers || Object.keys(data[0]);

    // Crear la fila de encabezados y escapar comillas
    const headerRow = actualHeaders.map(header => `"${header}"`).join(',');

    // Crear las filas de datos
    const dataRows = data.map(row =>
        actualHeaders.map(header => {
            const value = row[header];
            // Asegurarse de que los valores sean seguros para CSV (manejar comas, comillas, saltos de línea)
            const stringValue = String(value).replace(/"/g, '""'); // Escapar comillas dobles
            return `"${stringValue}"`;
        }).join(',')
    );

    return [headerRow, ...dataRows].join('\n');
};

/**
 * Función para exportar datos específicos (ej. tareas, finanzas) a un archivo CSV.
 * @param {Array<Object>} data Los datos que se van a exportar.
 * @param {string} filename El nombre base del archivo a descargar.
 * @param {Array<string>} headers Un array opcional de strings para los encabezados del CSV.
 */
export const exportDataToCsv = (data, filename, headers = null) => {
    try {
        if (!data || data.length === 0) {
            notifications.show({
                title: 'No hay datos para exportar',
                message: `No se encontraron datos para "${filename}".`,
                color: 'orange',
            });
            return;
        }

        const csvContent = convertToCsv(data, headers);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        notifications.show({
            title: 'Datos Exportados',
            message: `"${filename}" exportado con éxito como archivo CSV.`,
            color: 'green',
        });
    } catch (error) {
        console.error(`Error al exportar ${filename} a CSV:`, error);
        notifications.show({
            title: 'Error al Exportar',
            message: `No se pudieron exportar los datos de "${filename}" a CSV.`,
            color: 'red',
        });
    }
};

/**
 * Exporta datos a un archivo XLSX con formato y tabla.
 * @param {Array<Object>} data El array de objetos a exportar.
 * @param {string} filename El nombre del archivo sin extensión.
 * @param {string} sheetName El nombre de la hoja en el archivo de Excel.
 */
export const exportToXlsx = (data, filename, sheetName = 'Datos') => {
    try {
        if (!data || data.length === 0) {
            notifications.show({
                title: 'No hay datos para exportar',
                message: 'No se encontraron datos para exportar.',
                color: 'orange',
            });
            return;
        }

        // Crear un nuevo libro de trabajo
        const wb = XLSX.utils.book_new();

        // Convertir el array de objetos a una hoja de trabajo (worksheet)
        const ws = XLSX.utils.json_to_sheet(data);

        // Opcional: ajustar el ancho de las columnas
        const colWidths = Object.keys(data[0]).map(key => ({
            wch: Math.max(10, key.length + 2, 
                ...data.map(item => String(item[key]).length + 2)
            )
        }));
        ws['!cols'] = colWidths;

        // Añadir la hoja de trabajo al libro
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Convertir el libro a un objeto binario
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Usar file-saver para descargar el archivo
        const finalFilename = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        saveAs(blob, finalFilename);

        notifications.show({
            title: 'Datos Exportados',
            message: `Tus datos han sido exportados con éxito como archivo de Excel.`,
            color: 'green',
        });

    } catch (error) {
        console.error("Error al exportar a XLSX:", error);
        notifications.show({
            title: 'Error al Exportar',
            message: 'No se pudieron exportar los datos a Excel.',
            color: 'red',
        });
    }
};

/**
 * Exporta datos a un archivo XLSX con formato de tabla simple y estilos.
 * @param {Array<Object>} data El array de objetos a exportar.
 * @param {string} filename El nombre del archivo sin extensión.
 * @param {string} sheetName El nombre de la hoja en el archivo de Excel.
 */
export const exportToXlsxWithStyle = (data, filename, sheetName = 'Datos') => {
    try {
        if (!data || data.length === 0) {
            notifications.show({
                title: 'No hay datos para exportar',
                message: 'No se encontraron datos para exportar.',
                color: 'orange',
            });
            return;
        }

        const wb = XLSX.utils.book_new();

        // Convertir el array de objetos a una hoja de trabajo
        const ws = XLSX.utils.json_to_sheet(data, { 
            header: Object.keys(data[0]) 
        });

        // Crear una tabla estructurada en Excel
        const tableRange = XLSX.utils.decode_range(ws['!ref']);
        const tableRef = XLSX.utils.encode_range(tableRange);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        
        // --- Aplicar estilos (bordes y colores) ---
        // Estilo para los encabezados
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4285F4" } }, // Azul de Google
            border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        };

        // Estilo para el resto de las celdas
        const cellStyle = {
            border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        };

        // Recorrer las celdas para aplicar los estilos
        for (let R = tableRange.s.r; R <= tableRange.e.r; ++R) {
            for (let C = tableRange.s.c; C <= tableRange.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;

                // Aplicar estilo de encabezado si es la primera fila
                if (R === 0) {
                    ws[cellAddress].s = headerStyle;
                } else {
                    ws[cellAddress].s = cellStyle;
                }
            }
        }
        
        // Ajustar el ancho de las columnas
        const colWidths = Object.keys(data[0]).map(key => ({
            wch: Math.max(12, key.length, 
                ...data.map(item => String(item[key]).length)
            ) + 2
        }));
        ws['!cols'] = colWidths;

        // Añadir la tabla a la hoja
        ws['!autofilter'] = { ref: tableRef };

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const finalFilename = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        saveAs(blob, finalFilename);

        notifications.show({
            title: 'Datos Exportados',
            message: `Tus datos han sido exportados con éxito como archivo de Excel.`,
            color: 'green',
        });

    } catch (error) {
        console.error("Error al exportar a XLSX:", error);
        notifications.show({
            title: 'Error al Exportar',
            message: 'No se pudieron exportar los datos a Excel.',
            color: 'red',
        });
    }
};
