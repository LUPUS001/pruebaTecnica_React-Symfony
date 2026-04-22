import { useState, useRef } from 'react';

/**
 * Componente BookImport
 * Permite al usuario seleccionar un archivo JSON local e importarlo a la base de datos.
 * @param {Function} onImportSuccess - Callback que se ejecuta tras una importación exitosa para refrescar la lista.
 */
function BookImport({ onImportSuccess }) {
    const [isImporting, setIsImporting] = useState(false); // Estado para controlar si se está importando
    const fileInputRef = useRef(null); // Referencia al input de tipo file que ha seleccionado el usuario

    const handleButtonClick = () => {
        fileInputRef.current.click(); // Hacemos clic en el input de tipo file
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0]; // Obtenemos el archivo seleccionado
        if (!file) return;

        setIsImporting(true);


        /* En lugar de enviar el archivo (como un binario) directamente al servidor, lo leemos primero en el cliente con FileReader */

        const reader = new FileReader(); // Objeto que permite leer el contenido de archivos locales 

        // Cuando el archivo se carga, se ejecuta la función: 
        reader.onload = async (event) => {
            try {
                const rawContent = event.target.result; // Contenido del archivo en formato texto
                const jsonContent = rawContent.replace(/^\uFEFF/, '').trim(); // Eliminamos el BOM (Byte Order Mark) *1 y espacios en blanco

                // Validamos que sea un JSON válido antes de enviarlo
                JSON.parse(jsonContent);

                // Enviamos el JSON al endpoint /book/import
                const response = await fetch('/book/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Indicamos que enviamos datos en formato JSON
                    },
                    body: jsonContent, // Enviamos el texto del JSON procesado
                });

                const result = await response.json(); // Obtenemos la respuesta del servidor

                if (response.ok) {
                    alert(`¡Éxito! Importados: ${result.imported}, Saltados: ${result.skipped}`);
                    if (onImportSuccess) onImportSuccess();
                } else {
                    alert(`Error en el servidor: ${result.error || 'Error desconocido'}`);
                }
            } catch (error) {
                alert(`Error al procesar el archivo: ${error.message}`);
                console.error('Error de importación:', error);
            } finally {
                setIsImporting(false);
                e.target.value = ''; // Limpiamos el input
            }
        };

        reader.readAsText(file); // Leemos el archivo como texto para poder procesarlo en el cliente (convierte los bytes del archivo en una cadena de texto)
    };

    return (
        <div className="book-import-container" style={{ display: 'inline-block', marginLeft: '10px' }}>
            <input
                type="file" // Tipo de input que permite subir archivos
                accept=".json" // Solo permite archivos .json
                ref={fileInputRef} // La referencia al archivo seleccionado

                style={{ display: 'none' }}
                /* Ocultamos el input de tipo file  porque queremos que el usuario haga clic en nuestro botón personalizado ya que a este input no se le puede cambiar el estilo con CSS
                y su diseño por defecto es feo (que este input es el que usamos para subir imagenes de portada)*/
                onChange={handleFileChange}
            />
            <button
                onClick={handleButtonClick} // Hacemos clic en el input de tipo file al pulsar el botón
                className="filter-button import-button" // Aplicamos los estilos del botón de filtro y del botón de importar
                disabled={isImporting} // Deshabilitamos el botón de importar mientras se está importando
                title="Carga un archivo .json con libros" // Título que se muestra al pasar el mouse sobre el botón
            >
                {isImporting ? 'Importando...' : 'Importar JSON'} {/* Mostramos "Importando..." mientras se está importando, si no, mostramos "Importar JSON"*/}
            </button>
        </div>
    );
}

export default BookImport;


/*
*1
    - BOM (Byte Order Mark): Es una secuencia especial de caracteres que se coloca al inicio de un archivo de texto para indicar el orden de los bytes 
    y la codificación del archivo. En el caso de los archivos JSON, el BOM puede causar problemas de parsing si no se elimina antes de procesar el archivo.
    - Son caracteres invisibles que a veces Windows coloca al inicio de un archivo.

*/