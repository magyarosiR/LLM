import { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button, Modal, Form, Input, InputNumber, Space, message } from 'antd';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const API_URL = 'http://localhost:8000/products/';

function App() {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formInstance] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}${id}`, { 
        method: 'DELETE' 
      });
      if (!res.ok) throw new Error('Failed to delete product');
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await formInstance.validateFields();
      setLoading(true);
      
      // Convert price to number and add stock field
      const requestData = {
        ...values,
        price: Number(values.price),
        stock: 0  // Default stock value since it's required by backend
      };

      const url = editId ? `${API_URL}${editId}` : API_URL;
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Request failed');
      }

      message.success(`Product ${editId ? 'updated' : 'added'} successfully`);
      setModalOpen(false);
      setEditId(null);
      formInstance.resetFields();
      fetchProducts();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Price (Ft)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price} Ft`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            onClick={() => {
              formInstance.setFieldsValue({
                name: record.name,
                description: record.description,
                price: record.price
              });
              setEditId(record.id);
              setModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#1677ff', padding: '0 24px' }}>
        <Title style={{ color: 'white', margin: 0 }} level={2}>Product Management</Title>
      </Header>
      <Content style={{ margin: '24px' }}>
        <Button 
          type="primary" 
          onClick={() => {
            formInstance.resetFields();
            setEditId(null);
            setModalOpen(true);
          }} 
          style={{ marginBottom: 16 }}
        >
          Add New Product
        </Button>
        
        <Table 
          columns={columns} 
          dataSource={products} 
          rowKey="id" 
          loading={loading}
          pagination={false} 
          bordered 
        />

        <Modal
          title={editId ? 'Edit Product' : 'Add New Product'}
          open={modalOpen}
          onOk={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            formInstance.resetFields();
          }}
          confirmLoading={loading}
        >
          <Form form={formInstance} layout="vertical">
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: 'Please input product name' },
                { max: 100, message: 'Maximum 100 characters' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: false },
                { max: 500, message: 'Maximum 500 characters' }
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price (Ft)"
              rules={[
                { required: true, message: 'Please input price' },
                { type: 'number', min: 0, message: 'Must be positive number' }
              ]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0}
                formatter={value => `${value} Ft`}
                parser={value => value.replace(' Ft', '')}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Market App © {new Date().getFullYear()}</Footer>
    </Layout>
  );
}

export default App;