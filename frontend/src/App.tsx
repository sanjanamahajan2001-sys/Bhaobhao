import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import BookingHistory from './pages/BookingHistory';
// import Services from './pages/Services';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CompleteProfile from './pages/CompleteProfile';
import MinimalLayout from './components/MinimalLayout';
// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
function App() {
  return (
    <Provider store={store}>
      {/* // REACT QUERY PROVIDER */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BookingProvider>
            <Router basename={import.meta.env.BASE_URL}>
              <div className="App">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Auth />} />
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <Home />
                      </Layout>
                    }
                  />
                  <Route
                    path="/complete-profile"
                    element={
                      <MinimalLayout>
                        <CompleteProfile />
                      </MinimalLayout>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <Layout>
                        <Profile />
                      </Layout>
                    }
                  />
                  <Route
                    path="/booking"
                    element={
                      <Layout>
                        <Booking />
                      </Layout>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <Layout>
                        <BookingHistory />
                      </Layout>
                    }
                  />
                  {/* <Route
                    path="/services"
                    element={
                      <Layout>
                        <Services />
                      </Layout>
                    }
                  /> */}
                </Routes>
              </div>
            </Router>
          </BookingProvider>
        </AuthProvider>
        {/* The Devtools will only render in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}
export default App;
