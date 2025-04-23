const express = require('express');
const router = express.Router();
const db = require('./db');

// Calculate distance between two lat/lngs
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = val => (val * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

router.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;
  
    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(query, [name, address, latitude, longitude], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'School added successfully', schoolId: result.insertId });
    });
  });

// GET /listSchools
router.get('/listSchools', (req, res) => {
    const { lat, lng } = req.query;
  
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
  
    db.query('SELECT * FROM schools', (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
  
      const sorted = results.map(school => ({
        ...school,
        distance: getDistance(parseFloat(lat), parseFloat(lng), school.latitude, school.longitude)
      })).sort((a, b) => a.distance - b.distance);
  
      res.json(sorted);
    });
  });
  
  module.exports = router;