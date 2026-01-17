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
        <Route path="/admin/media" element={<MediaDashboard />} />
        <Route path="/admin/media/upload" element={<PhotoUpload />} />
        <Route path="/admin/media/gallery" element={<PhotoGallery />} />
        {/* Public Routes for Guests */}
        <Route path="/media" element={<MediaDashboard />} />
        <Route path="/media/upload" element={<PhotoUpload />} />
        <Route path="/media/gallery" element={<PhotoGallery />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
