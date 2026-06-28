import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>🚀 LinkGol — Traductor Invisible</h1>
      <p>Ligar, vender o negociar — nunca fue tan fácil.</p>
      <button onClick={() => setCount((count) => count + 1)}>
        Count is {count}
      </button>
    </div>
  )
}

export default App
