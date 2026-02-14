import { useState } from 'react';

function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Replace with actual GraphQL mutation when gateway is ready
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateUser($input: RegisterUserInput!) {
              createUser(input: $input) {
                id
                name
                email
              }
            }
          `,
          variables: {
            input: formData,
          },
        }),
      });
      const data = await response.json();
      if (data.data?.createUser) {
        setUsers([...users, data.data.createUser]);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2>Create User</h2>

      <form onSubmit={createUser} style={{ marginBottom: '30px' }}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>

      {users.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Created Users</h3>
          {users.map((user) => (
            <div key={user.id} className="card">
              <h3>{user.name}</h3>
              <p>Email: {user.email}</p>
              <p>ID: {user.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Users;
