// src/ImageUploader.js

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ImageUploader.css';
import { UploadCloud, ImageUp } from 'lucide-react'; // MODIFIED: Using Lucide icons

const API_BASE = "http://localhost:5000/api";

const ImageUploader = ({ onUploadComplete, initialImageUrl }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(initialImageUrl || null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Basic file type and size validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File is too large. Maximum size is 5MB.");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setUploadedImageUrl(res.data.imageUrl);
            onUploadComplete(res.data.imageUrl);
            toast.success("Image uploaded successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Image upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="image-uploader" onClick={() => !uploading && fileInputRef.current.click()}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg, image/webp"
                disabled={uploading}
            />
            {uploading ? (
                <div className="loader small"></div>
            ) : uploadedImageUrl ? (
                <div className="preview-container">
                    <img src={uploadedImageUrl} alt="Service preview" className="image-preview" />
                    <div className="preview-overlay">
                        <ImageUp size={24} />
                        <span>Change Image</span>
                    </div>
                </div>
            ) : (
                <div className="upload-placeholder">
                    <UploadCloud size={32} />
                    <span>Click to upload image</span>
                    <small>PNG, JPG, WEBP up to 5MB</small>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;