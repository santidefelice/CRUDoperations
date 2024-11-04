import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';


const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseURL, supabaseKey);

console.log(supabaseURL)
console.log(supabaseKey)


const CrewmateApp = () => {
  const [crewmates, setCrewmates] = useState([]);
  const [newCrewmate, setNewCrewmate] = useState({
    name: '',
    speed: '',
    color: ''
  });
  const [isEditing, setIsEditing] = useState(null);
  const [error, setError] = useState(null);

  const colors = [
    'Red', 'Green', 'Blue', 'Purple', 
    'Yellow', 'Orange', 'Pink', 'Rainbow'
  ];

  useEffect(() => {
    fetchCrewmates();
  }, []);

  const fetchCrewmates = async () => {
    try {
      const { data, error } = await supabase
        .from('crewmates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCrewmates(data);
    } catch (err) {
      setError('Failed to fetch crewmates');
    }
  };

  const createCrewmate = async () => {
    try {
      if (!newCrewmate.name || !newCrewmate.speed || !newCrewmate.color) {
        setError('Please fill in all fields');
        return;
      }

      const { data, error } = await supabase
        .from('crewmates')
        .insert([newCrewmate])
        .select();

      if (error) throw error;

      setCrewmates([...crewmates, data[0]]);
      setNewCrewmate({ name: '', speed: '', color: '' });
      setError(null);
    } catch (err) {
      setError('Failed to create crewmate');
    }
  };

  const updateCrewmate = async (id) => {
    try {
      const { error } = await supabase
        .from('crewmates')
        .update(newCrewmate)
        .eq('id', id);

      if (error) throw error;

      setCrewmates(crewmates.map(c => 
        c.id === id ? { ...c, ...newCrewmate } : c
      ));
      setIsEditing(null);
      setNewCrewmate({ name: '', speed: '', color: '' });
    } catch (err) {
      setError('Failed to update crewmate');
    }
  };

  const deleteCrewmate = async (id) => {
    try {
      const { error } = await supabase
        .from('crewmates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCrewmates(crewmates.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete crewmate');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Create a New Crewmate</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc' }}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Enter crewmate's name"
            value={newCrewmate.name}
            onChange={(e) => setNewCrewmate({
              ...newCrewmate,
              name: e.target.value
            })}
            style={{ 
              width: '100%',
              padding: '8px',
              marginBottom: '10px'
            }}
          />
          <input
            type="number"
            placeholder="Enter speed in mph"
            value={newCrewmate.speed}
            onChange={(e) => setNewCrewmate({
              ...newCrewmate,
              speed: e.target.value
            })}
            style={{ 
              width: '100%',
              padding: '8px',
              marginBottom: '10px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setNewCrewmate({
                ...newCrewmate,
                color: color
              })}
              style={{
                margin: '5px',
                padding: '8px 16px',
                backgroundColor: newCrewmate.color === color ? '#007bff' : '#fff',
                color: newCrewmate.color === color ? '#fff' : '#000',
                border: '1px solid #ccc',
                cursor: 'pointer'
              }}
            >
              {color}
            </button>
          ))}
        </div>

        <button
          onClick={createCrewmate}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Create Crewmate
        </button>
      </div>

      <h2>Your Crewmates</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {crewmates.map(crewmate => (
          <div 
            key={crewmate.id} 
            style={{ 
              border: '1px solid #ccc', 
              padding: '15px',
              borderRadius: '4px'
            }}
          >
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{crewmate.name}</h3>
              <p style={{ margin: '5px 0' }}>Speed: {crewmate.speed} mph</p>
              <p style={{ margin: '5px 0' }}>Color: {crewmate.color}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setIsEditing(crewmate.id);
                  setNewCrewmate(crewmate);
                }}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteCrewmate(crewmate.id)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>

            {isEditing === crewmate.id && (
              <div style={{ marginTop: '15px' }}>
                <input
                  type="text"
                  placeholder="Update name"
                  value={newCrewmate.name}
                  onChange={(e) => setNewCrewmate({
                    ...newCrewmate,
                    name: e.target.value
                  })}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Update speed"
                  value={newCrewmate.speed}
                  onChange={(e) => setNewCrewmate({
                    ...newCrewmate,
                    speed: e.target.value
                  })}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px'
                  }}
                />
                <div style={{ marginBottom: '10px' }}>
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCrewmate({
                        ...newCrewmate,
                        color: color
                      })}
                      style={{
                        margin: '5px',
                        padding: '8px 16px',
                        backgroundColor: newCrewmate.color === color ? '#007bff' : '#fff',
                        color: newCrewmate.color === color ? '#fff' : '#000',
                        border: '1px solid #ccc',
                        cursor: 'pointer'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => updateCrewmate(crewmate.id)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Update Crewmate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrewmateApp;