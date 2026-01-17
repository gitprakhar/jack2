import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "@/components/HomePage"
import { NewPage } from "@/components/NewPage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-page" element={<NewPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
