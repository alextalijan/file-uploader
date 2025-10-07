const axios = require('axios');

async function downloadFileFromCloudinary(file, res) {
  // Fetch the file from Cloudinary
  const response = await axios.get(file.url, { responseType: 'stream' });

  // Force download with proper filename
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
  res.setHeader('Content-Type', response.headers['content-type']); // preserve file type
  response.data.pipe(res); // Sends downloaded file to the client
}

module.exports = downloadFileFromCloudinary;
