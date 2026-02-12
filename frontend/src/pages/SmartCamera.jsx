import ReactDOM from 'react-dom';

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
                    facingMode: 'environment', // Prefer rear camera
                    // Remove ideal width/height to let browser decide best fit
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

                // 3. Create Preview URL
                setCapturedImage({
                    blob: stampedBlob,
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

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const confirmPhoto = () => {
        onCapture(capturedImage.blob, capturedImage.location, capturedImage.address);
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
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: black;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                }
                .camera-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: #000;
                }
                .camera-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
                    color: white;
                    z-index: 20;
                }
                .btn-close-camera {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(4px);
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
                    object-fit: cover;
                }
                .gps-loader, .processing-loader {
                    position: absolute;
                    bottom: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    z-index: 20;
                    backdrop-filter: blur(4px);
                }
                .camera-controls {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 2rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                    z-index: 20;
                }
                .btn-shutter {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: white;
                    border: 4px solid rgba(255,255,255,0.3);
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 0 15px rgba(0,0,0,0.3);
                }
                .btn-shutter:active {
                    transform: scale(0.9);
                }
                .btn-shutter.disabled {
                    background: #555;
                    border-color: #333;
                    cursor: not-allowed;
                }
                .review-actions {
                    display: flex;
                    gap: 2rem;
                    width: 100%;
                    justify-content: space-around;
                    max-width: 400px;
                }
                .btn-action {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 0.9rem;
                    cursor: pointer;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>,
        document.body
    );
};

export default SmartCamera;
