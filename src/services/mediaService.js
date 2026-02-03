// Obtiene la lista de fotos de la galería desde el backend
export const getGalleryPhotos = async () => {
  try {
    const response = await fetch('/api/gallery');
    if (!response.ok) {
      throw new Error('Failed to fetch gallery');
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getGalleryPhotos:", error);
    throw error;
  }
};


// Obtiene URLs firmadas para subir archivos (original y thumbnail)
export const getSignedUploadUrls = async (filename, originalContentType, thumbnailContentType) => {
  try {
    const response = await fetch('/api/sign-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename,
        originalContentType,
        thumbnailContentType
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload signature');
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getSignedUploadUrls:", error);
    throw error;
  }
};

//Sube el archivo directamente a S3 usando una URL firmada
export const uploadFileToS3 = async (url, file, contentType) => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType }
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }

    return response;
  } catch (error) {
    console.error("Error in uploadFileToS3:", error);
    throw error;
  }
};

// Elimina la foto (thumbnail) de S3
export const deletePhoto = async (key) => {
  try {
    const response = await fetch('/api/delete-photo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete photo');
    }

    return await response.json();
  } catch (error) {
    console.error("Error in deletePhoto:", error);
    throw error;
  }
};

// Valida la clave de administrador en el servidor
export const login = async (password) => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return response;
};
