import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { addProductToCart, deleteProduct, getCartItems, getProducts } from '../services/api';
import type { CartItem, Product } from '../models/Product';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError('Failed to fetch products. Is the backend server running?');
    }
  };

  const fetchCart = async () => {
    try {
      const data = await getCartItems();
      setCartItems(data);
    } catch {
      setError('Failed to fetch cart items.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchProducts(), fetchCart()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      await Promise.all([fetchProducts(), fetchCart()]);
    } catch {
      setError('Error deleting product.');
    }
  };

  const handleAddToCart = async (id: number) => {
    try {
      setError(null);
      await addProductToCart(id);
      await Promise.all([fetchProducts(), fetchCart()]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail || 'Failed to add product to cart.');
        return;
      }

      setError('Failed to add product to cart.');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container sx={{ pb: 18 }}>
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
                  <IconButton
                    onClick={() => handleAddToCart(product.id)}
                    color="success"
                    disabled={product.stock <= 0}
                    title={product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
                  >
                    <AddIcon />
                  </IconButton>
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

      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          width: { xs: 'calc(100% - 32px)', sm: 340 },
          maxHeight: '45vh',
          overflowY: 'auto',
          p: 2,
          zIndex: 1100,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ShoppingCartIcon fontSize="small" />
          <Typography variant="h6">Cart ({totalCartItems})</Typography>
        </Box>

        {cartItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            The cart is empty.
          </Typography>
        ) : (
          <List dense>
            {cartItems.map((item) => (
              <ListItem key={item.id} disableGutters>
                <ListItemText
                  primary={`${item.product_name} x ${item.quantity}`}
                  secondary={`$${item.product_price} each`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default ProductList;
