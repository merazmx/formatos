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
        const camaInput = document.getElementById('cama');
        const medicoInput = document.getElementById('medico');
        const fechaInput = document.getElementById('fecha'); // Reference to date input
        const horaInput = document.getElementById('hora'); // Reference to time input
        const ordinarioRadio = document.getElementById('ordinario');
        const urgenteRadio = document.getElementById('urgente');

        // Display spans in the PDF representation
        const nombreDisplay = document.getElementById('pdf-nombre');
        const nssDisplay = document.getElementById('pdf-nss');
        const diagnosticoDisplay = document.getElementById('pdf-diagnostico');
        const camaDisplay = document.getElementById('pdf-cama');
        const medicoDisplay = document.getElementById('pdf-medico');
        const fechaDisplay = document.getElementById('pdf-fecha');
        const horaDisplay = document.getElementById('pdf-hora');
        const ordinarioDisplay = document.getElementById('pdf-ordinario');
        const urgenteDisplay = document.getElementById('pdf-urgente');

        // --- Check if all critical elements were found ---
        // Added checks for fechaInput and horaInput
        if (!form || !updateButton || !nombreInput || !nombreDisplay ||
            !fechaInput || !horaInput /* ... add checks for other critical elements */) {
            console.error("Error: No se pudieron encontrar todos los elementos necesarios en el DOM después de cargar.");
            // Display an error message to the user in the UI if desired
            const appContainer = document.getElementById('app-container');
            if (appContainer) {
                appContainer.innerHTML = '<p class="text-red-600 font-bold text-center">Error crítico al inicializar la aplicación. Faltan elementos HTML.</p>';
            }
            return; // Stop initialization
        }

        // --- Set Current Date and Time ---
        try {
            const now = new Date();

            // Format date as YYYY-MM-DD
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const day = String(now.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            // Format time as HH:MM (24-hour)
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;

            // Set the values of the input fields
            fechaInput.value = formattedDate;
            horaInput.value = formattedTime;

        } catch (error) {
            console.error("Error setting current date and time:", error);
            // Optionally inform the user or leave fields blank/default
            // fechaInput.value = ''; // Clear value on error
            // horaInput.value = ''; // Clear value on error
        }

        // --- Update Function ---
        function updatePdfView() {
            // Get values from the text/date/time inputs
            const nombreValue = nombreInput.value.trim() || '[Nombre del paciente]';
            const nssValue = nssInput.value.trim() || '[Número de Seguridad Social]';
            const diagnosticoValue = diagnosticoInput.value.trim() || '[Diagnóstico médico]';
            const camaValue = camaInput.value.trim() || '[No. Cama]';
            const medicoValue = medicoInput.value.trim() || '[Nombre y Matrícula Médico]';
            const fechaValue = fechaInput.value; // Read the value from the input
            const horaValue = horaInput.value; // Read the value from the input

            // Update the text content of the display spans
            nombreDisplay.textContent = nombreValue;
            nssDisplay.textContent = nssValue;
            diagnosticoDisplay.textContent = diagnosticoValue;
            camaDisplay.textContent = camaValue;
            medicoDisplay.textContent = medicoValue;

            // Format date if selected (using the value from the input)
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

            // Format time if selected (using the value from the input)
            // Input type="time" provides value in HH:MM format
            horaDisplay.textContent = horaValue || '[HH:MM]';

            // Update the Ordinario/Urgente display based on radio button selection
            if (ordinarioRadio.checked) {
                ordinarioDisplay.textContent = 'XXXXXXXXX';
                urgenteDisplay.textContent = '';
            } else if (urgenteRadio.checked) {
                ordinarioDisplay.textContent = '';
                urgenteDisplay.textContent = 'X';
            } else {
                // Default case if somehow neither is checked (though one is checked by default in HTML)
                ordinarioDisplay.textContent = 'XXXXXXXXX';
                urgenteDisplay.textContent = '';
            }
        }

        // --- Attach Event Listener ---
        updateButton.addEventListener('click', updatePdfView);

        // --- Initial Update ---
        // Call once to set default values based on the form's initial state (now including current date/time)
        updatePdfView();

        console.log("Aplicación inicializada correctamente.");
    }

    // --- Load HTML and then Initialize ---
    // Use Promise.all to wait for both form and template to load
    Promise.all([
        loadHTML(formUrl, formContainerId),
        loadHTML(templateUrl, templateContainerId)
    ]).then(() => {
        // Both HTML snippets have been loaded (or failed), now try to initialize
        initializeApp();
    }).catch(error => {
         console.error("Error loading initial HTML templates:", error);
         // Display a general error message if needed
         const appContainer = document.getElementById('app-container');
         if(appContainer) {
             appContainer.innerHTML = '<p class="text-red-600 font-bold text-center">Error al cargar los componentes de la aplicación.</p>';
         }
    });

}); // End DOMContentLoaded
