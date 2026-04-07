require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const appointmentRoutes = require('./src/routes/appointments');
const adminRoutes = require('./src/routes/admin');
const doctorRoutes = require('./src/routes/doctor');
const dashboardRoutes = require('./src/routes/dashboard');
const patientRoutes = require('./src/routes/patients');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'ClinicFlow API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`ClinicFlow backend running on port ${PORT}`);
});
