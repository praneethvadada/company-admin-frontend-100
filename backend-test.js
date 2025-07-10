// ================================================================================================
// 8. QUICK BACKEND TEST - backend-test.js (create this file in your backend root)
// ================================================================================================

// Create this file in your backend root directory to test the endpoints:

const express = require('express');
const app = express();

// Test endpoint to verify backend is working
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      branches: '/api/admin/branches',
      domains: '/api/admin/internship-domains',
      internships: '/api/admin/internships'
    }
  });
});

// Test branches endpoint
app.get('/test/branches', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Computer Science and Engineering branch focusing on software development.',
        isActive: true,
        sortOrder: 0,
        domainCount: 3,
        internshipCount: 8,
        totalLearners: 150,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Electronics & Communication Engineering',
        code: 'ECE',
        description: 'Electronics and Communication Engineering branch.',
        isActive: true,
        sortOrder: 1,
        domainCount: 2,
        internshipCount: 5,
        totalLearners: 95,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend test server running on http://localhost:${PORT}`);
  console.log(`🔗 Test endpoints:`);
  console.log(`   - http://localhost:${PORT}/test`);
  console.log(`   - http://localhost:${PORT}/test/branches`);
});
