import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, TextField, Typography } from '@mui/material';
import { getProduct, updateProduct } from '../services/api';
import { ProductUpdateDTO } from '../models/Product';

const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const product = await getProduct(parseInt(id, 10));
          setName(product.name);
          setPrice(product.price.toString());
          setDescription(product.description || '');
          setStock(product.stock.toString());
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (id) {
      const updatedProduct: ProductUpdateDTO = {
        name,
        price: parseFloat(price),
        description,
        stock: parseInt(stock, 10),
      };
      try {
        await updateProduct(parseInt(id, 10), updatedProduct);
        navigate('/');
      } catch (error) {
        console.error('Error updating product:', error);
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Product
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Update
        </Button>
      </form>
    </Container>
  );
};

export default ProductEdit;