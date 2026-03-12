import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
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
  Tooltip,
  Typography,
} from '@mui/material';
import { getProducts, deleteProduct, updateProduct } from '../services/api';
import type { Product } from '../models/Product';
import { AddCircleOutline as AddCircleOutlineIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);
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

  const handleAddToCart = async (productId: number) => {
    const selectedProduct = products.find((product) => product.id === productId);
    if (!selectedProduct || selectedProduct.stock <= 0) {
      return;
    }

    setUpdatingProductId(productId);
    setError(null);

    try {
      const updatedProduct = await updateProduct(productId, { stock: selectedProduct.stock - 1 });
      setProducts((currentProducts) =>
        currentProducts.map((product) => (product.id === productId ? updatedProduct : product))
      );

      setCartItems((currentCartItems) => {
        const existingCartItem = currentCartItems.find((cartItem) => cartItem.productId === productId);
        if (existingCartItem) {
          return currentCartItems.map((cartItem) =>
            cartItem.productId === productId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
          );
        }

        return [
          ...currentCartItems,
          {
            productId: updatedProduct.id,
            name: updatedProduct.name,
            price: updatedProduct.price,
            quantity: 1,
          },
        ];
      });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      setError('Failed to add product to cart.');
    } finally {
      setUpdatingProductId(null);
    }
  };

  const totalCartItems = cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
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
                    <Tooltip title={product.stock > 0 ? 'Add to cart' : 'Out of stock'}>
                      <span>
                        <IconButton
                          aria-label={`add ${product.name} to cart`}
                          onClick={() => handleAddToCart(product.id)}
                          color="success"
                          disabled={product.stock <= 0 || updatingProductId === product.id}
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <IconButton aria-label={`edit ${product.name}`} component={Link} to={`/edit/${product.id}`} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label={`delete ${product.name}`} onClick={() => handleDelete(product.id)} color="secondary">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          width: { xs: 'calc(100% - 32px)', sm: 340 },
          zIndex: 1200,
        }}
      >
        <Paper elevation={8} sx={{ p: 2, maxHeight: 320, overflowY: 'auto' }}>
          <Typography variant="h6">Cart</Typography>
          <Typography variant="body2" color="text.secondary">
            Items: {totalCartItems}
          </Typography>
          <Divider sx={{ my: 1 }} />
          {cartItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Your cart is empty.
            </Typography>
          ) : (
            <List dense disablePadding>
              {cartItems.map((cartItem) => (
                <ListItem
                  key={cartItem.productId}
                  disableGutters
                  secondaryAction={<Chip size="small" label={`x${cartItem.quantity}`} color="primary" />}
                >
                  <ListItemText primary={cartItem.name} secondary={`$${cartItem.price}`} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default ProductList;
