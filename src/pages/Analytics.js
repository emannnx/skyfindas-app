import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getAllAppointments,
  getAllServices,
  subscribeToAppointments,
  subscribeToServices,
} from "../firebase/firestore";
import { format, startOfWeek, endOfWeek, isSameWeek, isToday } from "date-fns";

const Analytics = () => {
  const { isAdmin } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // week, month, year

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = "/admin";
      return;
    }

    const loadData = async () => {
      try {
        const [appointmentsData, servicesData] = await Promise.all([
          getAllAppointments(),
          getAllServices(),
        ]);
        setAppointments(appointmentsData);
        setServices(servicesData);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates for appointments
    const unsubscribeAppointments = subscribeToAppointments(
      (updatedAppointments) => {
        setAppointments(updatedAppointments);
      }
    );

    // Subscribe to real-time updates for services
    const unsubscribeServices = subscribeToServices((updatedServices) => {
      setServices(updatedServices);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeServices();
    };
  }, [isAdmin]);

  const calculateStats = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const stats = {
      totalAppointments: appointments.length,
      appointmentsToday: appointments.filter((app) => {
        const appDate = app.date?.toDate
          ? app.date.toDate()
          : new Date(app.date);
        return isToday(appDate);
      }).length,
      appointmentsThisWeek: appointments.filter((app) => {
        const appDate = app.date?.toDate
          ? app.date.toDate()
          : new Date(app.date);
        return isSameWeek(appDate, now, { weekStartsOn: 1 });
      }).length,
      pendingAppointments: appointments.filter(
        (app) => app.status === "Pending"
      ).length,
      approvedAppointments: appointments.filter(
        (app) => app.status === "Approved"
      ).length,
      cancelledAppointments: appointments.filter(
        (app) => app.status === "Cancelled"
      ).length,
    };

    // Calculate most booked service
    const serviceCounts = {};
    appointments.forEach((app) => {
      if (app.serviceName) {
        serviceCounts[app.serviceName] =
          (serviceCounts[app.serviceName] || 0) + 1;
      }
    });

    let mostBookedService = "None";
    let maxBookings = 0;
    Object.entries(serviceCounts).forEach(([serviceName, count]) => {
      if (count > maxBookings) {
        maxBookings = count;
        mostBookedService = serviceName;
      }
    });

    stats.mostBookedService = mostBookedService;
    stats.mostBookedCount = maxBookings;

    // Calculate conversion rate
    stats.conversionRate =
      appointments.length > 0
        ? ((stats.approvedAppointments / appointments.length) * 100).toFixed(1)
        : 0;

    // Calculate average appointments per day this week
    stats.avgDailyAppointments =
      stats.appointmentsThisWeek > 0
        ? (stats.appointmentsThisWeek / 7).toFixed(1)
        : 0;

    return stats;
  };

  const getAppointmentsByStatus = () => {
    const statusCounts = {
      Pending: 0,
      Approved: 0,
      Cancelled: 0,
    };

    appointments.forEach((app) => {
      if (statusCounts.hasOwnProperty(app.status)) {
        statusCounts[app.status]++;
      }
    });

    return statusCounts;
  };

  const getAppointmentsByService = () => {
    const serviceStats = {};

    appointments.forEach((app) => {
      if (app.serviceName) {
        if (!serviceStats[app.serviceName]) {
          serviceStats[app.serviceName] = {
            total: 0,
            approved: 0,
            pending: 0,
            cancelled: 0,
          };
        }
        serviceStats[app.serviceName].total++;
        serviceStats[app.serviceName][app.status.toLowerCase()]++;
      }
    });

    return Object.entries(serviceStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total);
  };

  const stats = calculateStats();
  const statusData = getAppointmentsByStatus();
  const serviceData = getAppointmentsByService();

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "40px 20px", textAlign: "center" }}
      >
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1>Analytics Dashboard</h1>
        <p style={{ color: "var(--gray-color)" }}>
          Insights and performance metrics
        </p>
      </div>

      {/* Time Range Selector */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
          backgroundColor: "var(--white)",
          padding: "15px",
          borderRadius: "var(--border-radius)",
          boxShadow: "var(--shadow)",
        }}
      >
        <button
          onClick={() => setTimeRange("today")}
          className={`btn ${
            timeRange === "today" ? "btn-primary" : "btn-outline"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeRange("week")}
          className={`btn ${
            timeRange === "week" ? "btn-primary" : "btn-outline"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeRange("month")}
          className={`btn ${
            timeRange === "month" ? "btn-primary" : "btn-outline"
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimeRange("year")}
          className={`btn ${
            timeRange === "year" ? "btn-primary" : "btn-outline"
          }`}
        >
          This Year
        </button>
        <button
          onClick={() => setTimeRange("all")}
          className={`btn ${
            timeRange === "all" ? "btn-primary" : "btn-outline"
          }`}
        >
          All Time
        </button>
      </div>

      {/* Key Metrics */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-label">Total Services</div>
          <div className="analytics-value">{services.length}</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-label">Total Appointments</div>
          <div className="analytics-value">{stats.totalAppointments}</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-label">Today's Appointments</div>
          <div className="analytics-value">{stats.appointmentsToday}</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-label">This Week</div>
          <div className="analytics-value">{stats.appointmentsThisWeek}</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-label">Conversion Rate</div>
          <div className="analytics-value">{stats.conversionRate}%</div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="card mt-3">
        <h3>Appointments by Status</h3>
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          {Object.entries(statusData).map(([status, count]) => (
            <div
              key={status}
              style={{
                flex: "1",
                minWidth: "150px",
                backgroundColor: "var(--light-color)",
                padding: "20px",
                borderRadius: "var(--border-radius)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color:
                    status === "Approved"
                      ? "var(--success-color)"
                      : status === "Pending"
                      ? "var(--warning-color)"
                      : "var(--danger-color)",
                }}
              >
                {count}
              </div>
              <div
                style={{
                  marginTop: "10px",
                  color: "var(--secondary-color)",
                  fontWeight: "600",
                }}
              >
                {status}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "var(--gray-color)",
                  marginTop: "5px",
                }}
              >
                {stats.totalAppointments > 0
                  ? `${((count / stats.totalAppointments) * 100).toFixed(
                      1
                    )}% of total`
                  : "0%"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Performance */}
      <div className="card mt-3">
        <h3>Service Performance</h3>
        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>Most Popular Service:</strong>{" "}
            <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>
              {stats.mostBookedService}
            </span>{" "}
            ({stats.mostBookedCount} bookings)
          </p>

          {serviceData.length > 0 && (
            <div className="table-container mt-2">
              <table className="table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Total Bookings</th>
                    <th>Approved</th>
                    <th>Pending</th>
                    <th>Cancelled</th>
                    <th>Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceData.map((service) => (
                    <tr key={service.name}>
                      <td>{service.name}</td>
                      <td>{service.total}</td>
                      <td>{service.approved}</td>
                      <td>{service.pending}</td>
                      <td>{service.cancelled}</td>
                      <td>
                        <span
                          style={{
                            color:
                              service.total > 0
                                ? (service.approved / service.total) * 100 > 70
                                  ? "var(--success-color)"
                                  : (service.approved / service.total) * 100 >
                                    50
                                  ? "var(--warning-color)"
                                  : "var(--danger-color)"
                                : "var(--gray-color)",
                            fontWeight: "600",
                          }}
                        >
                          {service.total > 0
                            ? `${(
                                (service.approved / service.total) *
                                100
                              ).toFixed(1)}%`
                            : "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Daily Average */}
      <div className="card mt-3">
        <h3>Performance Metrics</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(52, 152, 219, 0.1)",
              padding: "20px",
              borderRadius: "var(--border-radius)",
            }}
          >
            <div style={{ fontSize: "14px", color: "var(--dark-gray)" }}>
              Average Daily Appointments (This Week)
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "var(--primary-color)",
              }}
            >
              {stats.avgDailyAppointments}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(46, 204, 113, 0.1)",
              padding: "20px",
              borderRadius: "var(--border-radius)",
            }}
          >
            <div style={{ fontSize: "14px", color: "var(--dark-gray)" }}>
              Approval Rate
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "var(--success-color)",
              }}
            >
              {stats.conversionRate}%
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(243, 156, 18, 0.1)",
              padding: "20px",
              borderRadius: "var(--border-radius)",
            }}
          >
            <div style={{ fontSize: "14px", color: "var(--dark-gray)" }}>
              Pending Rate
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "var(--warning-color)",
              }}
            >
              {stats.totalAppointments > 0
                ? `${(
                    (stats.pendingAppointments / stats.totalAppointments) *
                    100
                  ).toFixed(1)}%`
                : "0%"}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card mt-3">
        <h3>Summary</h3>
        <div style={{ marginTop: "15px", lineHeight: "1.8" }}>
          <p>
            <strong>Total Services Available:</strong> {services.length} service
            {services.length !== 1 ? "s" : ""} available for booking
          </p>
          <p>
            <strong>Current Status:</strong>{" "}
            {stats.appointmentsToday > 0
              ? `You have ${stats.appointmentsToday} appointment(s) scheduled for today.`
              : "No appointments scheduled for today."}
          </p>
          <p>
            <strong>Weekly Performance:</strong>{" "}
            {stats.appointmentsThisWeek > 0
              ? `${stats.appointmentsThisWeek} appointment(s) booked this week with an average of ${stats.avgDailyAppointments} per day.`
              : "No appointments booked this week yet."}
          </p>
          <p>
            <strong>Top Service:</strong>{" "}
            {stats.mostBookedService !== "None"
              ? `${stats.mostBookedService} is the most popular service with ${stats.mostBookedCount} bookings.`
              : "No service bookings yet."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
