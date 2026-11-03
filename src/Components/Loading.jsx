import "../styles/loading.css";

export default function Loading({
  title,
  description,
}) {
    return (
    <main
      className="card loading-card"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="spinner" aria-hidden="true" />
      <div className="content">
        <strong className="title">{title}</strong>
        <p className="description">{description}</p>
      </div>
    </main>
  );
}