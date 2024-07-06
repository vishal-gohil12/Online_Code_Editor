import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"

import { Home } from "./pages/home"
import { Room } from "./pages/room"

function App() {
  return (
    <React.Fragment>
      <div>
        <Toaster
          position="top-right"
        ></Toaster>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  )
}

export default App
