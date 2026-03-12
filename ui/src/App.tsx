import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductList from './pages/ProductList';
import ProductCreate from './pages/ProductCreate';
import ProductEdit from './pages/ProductEdit';
import ProductDetail from './pages/ProductDetail';
import { CssBaseline, Container } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        <Container>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/create" element={<ProductCreate />} />
            <Route path="/edit/:id" element={<ProductEdit />} />
            <Route path="/products/:id" element={<ProductDetail />} />
          </Routes>
        </Container>
      </Router>
    </>
  );
}

export default App;