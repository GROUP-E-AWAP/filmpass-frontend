import { Link } from "react-router-dom";

export const MovieCard = ({ movie, minPrice }) => {
  const posterUrl = movie.poster_url || null;

  return (
    <Link to={`/movie/${movie.id}`} style={{ textDecoration: "none" }}>
      <div className="movie-card">
        <div className="movie-poster">
          {posterUrl ? (
            <img src={posterUrl} alt={movie.title} loading="lazy" />
          ) : (
            <div style={{ textAlign: "center", color: "#999" }}>
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>🎬</div>
              <div>No poster available</div>
            </div>
          )}
        </div>
        <div className="movie-card-content">
          <div className="movie-card-title">{movie.title}</div>
          <div className="movie-card-meta">
            {movie.duration_minutes && (
              <span className="movie-duration">
                ⏱️ {movie.duration_minutes} min
              </span>
            )}
            {minPrice !== undefined && (
              <span className="movie-price">
                💰 From €{minPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
