import styles from './Button.module.scss'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  title?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
  title,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button}  ${className}`}
      title={title}
    >
      {children}
    </button>
  )
}