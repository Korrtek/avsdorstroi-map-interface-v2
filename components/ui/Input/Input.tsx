import styles from './Input.module.scss'

interface Props {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  label?: string // Добавили label
  error?: string
  type?: string
}
// передаю как пропсы чтобы переиспользовать инпут
export const Input: React.FC<Props> = ({
  placeholder,
  type,
  value,
  onChange,
  label,
}) => {
  return (
    <div className={styles.inputWrapper}>
      {label && <div className={styles.label}>{label}</div>}
      <input
        type={type}
        placeholder={placeholder}
        className={styles.input}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}