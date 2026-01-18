import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "@/components/HomePage"
import { NewPage } from "@/components/NewPage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewPage />} />
        <Route path="/old-page" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
