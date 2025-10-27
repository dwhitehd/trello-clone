'use client';

import { useBoardStore } from "@/store/useBoardStore";
import styles from "./_page.module.scss";
import EditableTitle from "@/components/EditableTitle";

export default function Home() {
    const { boardTitle, updateBoardTitle, hasHydrated } = useBoardStore();
  return (
    <div className={styles.container}>
      <main>
        {hasHydrated && (
          <EditableTitle
            value={boardTitle}
            onChange={updateBoardTitle}
            maxLength={50}
          />
        )}
      </main>
    </div>
  );
}
