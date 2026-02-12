import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ComplaintService from '../services/complaint.service';
import { addWatermarkToImage } from '../utils/watermarkUtils';
import { toast } from 'react-toastify';
import L from 'leaflet';
import { Camera, MapPin, X, Loader2, Send } from 'lucide-react';
import './LodgeComplaint.css';
import SmartCamera from './SmartCamera';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

const LodgeComplaint = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('ROAD');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [position, setPosition] = useState(null); // { lat, lng }
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState(''); // Kept for API compatibility
    const [showCamera, setShowCamera] = useState(false);

    const navigate = useNavigate();

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition({ lat: latitude, lng: longitude });
                    toast.success("Location fetched!");
                },
                (err) => {
                    toast.error("Error fetching location: " + err.message);
                }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
        }
    };

    const [detectedMunicipality, setDetectedMunicipality] = useState(null);

    const checkMunicipality = async (lat, lng) => {
        try {
            // Dynamically import to separate logic
            const { determineMunicipality } = await import('../utils/municipalityUtils');
            const muni = await determineMunicipality(lat, lng);
            setDetectedMunicipality(muni);
            toast.info(`Detected Zone: ${muni.name}`);
        } catch (e) {
            console.error(e);
        }
    }

    const handleCameraCapture = (blob, location, addressTxt) => {
        setImage(blob);
        setPreview(URL.createObjectURL(blob));
        setPosition(location);
        setAddress(addressTxt);
        checkMunicipality(location.lat, location.lng);
        toast.success("Photo captured and geotagged!");
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!position) {
                toast.warning("Please fetch location first to watermark the image!");
                return;
            }

            try {
                // Fetch address for manual upload too if available
                let addr = address;
                if (!addr) {
                    addr = await import('../utils/watermarkUtils').then(m => m.getAddressFromCoords(position.lat, position.lng));
                    setAddress(addr);
                }

                const watermarkedBlob = await addWatermarkToImage(file, position.lat, position.lng, addr);
                setImage(watermarkedBlob);
                setPreview(URL.createObjectURL(watermarkedBlob));

                checkMunicipality(position.lat, position.lng);

            } catch (err) {
                console.error(err);
                toast.error("Failed to process image");
            }
        }
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!position) {
            toast.error("Location is required!");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('latitude', position.lat);
        formData.append('longitude', position.lng);
        if (address) formData.append('address', address);
        if (image) formData.append('image', image, 'complaint.jpg');

        try {
            await ComplaintService.createComplaint(formData);
            toast.success("Complaint lodged successfully!");
            navigate('/dashboard');
        } catch (error) {
            toast.error("Failed to lodge complaint: " + (error.response?.data?.message || "Error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lodge-complaint-container">
            {showCamera && (
                <SmartCamera
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
            <header className="lodge-header">
                <h2>Report a New Issue</h2>
                <p>Submit details about civic problems in your area.</p>
            </header>

            <form onSubmit={handleSubmit} className="lodge-form">

                {/* Interactive Progress Bar */}
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${(title && description) ? '100%' : (title ? '66%' : '33%')}` }}></div>
                </div>

                {/* 1. Smart Photo Evidence */}
                <div className="form-section">
                    <label className="section-label">1. Smart Photo Evidence</label>
                    <div className="photo-upload-area">
                        {preview ? (
                            <div className="image-preview-container">
                                <img src={preview} alt="Evidence Preview" className="image-preview" />
                                <div className="metadata-overlay">
                                    <div className="meta-details">
                                        <span className="meta-coords">{position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : 'GPS Tagging...'}</span>
                                        <span>{new Date().toLocaleString()}</span>
                                    </div>
                                    {detectedMunicipality && (
                                        <div style={{ fontWeight: 'bold', color: '#60a5fa' }}>{detectedMunicipality.name} Zone</div>
                                    )}
                                </div>
                                <button type="button" className="remove-image-btn" onClick={removeImage}>
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <button
                                    type="button"
                                    className="btn-camera-trigger"
                                    onClick={() => setShowCamera(true)}
                                >
                                    <Camera size={20} /> Open Smart Camera
                                </button>
                                <div className="upload-text">
                                    <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>or upload from gallery</span>
                                    <label className="upload-link" style={{ marginLeft: '0.5rem' }}>
                                        Browse
                                        <input
                                            type="file"
                                            className="hidden-input-file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Intelligent Location */}
                <div className="form-section location-section">
                    <label className="section-label">2. Location Details</label>
                    <button type="button" className="location-btn" onClick={handleGetLocation}>
                        <MapPin size={18} /> Detect My Location
                    </button>

                    {position && (
                        <div className="location-detected">
                            <MapPin size={20} />
                            <div>
                                <div style={{ fontWeight: '600' }}>GPS Coordinates Captured</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</div>
                            </div>
                            {detectedMunicipality && (
                                <div style={{ marginLeft: 'auto', background: 'white', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {detectedMunicipality.name}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="map-card" style={{ height: '200px', borderRadius: '12px', marginTop: '1rem' }}>
                        <MapContainer
                            center={position || [13.0827, 80.2707]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            <LocationMarker position={position} setPosition={setPosition} />
                        </MapContainer>
                    </div>
                </div>

                {/* 3. Issue Details */}
                <div className="form-section">
                    <label className="section-label">3. Complaint Details</label>

                    <div className="form-group">
                        <label className="form-label">Issue Title</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g., Damaged Street Light"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            placeholder="Describe the problem, nearby landmarks, etc."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            className="form-control"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="ROAD">Road Maintenance</option>
                            <option value="GARBAGE">Garbage / Sanitation</option>
                            <option value="WATER">Water Supply</option>
                            <option value="ELECTRICITY">Street Lighting / Electricity</option>
                            <option value="OTHER">Other Issue</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
                        {loading ? 'Processing...' : 'Submit Report'}
                    </button>
                </div>
            </form>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default LodgeComplaint;
