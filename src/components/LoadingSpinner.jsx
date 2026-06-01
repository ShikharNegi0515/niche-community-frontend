export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="loading-state" role="status">
      <div className="spinner" aria-hidden />
      <p>{label}</p>
    </div>
  );
}
