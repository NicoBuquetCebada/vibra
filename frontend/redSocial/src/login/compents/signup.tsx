import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/global.scss';
import { TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Signup: React.FC = () => {
  const [formValues, setFormValues] = useState({
    username: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isArtist, setIsArtist] = useState(false);
  const [errors, setErrors] = useState({
    username: false,
    name: false,
    surname: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [isDirty, setIsDirty] = useState({
    username: false,
    name: false,
    surname: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'username':
        return value.length > 0;
      case 'name':
        return /^[A-Za-z]+$/.test(value);
      case 'surname':
        return /^[A-Za-z]+$/.test(value);
      case 'email':
        return /^\S+@\S+\.\S+$/.test(value);
      case 'password':
        return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=*]).{8,}/.test(value);
      case 'confirmPassword':
        return value === formValues.password;
      default:
        return true;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormValues({ ...formValues, [field]: value });
    setIsDirty({ ...isDirty, [field]: true });
    setErrors({ ...errors, [field]: !validateField(field, value) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      username: formValues.username.length === 0 || !validateField('username', formValues.username),
      name: formValues.name.length === 0 || !validateField('name', formValues.name),
      surname: formValues.surname.length === 0 || !validateField('surname', formValues.surname),
      email: formValues.email.length === 0 || !validateField('email', formValues.email),
      password: formValues.password.length === 0 || !validateField('password', formValues.password),
      confirmPassword:
        formValues.confirmPassword.length === 0 ||
        !validateField('confirmPassword', formValues.confirmPassword),
    };

    setErrors(newErrors);
    setIsDirty({
      username: true,
      name: true,
      surname: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!Object.values(newErrors).includes(true)) {
      console.log('Formulario enviado:', formValues, isArtist);
    }
  };

  const isFormValid =
    Object.values(errors).every((error) => !error) &&
    Object.values(formValues).every((value) => value.length > 0);

  return (
    <div className="container">
      <form className="signup-card" onSubmit={handleSubmit}>
        <h1 className="title">Crear una Cuenta</h1>

        <TextField
          label="Nombre de Usuario"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formValues.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          error={errors.username}
          helperText={errors.username ? 'Campo obligatorio' : ''}
        />

        <TextField
          label="Nombre"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formValues.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          helperText={errors.name ? 'Solo se permiten letras' : ''}
        />

        <TextField
          label="Apellidos"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formValues.surname}
          onChange={(e) => handleInputChange('surname', e.target.value)}
          error={errors.surname}
          helperText={errors.surname ? 'Solo se permiten letras' : ''}
        />

        <TextField
          label="Correo Electrónico"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formValues.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          helperText={errors.email ? 'Introduce un correo válido' : ''}
        />

        <TextField
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          fullWidth
          margin="normal"
          value={formValues.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={errors.password}
          helperText={
            errors.password
              ? 'Debe contener mayúscula, minúscula, número y carácter especial'
              : ''
          }
          InputProps={{
            endAdornment: (
              <span
                style={{
                  cursor: 'pointer',
                  color: showPassword ? 'green' : 'inherit',
                  padding: '0',
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </span>
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
          error={errors.confirmPassword}
          helperText={errors.confirmPassword ? 'Las contraseñas no coinciden' : ''}
          InputProps={{
            endAdornment: (
              <span
                style={{
                  cursor: 'pointer',
                  color: showConfirmPassword ? 'green' : 'inherit',
                  padding: '0',
                }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </span>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={isArtist}
              onChange={(e) => setIsArtist(e.target.checked)}
              color="primary"
            />
          }
          label="Soy artista"
        />

        <Button
          variant="contained"
          fullWidth
          type="submit"
          disabled={!isFormValid}
        >
          Registrarse
        </Button>

        <div className="footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
