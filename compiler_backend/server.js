const express = require('express');
const cors = require('cors');
require('dotenv').config();

const compilerBackendRoutes = require('./routes/compilerBackend');

const app = express();
const PORT = process.env.COMPILER_BACKEND_PORT || 5001; // Compiler backend listens on port 5001

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Allow CORS from your Main Backend

app.get('/', (req, res) => {
    res.send('Compiler Backend Service is up and running!');
});

app.use('/api', compilerBackendRoutes); // All compiler-related routes under /api/compiler

app.listen(PORT, () => {
    console.log(`Compiler Backend listening on port ${PORT}`);
});