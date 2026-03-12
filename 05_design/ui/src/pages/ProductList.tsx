import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, CircularProgress, Alert } from '@mui/material';
import { getProducts, deleteProduct } from '../services/api';
import { Product } from '../models/Product';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    console.log("Attempting to fetch products...");
    try {
      const data = await getProducts();
      console.log("Successfully fetched products:", data);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError("Failed to fetch products. Is the backend server running?");
    } finally {
      setLoading(false);
      console.log("Finished fetching products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      fetchProducts(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>
      <Button component={Link} to="/create" variant="contained" color="primary" style={{ marginBottom: '20px' }}>
        Create Product
      </Button>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Link to={`/products/${product.id}`}>{product.name}</Link>
                </TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell align="right">
                  <IconButton component={Link} to={`/edit/${product.id}`} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product.id)} color="secondary">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ProductList;
