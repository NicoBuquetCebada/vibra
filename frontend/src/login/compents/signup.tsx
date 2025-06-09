import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/global.scss';
import { TextField, Button, IconButton, InputAdornment, Stack, Box } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Logo from '../../assets/logo.png';

// Obtener la URL de la API desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://vibra';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    name: '',
    firstName: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    firstName: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateField = (field: keyof typeof formValues, value: string) => {
    let errorMessage = '';
    
    switch (field) {
      case 'name':
        if (!value) errorMessage = 'Este campo es obligatorio';
        else if (value.length < 3) errorMessage = 'Mínimo 3 caracteres';
        break;
      case 'firstName':
      case 'surname':
        if (!value) errorMessage = 'Este campo es obligatorio';
        else if (!/^[A-Za-zÁ-ÿ\s]+$/.test(value)) errorMessage = 'Solo se permiten letras';
        break;
      case 'email':
        if (!value) errorMessage = 'Este campo es obligatorio';
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) errorMessage = 'Email no válido';
        break;
      case 'password':
        if (!value) errorMessage = 'Este campo es obligatorio';
        else if (value.length < 6) errorMessage = 'Mínimo 6 caracteres';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errorMessage = 'Debe contener mayúscula, minúscula y número';
        }
        break;
      case 'confirmPassword':
        if (!value) errorMessage = 'Este campo es obligatorio';
        else if (value !== formValues.password) errorMessage = 'Las contraseñas no coinciden';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: errorMessage }));
    return !errorMessage;
  };

  const handleInputChange = (field: keyof typeof formValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validar todos los campos
    const isValid = Object.keys(formValues).every(field => 
      validateField(field as keyof typeof formValues, formValues[field as keyof typeof formValues])
    );

    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formValues.name,
          mail: formValues.email,
          firstName: formValues.firstName,
          surname: formValues.surname,
          pass: formValues.password,
        }),
      });

      if (response.status === 201) {
        alert('¡Registro exitoso! Por favor, inicia sesión.');
        navigate('/login');
        return;
      }

      // Solo intentamos parsear el JSON si la respuesta no es 201
      const data = await response.json();
      throw new Error(data.message || 'Error en el registro');
      
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        email: error instanceof Error ? error.message : 'Error en el registro',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Box className="login-card" sx={{ maxWidth: '600px !important', width: '90% !important' }}>
        <img src={Logo} alt="Logo Vibra" className="logo-img" />
        <h1>Crea una cuenta</h1>
        <p className="description">¡Únete a la comunidad musical más vibrante!</p>
        <form onSubmit={handleSubmit}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Nombre"
              variant="outlined"
              fullWidth
              value={formValues.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              disabled={loading}
            />
            <TextField
              label="Apellidos"
              variant="outlined"
              fullWidth
              value={formValues.surname}
              onChange={(e) => handleInputChange('surname', e.target.value)}
              error={!!errors.surname}
              helperText={errors.surname}
              disabled={loading}
            />
          </Stack>
          
          <TextField
            label="Correo Electrónico"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValues.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
          />

          <TextField
            label="Nombre de Usuario"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValues.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
          />

          <TextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValues.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    sx={{ 
                      bgcolor: 'transparent !important',
                      '&:hover': { 
                        bgcolor: 'transparent !important',
                        color: 'primary.main'
                      },
                      '&.MuiIconButton-root': {
                        bgcolor: 'transparent !important'
                      },
                      color: showPassword ? 'primary.main' : 'grey.600'
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirmar Contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formValues.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    sx={{ 
                      bgcolor: 'transparent !important',
                      '&:hover': { 
                        bgcolor: 'transparent !important',
                        color: 'primary.main'
                      },
                      '&.MuiIconButton-root': {
                        bgcolor: 'transparent !important'
                      },
                      color: showConfirmPassword ? 'primary.main' : 'grey.600'
                    }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button 
            variant="contained" 
            fullWidth 
            className="btn" 
            type="submit" 
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>
        <div className="footer">
          <p>
            ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
          </p>
        </div>
      </Box>
    </div>
  );
};

export default Signup;
