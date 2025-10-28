import { useState } from 'react'
import Router from './router/Router'
import './styles/common.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router/>
    </>
  )
}

export default App
