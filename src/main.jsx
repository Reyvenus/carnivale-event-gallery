import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import PhotoUpload from './pages/PhotoUpload.jsx';
import PhotoGallery from './pages/PhotoGallery.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/upload" element={<PhotoUpload />} />
      <Route path="/gallery" element={<PhotoGallery />} />
    </Routes>
  </BrowserRouter>
);
