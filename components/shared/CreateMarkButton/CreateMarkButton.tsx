import styles from './CreateMarkButton.module.scss'
interface Props {
  className?: string
  onClick?: () => void
}

export const CreateMarkButton: React.FC<Props> = ({ className, onClick }) => {
  return (
    <>
      <div
        onClick={onClick}
        className={`${styles.createMarkButton} ${className || ''}`}
      >
        <div className={styles.buttonWrapper}>
          <div className={styles.title}>Создать новую Метку</div>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={styles.svg}
          >
            <line x1="12" y1="5" x2="12" y2="19" className={styles.svg} />
            <line x1="5" y1="12" x2="19" y2="12" className={styles.svg} />
          </svg>
        </div>
      </div>
    </>
  )
}