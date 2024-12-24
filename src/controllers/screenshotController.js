const sharp = require("sharp");
const fs = require('fs');
const path = require("path");
const {sendMessage } = require("../services/discordWebhook");
const { ExifTool } = require('exiftool-vendored');


exports.uploadScreenshot = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const uploadedFilePath = req.file.path;
    
    // Ensure the output file has a .jpg extension after conversion
    const outputFilePath = `uploads/screenshots/min-${req.file.filename.replace(path.extname(req.file.filename), '.jpg')}`;

    try {
        let parsedData;
        const jsonData = req.body.jsonData;
        
        try {
            parsedData = JSON.parse(jsonData);
        } catch (err) {
            console.log('Error parsing JSON data:', err);
            return res.status(400).send('Invalid JSON data.');
        }

        if (parsedData && parsedData.username) {
            // Step 1: Minimize the image with sharp (convert it to JPEG)
            await sharp(uploadedFilePath)
                .jpeg({ quality: 70 })
                .toFile(outputFilePath);

            // Step 2: Add custom metadata using ExifTool
            const exiftool = new ExifTool();

            try {
                const writeMetadata = await exiftool.write(outputFilePath, {
                    'UserComment': JSON.stringify({
                        username: parsedData.username,
                        server_address: parsedData.server_address,
                        world_name: parsedData.world_name,
                        coordinates: parsedData.coordinates,
                        facing_direction: parsedData.facing_direction,
                        biome: parsedData.biome,
                    })
                });

                console.log('Metadata added successfully:', writeMetadata);
            } catch (err) {
                console.error('Error adding metadata:', err);
                return res.status(500).send('Error adding metadata.');
            } finally {
                await exiftool.end();
            }

            // Step 3: Delete the original uploaded file (keep only the minimized version)
            fs.unlinkSync(uploadedFilePath);

            console.log(`Uploaded file minimized to: ${outputFilePath}`);

            // Generate the screenshot URL (to send in the response or use elsewhere)
            const screenshotUrl = process.env.BASE_URL + "/" + outputFilePath;

            // Send the screenshot URL and parsed data to the desired destination
            sendMessage(screenshotUrl, parsedData.username, parsedData.server_address, formatWorldName(parsedData.world_name), parsedData.coordinates, parsedData.facing_direction, parsedData.biome);

            // Send a success response
            res.status(200).send('File uploaded and minimized successfully.');
        } else {
            return res.status(400).send('Invalid or missing username.');
        }
    } catch (error) {
        console.error('Error processing file:', error);
        return res.status(500).send('Error processing file.');
    }
};

function formatWorldName(biome) {
    const name = biome.split(':')[1];
    
    const formattedName = name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return formattedName;
}
exports.deleteScreenshot =  (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join('uploads/screenshots/', filename);

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete file' });
            }
            res.json({ message: 'File deleted successfully', success: true });
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
}

exports.getScreenshots = (req, res) => {
    const imagesDir = path.join(__dirname, './uploads/screenshots');

    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }

        const images = files.filter(file => {
            return file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif');
        });

        res.render('screenshots', { images });
    });
}

exports.getRandomScreenshot = (req, res) => {
    const screenshotsDir = 'uploads/screenshots'
    fs.readdir(screenshotsDir, (err, files) => {
        if (err) {
            console.error('Failed to read directory:', err);
            return res.status(500).send('Interal Server Error');
        }

        const pngFiles = files.filter(file => file.endsWith('.png'));

        if (pngFiles.length === 0) {
            return res.status(404).send('No Screenshots found');
        }

        const randomFile = pngFiles[Math.floor(Math.random() * pngFiles.length)];
        const filePath = path.join(screenshotsDir, randomFile);

        res.sendFile(filePath, { root: path.resolve() }, err => {
            if (err) {
                console.error('Failed to send file: ', err);
                res.status(500).send('Internal Server Error while sending file');
            }
        });
    });
}