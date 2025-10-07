import React from 'react';
import './App.css';
import Friends from './components/Friends';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mochi Friends</h1>
      </header>
      <main>
        <Friends />
      </main>
    </div>
  );
}

export default App;
