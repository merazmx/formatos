document.addEventListener('DOMContentLoaded', () => {
    // URLs for the HTML snippets
    const formUrl = 'templates/form.html';
    const templateUrl = 'templates/rayosx.html'; // Load rayosx template by default

    // Target container IDs
    const formContainerId = 'form-container';
    const templateContainerId = 'template-container';

    // Function to load HTML content from a URL into a target element
    async function loadHTML(url, targetElementId) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = html;
            } else {
                console.error(`Target element #${targetElementId} not found.`);
            }
        } catch (error) {
            console.error(`Could not load HTML from ${url}:`, error);
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = `<p class="text-red-500">Error al cargar contenido desde ${url}.</p>`;
            }
        }
    }

    // Function to initialize the application after HTML is loaded
    function initializeApp() {
        // --- Get references AFTER HTML is loaded ---
        const form = document.getElementById('pdf-form'); // Ensure form exists
        const updateButton = document.getElementById('update-button');

        // Input fields
        const nombreInput = document.getElementById('nombre');
        const nssInput = document.getElementById('nss');
        const diagnosticoInput = document.getElementById('diagnostico');
        const camaInput = document.getElementById('cama'); // Input for Cama
        const medicoSelect = document.getElementById('medico'); // Changed to select
        const fechaInput = document.getElementById('fecha');
        const horaInput = document.getElementById('hora');
        const ordinarioRadio = document.getElementById('ordinario');
        const urgenteRadio = document.getElementById('urgente');

        // Display spans in the PDF representation
        const nombreDisplay = document.getElementById('pdf-nombre');
        const nssDisplay = document.getElementById('pdf-nss');
        const diagnosticoDisplay = document.getElementById('pdf-diagnostico');
        const camaDisplay = document.getElementById('pdf-cama'); // Display for Cama
        const medicoDisplay = document.getElementById('pdf-medico'); // Display for Medico
        const fechaDisplay = document.getElementById('pdf-fecha');
        const horaDisplay = document.getElementById('pdf-hora');
        const ordinarioDisplay = document.getElementById('pdf-ordinario'); // Display for Ordinario
        const urgenteDisplay = document.getElementById('pdf-urgente'); // Display for Urgente

        // --- Check if all critical elements were found ---
        // Updated check for medicoSelect
        if (!form || !updateButton || !nombreInput || !nombreDisplay ||
            !camaInput || !medicoSelect || !fechaInput || !horaInput ||
            !ordinarioRadio || !urgenteRadio || !camaDisplay || !medicoDisplay ||
            !fechaDisplay || !horaDisplay || !ordinarioDisplay || !urgenteDisplay
            /* ... add checks for other critical elements */) {
            console.error("Error: No se pudieron encontrar todos los elementos necesarios en el DOM después de cargar.");
            const appContainer = document.getElementById('app-container');
            if (appContainer) {
                appContainer.innerHTML = '<p class="text-red-600 font-bold text-center">Error crítico al inicializar la aplicación. Faltan elementos HTML.</p>';
            }
            return; // Stop initialization
        }

        // --- Set Current Date and Time ---
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            fechaInput.value = formattedDate;
            horaInput.value = formattedTime;
        } catch (error) {
            console.error("Error setting current date and time:", error);
        }

        // --- Update Function ---
        function updatePdfView() {
            // Get values from the inputs/select
            const nombreValue = nombreInput.value.trim() || '[Nombre del paciente]';
            const nssValue = nssInput.value.trim() || '[Número de Seguridad Social]';
            const diagnosticoValue = diagnosticoInput.value.trim() || '[Diagnóstico médico]';
            const camaValue = camaInput.value.trim(); // Get value, default is empty if input is empty
            const medicoValue = medicoSelect.value || '[Nombre y Matrícula Médico]'; // Get selected value from dropdown
            const fechaValue = fechaInput.value;
            const horaValue = horaInput.value;

            // Update the text content of the display spans
            nombreDisplay.textContent = nombreValue;
            nssDisplay.textContent = nssValue;
            diagnosticoDisplay.textContent = diagnosticoValue;
            // Update Cama: Show empty string if input is empty, otherwise show value.
            // The CSS rule .pdf-field:empty::before adds a non-breaking space if empty.
            camaDisplay.textContent = camaValue;
            medicoDisplay.textContent = medicoValue;

            // Format date if selected
            if (fechaValue) {
                try {
                    // Input type="date" provides value in YYYY-MM-DD format, which is safe for Date constructor
                    // Adding T00:00:00 avoids potential timezone issues when only extracting day/month/year
                    const dateObj = new Date(fechaValue + 'T00:00:00');
                     // Check if date is valid after parsing
                    if (isNaN(dateObj.getTime())) {
                       throw new Error("Invalid date value parsed");
                    }
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                    const year = dateObj.getFullYear();
                    fechaDisplay.textContent = `${day}/${month}/${year}`;
                } catch (e) {
                    console.error("Error formatting date:", e);
                    fechaDisplay.textContent = '[Fecha inválida]';
                }
            } else {
                fechaDisplay.textContent = '[DD/MM/AAAA]';
            }

            // Format time if selected
            horaDisplay.textContent = horaValue || '[HH:MM]';

            // Update the Ordinario/Urgente display based on radio button selection
            // Changed display text to "XXX"
            if (ordinarioRadio.checked) {
                ordinarioDisplay.textContent = 'XXX'; // Changed from XXXXXXXXX
                urgenteDisplay.textContent = '';
            } else if (urgenteRadio.checked) {
                ordinarioDisplay.textContent = '';
                urgenteDisplay.textContent = 'XXX'; // Changed from X
            } else {
                // Default case
                ordinarioDisplay.textContent = 'XXX'; // Changed from XXXXXXXXX
                urgenteDisplay.textContent = '';
            }
        }

        // --- Attach Event Listener ---
        updateButton.addEventListener('click', updatePdfView);

        // --- Initial Update ---
        updatePdfView();

        console.log("Aplicación inicializada correctamente.");
    }

    // --- Load HTML and then Initialize ---
    Promise.all([
        loadHTML(formUrl, formContainerId),
        loadHTML(templateUrl, templateContainerId)
    ]).then(() => {
        initializeApp();
    }).catch(error => {
         console.error("Error loading initial HTML templates:", error);
         const appContainer = document.getElementById('app-container');
         if(appContainer) {
             appContainer.innerHTML = '<p class="text-red-600 font-bold text-center">Error al cargar los componentes de la aplicación.</p>';
         }
    });

}); // End DOMContentLoaded
