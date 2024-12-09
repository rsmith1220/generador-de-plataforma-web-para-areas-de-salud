import React from 'react';

const Dashboard = () => {
  // Sample list of patient names
  const patients = [
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
    'John Doe',
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Patients</h1>
      <ul style={styles.list}>
        {patients.map((patient, index) => (
          <li key={index} style={styles.listItem}>
            {patient}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    fontSize: '2em',
    marginBottom: '20px',
    color: '#333',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    fontSize: '1.2em',
    color: '#555',
  },
};

export default Dashboard;
