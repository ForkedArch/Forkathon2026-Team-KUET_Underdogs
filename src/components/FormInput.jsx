import { useState } from "react";

function FormInput({
  label,
  id,
  type = "text",
  name,
  placeholder,
  autoComplete,
  inputMode,
  pattern,
  minLength,
  required = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>

      <div className={isPassword ? "password-field" : ""}>
        <input
          id={id}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          pattern={pattern}
          minLength={minLength}
          required={required}
        />

        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}

export default FormInput;