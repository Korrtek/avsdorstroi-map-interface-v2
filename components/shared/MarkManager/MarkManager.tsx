import { Container } from "@/components/ui/Container/Container";
import styles from './MarkManager.module.scss'
interface Props {
    className?: string;
}
export const MarkManager: React.FC<Props> = () => {
  return (
    <Container>
    <div className={styles.markManager}>123</div>
     </Container>
  );
};