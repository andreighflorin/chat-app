import styles from "./Loader.module.css";

function Loader() {
  return (
    <div className={styles.overlay}>
      <div className={styles.loader}></div>
    </div>
  );
}

export default Loader;
