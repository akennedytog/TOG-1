import React, { useEffect, useState } from 'react';
import './App.css';
import { NewsItem } from '../shared/src/types';

function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  useEffect(() => {
    fetch('http://localhost:3001/news?status=confirmed')
      .then(res => res.json())
      .then(data => setNews(data))
      .catch(console.error);
  }, []);

  return (
    <div className="App">
      <h1>Confirmed News</h1>
      <ul>
        {news.map(item => (
          <li key={item.id}>
            <strong>{item.title}</strong> <em>({item.source} - {new Date(item.timestamp).toLocaleString()})</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;