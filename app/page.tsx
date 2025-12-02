import styles from "./page.module.scss";
import { MarkForm } from "@/components/shared/MarkForm/MarkForm";
import { MarkManager } from "@/components/shared/MarkManager/MarkManager";
export default function Home() {
  return (
    <div className={styles.page}>
      <MarkManager></MarkManager>
      <MarkForm></MarkForm>
    </div>
  );
}
