import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PrivacyPolicy from './pages/PrivacyPolicy'
import CancellationPolicy from './pages/CancellationPolicy'
import TermsOfService from './pages/TermsOfService'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </Router>
  )
}

export default App
