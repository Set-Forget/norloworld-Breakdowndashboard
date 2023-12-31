import React, { useState } from "react";
import TextField from "@mui/material/TextField";

const CustomTextFieldEditor = ({ id, value, onChange, onKeyDown  }) => {
  // Utiliza un estado local para manejar el valor del campo de texto
  const [localValue, setLocalValue] = useState(value);

  // Maneja el cambio en el campo de texto local y actualiza el estado local
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  // Maneja el evento onBlur para guardar el valor editado
  const handleBlur = () => {
    onChange(id, localValue);
  };

  const handleKeyDown = (e) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (e.key === 'Enter') {
      onChange(id, localValue);
    }
  };


  return (
    <TextField
      value={localValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};

export default CustomTextFieldEditor;