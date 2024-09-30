import styles from "./UserSearch.module.css";

function UserSearch({ searchKey, setSearchKey }) {
  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search users / chats"
        className={styles.searchInput}
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)}
      />
      <i className={`${styles.searchIcon} ri-search-line`}></i>
    </div>
  );
}

export default UserSearch;
