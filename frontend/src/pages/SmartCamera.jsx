import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X, RefreshCw, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const SmartCamera = ({ onCapture, onClose }) => {
    // ... existing hooks ...
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [location, setLocation] = useState(null);

    const startCamera = async () => {
        // ... ...
        try {
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            // Start fetching location in background
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                },
                (err) => toast.error("Could not fetch location for geotag.")
            );

        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Camera access denied or not available.");
            onClose();
        }
    };

    // Start camera on mount
    React.useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const takePhoto = useCallback(async () => {
        if (!videoRef.current || !location) {
            if (!location) toast.warning("Waiting for GPS location...");
            return;
        }

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to Blob
        canvas.toBlob(async (blob) => {
            setProcessing(true);
            try {
                // 1. Get Address
                const address = await getAddressFromCoords(location.lat, location.lng);

                // 2. Add Watermark
                const stampedBlob = await addWatermarkToImage(blob, location.lat, location.lng, address);

                // 3. Create File Object
                const file = new File([stampedBlob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });

                setCapturedImage({
                    file: file,
                    previewUrl: URL.createObjectURL(stampedBlob),
                    location: location,
                    address: address
                });

                stopCamera();
            } catch (error) {
                console.error("Processing failed", error);
                toast.error("Failed to process image.");
            } finally {
                setProcessing(false);
            }

        }, 'image/jpeg');
    }, [location, stream]);

    // Helper functions
    const getAddressFromCoords = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
            console.error("Geocoding error:", error);
            // Fallback to coordinates
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    };

    const addWatermarkToImage = (blob, lat, lng, address) => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                // Draw image
                ctx.drawImage(img, 0, 0);

                // Watermark Configuration
                const fontSize = Math.max(24, canvas.width * 0.035);
                const padding = fontSize * 0.8;
                const lineHeight = fontSize * 1.4;

                // Draw semi-transparent background at bottom
                const contentHeight = (lineHeight * 2) + (padding * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(0, canvas.height - contentHeight, canvas.width, contentHeight);

                // Text settings
                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textBaseline = 'bottom';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                // Draw Address (clipped if too long)
                // ctx.fillText(address, padding, canvas.height - lineHeight - padding);
                // Better text wrapping or truncating could be added here, simplified for now:
                const timeString = new Date().toLocaleString();

                // Bottom line: Timestamp | Coords
                ctx.fillText(`${timeString} | ${lat.toFixed(6)}, ${lng.toFixed(6)}`, padding, canvas.height - padding);

                // Top line: Address
                ctx.font = `${fontSize}px sans-serif`; // slightly less bold for address
                ctx.fillText(address.substring(0, 60) + (address.length > 60 ? '...' : ''), padding, canvas.height - lineHeight - padding);

                canvas.toBlob((newBlob) => {
                    URL.revokeObjectURL(url); // Cleanup
                    resolve(newBlob);
                }, 'image/jpeg', 0.92);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(blob); // Return original on error
            };

            img.src = url;
        });
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const confirmPhoto = () => {
        onCapture(capturedImage.file, capturedImage.location, capturedImage.address);
        onClose();
    };

    return ReactDOM.createPortal(
        <div className="smart-camera-overlay">
            <div className="camera-container">
                {/* Header */}
                <div className="camera-header">
                    <button onClick={onClose} className="btn-close-camera">
                        <X color="white" />
                    </button>
                    <span className="camera-title">Smart Camera</span>
                </div>

                {/* Viewport */}
                <div className="camera-viewport">
                    {capturedImage ? (
                        <img src={capturedImage.previewUrl} alt="Captured" className="captured-preview" />
                    ) : (
                        <video ref={videoRef} autoPlay playsInline muted className="live-feed" />
                    )}

                    {/* Loading Overlay */}
                    {(!location && !capturedImage) && (
                        <div className="gps-loader">
                            <span>Acquiring GPS...</span>
                        </div>
                    )}

                    {processing && (
                        <div className="processing-loader">
                            <span>Processing Geotag...</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="camera-controls">
                    {capturedImage ? (
                        <div className="review-actions">
                            <button onClick={retake} className="btn-action btn-retake">
                                <RefreshCw /> Retake
                            </button>
                            <button onClick={confirmPhoto} className="btn-action btn-confirm">
                                <Check /> Use Photo
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={takePhoto}
                            disabled={!location}
                            className={`btn-shutter ${!location ? 'disabled' : ''}`}
                        />
                    )}
                </div>
            </div>

            <style>{`
                .smart-camera-overlay {
                    position: fixed;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    background: black;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                }
                .camera-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    background: #000;
                }
                .camera-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end; /* Close button to the right */
                    background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
                    z-index: 20;
                    pointer-events: none; /* Let clicks pass through except on button */
                }
                .camera-title {
                    display: none; /* Hide title for cleaner UI, or position absolutely if needed */
                }
                .btn-close-camera {
                    pointer-events: auto;
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    cursor: pointer;
                    padding: 10px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(8px);
                    transition: background 0.2s;
                }
                .btn-close-camera:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                .camera-viewport {
                    flex: 1;
                    position: relative;
                    background: #000;
                    overflow: hidden;
                    width: 100%;
                    height: 100%;
                }
                .live-feed, .captured-preview {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover; /* Ensures video fills screen without distortion */
                }
                .gps-loader, .processing-loader {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%); /* Center perfectly */
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 30px;
                    font-size: 1rem;
                    z-index: 30;
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .camera-controls {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 2rem;
                    padding-bottom: max(2rem, env(safe-area-inset-bottom));
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                    z-index: 20;
                }
                .btn-shutter {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: white; /* Inner circle */
                    border: 4px solid rgba(0,0,0,0.1);
                    outline: 4px solid white; /* Outer ring effect */
                    outline-offset: 4px;
                    cursor: pointer;
                    transition: transform 0.1s;
                }
                .btn-shutter:active {
                    transform: scale(0.95);
                }
                .btn-shutter.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .review-actions {
                    display: flex;
                    gap: 3rem;
                    width: 100%;
                    justify-content: center;
                    align-items: center;
                }
                .btn-action {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 12px 20px;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.9rem;
                    cursor: pointer;
                    backdrop-filter: blur(5px);
                }
                .btn-retake {
                    background: rgba(255, 59, 48, 0.2);
                    border-color: rgba(255, 59, 48, 0.4);
                }
                .btn-confirm {
                    background: rgba(52, 199, 89, 0.2);
                    border-color: rgba(52, 199, 89, 0.4);
                }
            `}</style>
        </div>,
        document.body
    );
};

export default SmartCamera;
