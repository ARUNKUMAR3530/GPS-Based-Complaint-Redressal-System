import axios from 'axios';

// Get address from coordinates using OpenStreetMap Nominatim API
export const getAddressFromCoords = async (latitude, longitude) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        return response.data.display_name;
    } catch (error) {
        console.error("Error fetching address:", error);
        return "Address not available";
    }
};

export const addWatermarkToImage = (file, latitude, longitude, address) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                // 1. Draw the original image
                ctx.drawImage(img, 0, 0);

                // --- STAMP LOGIC START ---

                // Scaling factors
                const fontSize = Math.max(24, img.width * 0.035); // Base font size
                const lineHeight = fontSize * 1.5;
                const padding = fontSize * 1.5;

                // Text Content
                const timestamp = new Date().toLocaleString();
                const coordsText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
                const addressText = address || "Address not available";

                // Measure text
                ctx.font = `bold ${fontSize}px Arial`;

                // Calculate overlay height based on 3 lines of text
                const overlayHeight = (lineHeight * 3) + (padding * 2);

                // 2. Draw Semi-Transparent Black Background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // 60% opacity black
                ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);

                // 3. Draw Text (White)
                ctx.fillStyle = 'white';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';

                // Positioning (Start from bottom-left with padding)
                const startX = padding;
                let currentY = canvas.height - padding;

                // Line 3: Timestamp
                ctx.fillText(`Time: ${timestamp}`, startX, currentY);
                currentY -= lineHeight;

                // Line 2: Coordinates
                ctx.fillText(coordsText, startX, currentY);
                currentY -= lineHeight;

                // Line 1: Address (Truncate if too long)
                const maxWidth = canvas.width - (padding * 2);
                let displayAddress = addressText;
                // Simple truncation logic
                if (ctx.measureText(displayAddress).width > maxWidth) {
                    // Approximate char count fit
                    const avgCharWidth = fontSize * 0.6;
                    const maxChars = Math.floor(maxWidth / avgCharWidth);
                    displayAddress = addressText.substring(0, maxChars) + "...";
                }
                ctx.fillText(`Loc: ${displayAddress}`, startX, currentY);

                // --- STAMP LOGIC END ---

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.85); // High quality JPEG
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
