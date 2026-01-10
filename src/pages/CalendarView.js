import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAppointmentsByDate } from "../firebase/firestore";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

const CalendarView = () => {
  const { isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = "/admin";
      return;
    }

    loadAppointmentsForDate(selectedDate);
  }, [isAdmin, selectedDate]);

  const loadAppointmentsForDate = async (date) => {
    setLoading(true);
    try {
      const data = await getAppointmentsByDate(date);
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get appointments for the selected date
  const selectedDateAppointments = appointments.filter((app) => {
    const appDate = app.date?.toDate ? app.date.toDate() : new Date(app.date);
    return isSameDay(appDate, selectedDate);
  });

  // Group days by week for display
  const weeks = [];
  let week = [];

  daysInMonth.forEach((day, index) => {
    if (index > 0 && day.getDay() === 0) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
  });
  if (week.length > 0) weeks.push(week);

  // Pad first week with empty days
  if (weeks[0] && weeks[0].length < 7) {
    const emptyDays = 7 - weeks[0].length;
    for (let i = 0; i < emptyDays; i++) {
      weeks[0].unshift(null);
    }
  }

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "40px 20px", textAlign: "center" }}
      >
        <div className="spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1>Calendar View</h1>
        <p style={{ color: "var(--gray-color)" }}>
          View and manage appointments by date
        </p>
      </div>

      <div className="calendar-container">
        <div className="calendar-header">
          <button
            onClick={handlePrevMonth}
            className="btn btn-outline btn-small"
          >
            ← Previous
          </button>
          <h2 style={{ margin: 0 }}>{format(currentDate, "MMMM yyyy")}</h2>
          <button
            onClick={handleNextMonth}
            className="btn btn-outline btn-small"
          >
            Next →
          </button>
        </div>

        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}

          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${dayIndex}`}
                      className="calendar-day"
                      style={{ visibility: "hidden" }}
                    ></div>
                  );
                }

                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const hasAppointments = appointments.some((app) => {
                  const appDate = app.date?.toDate
                    ? app.date.toDate()
                    : new Date(app.date);
                  return isSameDay(appDate, day);
                });

                return (
                  <div
                    key={day.toString()}
                    className={`calendar-day ${isSelected ? "selected" : ""} ${
                      hasAppointments ? "has-appointments" : ""
                    }`}
                    onClick={() => handleDateClick(day)}
                    style={{
                      opacity: isCurrentMonth ? 1 : 0.5,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: isSelected ? "bold" : "normal",
                        color: isSelected ? "white" : "inherit",
                      }}
                    >
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Appointments for selected date */}
      <div className="card mt-3">
        <h3>
          Appointments for {format(selectedDate, "MMMM dd, yyyy")}
          <span
            style={{
              fontSize: "14px",
              fontWeight: "normal",
              color: "var(--gray-color)",
              marginLeft: "10px",
            }}
          >
            ({selectedDateAppointments.length})
          </span>
        </h3>

        {selectedDateAppointments.length > 0 ? (
          <div className="table-container mt-2">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {selectedDateAppointments.map((appointment) => {
                  const appDate = appointment.date?.toDate
                    ? appointment.date.toDate()
                    : new Date(appointment.date);
                  return (
                    <tr key={appointment.id}>
                      <td>{format(appDate, "hh:mm a")}</td>
                      <td>
                        <div>
                          <strong>{appointment.userName}</strong>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--gray-color)",
                            }}
                          >
                            {appointment.userEmail}
                          </div>
                        </div>
                      </td>
                      <td>{appointment.serviceName}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            appointment.status === "Approved"
                              ? "status-approved"
                              : appointment.status === "Cancelled"
                              ? "status-cancelled"
                              : "status-pending"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: "200px" }}>
                        <div
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {appointment.notes || "No notes"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p
            style={{
              color: "var(--gray-color)",
              textAlign: "center",
              padding: "20px",
            }}
          >
            No appointments scheduled for this date.
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="card mt-3">
        <h4>Legend</h4>
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginTop: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-color)",
              }}
            ></div>
            <span>Has appointments</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "var(--primary-color)",
                borderRadius: "4px",
              }}
            ></div>
            <span>Selected date</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
