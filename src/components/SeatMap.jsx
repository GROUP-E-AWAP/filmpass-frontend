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
    <div
      style={{
        display: "grid",
        gap: 8,
        marginTop: 12,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 8
      }}
    >
      {/* Render each row alphabetically */}
      {Object.keys(byRow)
        .sort()
        .map(row => (
          <div
            key={row}
            style={{ display: "flex", gap: 6, alignItems: "center" }}
          >
            {/* Row label (A, B, C...) */}
            <div style={{ width: 20, textAlign: "center", fontWeight: 500 }}>
              {row}
            </div>

            {/* Render all seats in the row */}
            {byRow[row].map(seat => {
              const isSelected = selected.includes(seat.id);
              const isBooked = seat.status === "BOOKED";

              return (
                <button
                  key={seat.id}
                  type="button" // prevent accidental form submission
                  onClick={() => !isBooked && toggle(seat.id)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    background: isBooked
                      ? "#999"         // booked seat
                      : isSelected
                      ? "#4ade80"       // selected seat
                      : "#fff",         // available seat
                    cursor: isBooked ? "not-allowed" : "pointer",
                    fontSize: 12
                  }}
                  title={`${seat.row_label}${seat.seat_number} ${
                    isBooked ? "(booked)" : ""
                  }`}
                >
                  {seat.seat_number}
                </button>
              );
            })}
          </div>
        ))}

      {/* Legend */}
      <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
        <span style={{ marginRight: 12 }}>□ free</span>
        <span style={{ marginRight: 12 }}>■ selected</span>
        <span>■ booked</span>
      </div>
    </div>
  );
}
