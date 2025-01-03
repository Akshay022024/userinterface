import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import NoteList from './components/NoteList.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NoteList />
  </StrictMode>,
)

