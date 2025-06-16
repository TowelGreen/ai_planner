import styles from '../styles/Card.module.css';

const PlannerCard = ({ title, description, rating, price }) => (
  <div className={styles.card}>
    <h3>{title}</h3>
    <p>{description}</p>
    <p>⭐ {rating} | 💲{price}</p>
  </div>
);

export default PlannerCard;
