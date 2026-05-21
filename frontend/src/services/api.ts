export const API_BASE_URL = 'http://localhost:8000/api';

export const fetchHealth = async () => {
  const res = await fetch(`http://localhost:8000/health`);
  return res.json();
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
};
