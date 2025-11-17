/**
 * Simple Test App
 */

function App() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ color: '#4CAF50', margin: 0, marginBottom: '1rem' }}>
          🏗️ buildApp
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Welcome to buildApp - Georgia's Construction Materials Marketplace
        </p>
        <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '1rem' }}>
          Frontend is running successfully!
        </p>
      </div>
    </div>
  );
}

export default App;
