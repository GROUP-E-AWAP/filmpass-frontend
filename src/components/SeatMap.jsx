import React from "react";

export default function SeatMap({ seats, selected, toggle }) {
  const byRow = seats.reduce((acc, s) => {
    acc[s.row_label] = acc[s.row_label] || [];
    acc[s.row_label].push(s);
    return acc;
  }, {});
  Object.values(byRow).forEach(arr => arr.sort((a,b)=>a.seat_number-b.seat_number));

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {Object.keys(byRow).sort().map(row => (
        <div key={row} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 20, textAlign: "center" }}>{row}</div>
          {byRow[row].map(seat => {
            const isSel = selected.includes(seat.id);
            const isBooked = seat.status === "BOOKED";
            return (
              <button
                key={seat.id}
                onClick={() => !isBooked && toggle(seat.id)}
                style={{
                  width: 28, height: 28, borderRadius: 4, border: "1px solid #ccc",
                  background: isBooked ? "#999" : isSel ? "#5dd06c" : "#fff",
                  cursor: isBooked ? "not-allowed" : "pointer"
                }}
                title={`${row}${seat.seat_number} ${isBooked ? "(booked)" : ""}`}
              >
                {seat.seat_number}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
