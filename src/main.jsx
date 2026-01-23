import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import AdminPanel from './pages/Admin.jsx';
import MediaDashboard from './pages/MediaDashboard.jsx';
import PhotoUpload from './pages/PhotoUpload.jsx';
import PhotoGallery from './pages/PhotoGallery.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/mediacenter" element={<MediaDashboard />} />
        <Route path="/admin/mediacenter/upload" element={<PhotoUpload />} />
        <Route path="/admin/mediacenter/gallery" element={<PhotoGallery />} />
        {/* Public Routes for Guests */}
        <Route path="/mediacenter" element={<MediaDashboard />} />
        <Route path="/mediacenter/upload" element={<PhotoUpload />} />
        <Route path="/mediacenter/gallery" element={<PhotoGallery />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
