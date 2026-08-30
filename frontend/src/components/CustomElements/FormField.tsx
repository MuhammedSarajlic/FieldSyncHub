import { ChangeEvent } from 'react';

export interface FormFieldProps {
  label?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
  fullWidth?: boolean;
}

const FormField = ({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  checked,
  onChange,
  error,
  className = '',
  fullWidth = true,
}: FormFieldProps) => (
  <div className={`${fullWidth ? 'w-full' : 'w-1/2'} flex flex-col space-y-1`}>
    {label && (
      <label htmlFor={id || label} className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
    )}
    <input
      id={id || label}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      checked={checked}
      onChange={onChange}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-bg-primary focus:ring-2 focus:ring-bg-primary ${error ? 'border-red-600' : 'border-gray-300'} ${className}`}
    />
    {error && <p className='text-xs text-red-500'>{error}</p>}
  </div>
);

export default FormField;
