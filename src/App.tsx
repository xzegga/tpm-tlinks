import AppRouter from './components/AppRouter';
import { AuthContextProvider } from './context/AuthContext';
import './App.css'

function App() {
  return (
    <AuthContextProvider>
      <AppRouter />
    </AuthContextProvider>
  );
}

export default App
