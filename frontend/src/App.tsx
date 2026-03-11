import React, { useEffect, useState } from 'react';
import './App.css';
import { NewsItem } from './types';

function App() {
  const [confirmed, setConfirmed] = useState<NewsItem[]>([]);
  const [unconfirmed, setUnconfirmed] = useState<NewsItem[]>([]);
  const [fake, setFake] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchAll = () => {
      fetch('http://localhost:3001/news?status=confirmed')
        .then(res => res.json())
        .then(data => setConfirmed(data))
        .catch(console.error);
      fetch('http://localhost:3001/news?status=unconfirmed')
        .then(res => res.json())
        .then(data => setUnconfirmed(data))
        .catch(console.error);
      fetch('http://localhost:3001/news?status=fake')
        .then(res => res.json())
        .then(data => setFake(data))
        .catch(console.error);
    };

    fetchAll();
    const interval = setInterval(fetchAll, 10 * 60 * 1000); // refresh every 10 minutes
    return () => clearInterval(interval);
  }, []);
    fetch('http://localhost:3001/news?status=confirmed')
      .then(res => res.json())
      .then(data => setConfirmed(data))
      .catch(console.error);
    fetch('http://localhost:3001/news?status=unconfirmed')
      .then(res => res.json())
      .then(data => setUnconfirmed(data))
      .catch(console.error);
    fetch('http://localhost:3001/news?status=fake')
      .then(res => res.json())
      .then(data => setFake(data))
      .catch(console.error);
  }, []);

  return (
    <div className="App" style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
      <section style={{ flex: 1 }}>
        <h2>✅ Verified</h2>
        <ul>
          {confirmed.map(item => (
            <li key={item.id}>
              <strong>{item.title}</strong> <em>({item.source} - {new Date(item.timestamp).toLocaleString()})</em>
            </li>
          ))}
        </ul>
      </section>
      <section style={{ flex: 1 }}>
        <h2>❓ Unconfirmed</h2>
        <ul>
          {unconfirmed.map(item => (
            <li key={item.id}>
              <strong>{item.title}</strong> <em>({item.source} - {new Date(item.timestamp).toLocaleString()})</em>
            </li>
          ))}
        </ul>
      </section>
      <section style={{ flex: 1 }}>
        <h2>🚫 False</h2>
        <ul>
          {fake.map(item => (
            <li key={item.id}>
              <strong>{item.title}</strong> <em>({item.source} - {new Date(item.timestamp).toLocaleString()})</em>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;