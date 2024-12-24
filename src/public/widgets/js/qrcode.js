

// Function to update form based on selected data type
function updateForm() {
    const form = document.getElementById('form');
    const type = document.getElementById('type').value;

    // Reset form
    form.innerHTML = '';

    if (type === 'text') {
        form.innerHTML = `<label for="textInput">Text:</label><input type="text" id="textInput" placeholder="Gib deinen Text ein">`;
    } else if (type === 'url') {
        form.innerHTML = `<label for="urlInput">URL:</label><input type="text" id="urlInput" placeholder="https://example.com">`;
    } else if (type === 'wifi') {
        form.innerHTML = `
                <label for="ssid">SSID:</label><input type="text" id="ssid" placeholder="WLAN-Name">
                <br><label for="password">Passwort:</label><input type="text" id="password" placeholder="WLAN-Passwort">
                <br><label for="encryption">Verschlüsselung:</label><select id="encryption">
                    <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="">Keine</option>
                </select>
            `;
    } else if (type === 'vcard') {
        form.innerHTML = `
                <label for="name">Name:</label><input type="text" id="name" placeholder="Vollständiger Name">
                <br><label for="phone">Telefon:</label><input type="text" id="phone" placeholder="Telefonnummer">
                <br><label for="email">E-Mail:</label><input type="text" id="email" placeholder="E-Mail-Adresse">
            `;
    } else if (type === 'geo') {
        form.innerHTML = `
                <label for="latitude">Breitengrad:</label><input type="text" id="latitude" placeholder="z. B. 52.5200">
                <br><label for="longitude">Längengrad:</label><input type="text" id="longitude" placeholder="z. B. 13.4050">
            `;
    } else if (type === 'email') {
        form.innerHTML = `
                <label for="emailAddress">E-Mail-Adresse:</label><input type="text" id="emailAddress" placeholder="example@example.com">
                <br><label for="subject">Betreff:</label><input type="text" id="subject" placeholder="Betreff eingeben">
            `;
    } else if (type === 'sms') {
        form.innerHTML = `
                <label for="smsNumber">Telefonnummer:</label><input type="text" id="smsNumber" placeholder="z. B. +491234567890">
                <br><label for="smsMessage">Nachricht:</label><input type="text" id="smsMessage" placeholder="Nachricht eingeben">
            `;
    } else if (type === 'calendar') {
        form.innerHTML = `
                <label for="eventTitle">Titel:</label><input type="text" id="eventTitle" placeholder="Event-Titel">
                <br><label for="startDate">Startdatum:</label><input type="datetime-local" id="startDate">
                <br><label for="endDate">Enddatum:</label><input type="datetime-local" id="endDate">
            `;
    } else if (type === 'file') {
        form.innerHTML = `<label for="fileInput">Wähle eine Datei:</label><input type="file" id="fileInput">`;
    }
}

// Function to generate QR code and open as a Blob in a new tab
function generateQRCode() {
    const type = document.getElementById('type').value;
    let data = '';

    // Gather data based on selected type
    if (type === 'text') {
        data = document.getElementById('textInput').value;
    } else if (type === 'url') {
        data = document.getElementById('urlInput').value;
        if (!data.startsWith('http')) {
            alert('Bitte eine gültige URL eingeben!');
            return;
        }
    } else if (type === 'wifi') {
        const ssid = document.getElementById('ssid').value;
        const password = document.getElementById('password').value;
        const encryption = document.getElementById('encryption').value;
        data = `WIFI:S:${ssid};T:${encryption};P:${password};;`;
    } else if (type === 'vcard') {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        data = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    } else if (type === 'geo') {
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        data = `geo:${latitude},${longitude}`;
    } else if (type === 'email') {
        const emailAddress = document.getElementById('emailAddress').value;
        const subject = document.getElementById('subject').value;
        data = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}`;
    } else if (type === 'sms') {
        const smsNumber = document.getElementById('smsNumber').value;
        const smsMessage = document.getElementById('smsMessage').value;
        data = `sms:${smsNumber}?body=${encodeURIComponent(smsMessage)}`;
    } else if (type === 'calendar') {
        const eventTitle = document.getElementById('eventTitle').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        data = `BEGIN:VEVENT\nSUMMARY:${eventTitle}\nDTSTART:${startDate.replace(/[-:]/g, '')}\nDTEND:${endDate.replace(/[-:]/g, '')}\nEND:VEVENT`;
    } else if (type === 'file') {
        const fileInput = document.getElementById('fileInput');
        if (!fileInput.files.length) {
            alert('Bitte eine Datei auswählen!');
            return;
        }
        const file = fileInput.files[0];
        const fileURL = URL.createObjectURL(file);
        data = fileURL;
    }

    // Generate the QR code as a Blob
    QRCode.toDataURL(data, { type: 'image/png' }, function (error, qrCodeDataUrl) {
        if (error) {
            console.error(error);
            return;
        }

        // Create a Blob from the data URL
        fetch(qrCodeDataUrl)
            .then(response => response.blob())
            .then(blob => {
                // Create a Blob URL and open it in a new tab
                const blobURL = URL.createObjectURL(blob);
                window.open(blobURL, '_blank');
            });
    });
}