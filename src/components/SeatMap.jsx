import React from "react";

/**
 * Displays a seating map for an auditorium.
 *
 * Props:
 *  - seats: array of seat objects from backend
 *      { id, row_label, seat_number, status }
 *  - selected: array of seat IDs currently selected by the user
 *  - toggle: callback for selecting/unselecting a seat
 *
 * Rendering logic:
 *  1) Seats are grouped by row (A, B, C...)
 *  2) Each row is displayed horizontally in seat-number order
 *  3) Seat colors:
 *      - booked: gray (not clickable)
 *      - selected: green
 *      - available: white
 */
export default function SeatMap({ seats, selected, toggle }) {
  // Group seats by row label (A, B, C...)
  const byRow = seats.reduce((acc, s) => {
    acc[s.row_label] = acc[s.row_label] || [];
    acc[s.row_label].push(s);
    return acc;
  }, {});

  // Sort each row by seat number for proper left-to-right display
  Object.values(byRow).forEach(row =>
    row.sort((a, b) => a.seat_number - b.seat_number)
  );

  return (
    <div className="seat-map-container">
      {/* Screen indicator */}
      <div className="screen-indicator">
        <div className="screen-line"></div>
        <span className="screen-text">SCREEN</span>
      </div>

      {/* Seat grid */}
      <div className="seat-grid">
        {/* Render each row alphabetically */}
        {Object.keys(byRow)
          .sort()
          .map(row => (
            <div key={row} className="seat-row">
              {/* Row label (A, B, C...) */}
              <div className="row-label">{row}</div>

              {/* Render all seats in the row */}
              <div className="row-seats">
                {byRow[row].map(seat => {
                  const isSelected = selected.includes(seat.id);
                  const isBooked = seat.status === "BOOKED";

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => !isBooked && toggle(seat.id)}
                      className={`seat-button ${
                        isBooked ? "seat-booked" : isSelected ? "seat-selected" : "seat-available"
                      }`}
                      disabled={isBooked}
                      title={`${seat.row_label}${seat.seat_number} ${
                        isBooked ? "(booked)" : ""
                      }`}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box legend-available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box legend-selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-box legend-booked"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}
