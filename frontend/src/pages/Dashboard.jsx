import "./Dashboard.css";

const upcomingEvents = [
  {
    id: 1,
    date: "24",
    month: "OCT",
    title: "Global Leadership Summit",
    location: "New York Convention Center",
    time: "09:00 AM",
    status: "Registered",
  },
  {
    id: 2,
    date: "12",
    month: "NOV",
    title: "UI/UX Design Masterclass",
    location: "Creative Hub, London",
    time: "10:30 AM",
    status: "Organizer",
  },
];

const activities = [
  {
    icon: "✓",
    title: "Registration confirmed",
    description: "Global Leadership Summit",
    time: "2 hours ago",
  },
  {
    icon: "★",
    title: "New attendee registered",
    description: "UI/UX Design Masterclass",
    time: "5 hours ago",
  },
  {
    icon: "!",
    title: "Event reminder",
    description: "Global Leadership Summit starts soon",
    time: "Yesterday",
  },
];

function Dashboard() {
  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">
        <div className="sidebar-profile">
          <h2>CompilVision</h2>

          <div className="sidebar-user">
            <div className="user-initials">JD</div>

            <div>
              <strong>Alex River</strong>
              <span>Professional</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <a className="sidebar-active" href="#">
            <span>▦</span>
            Dashboard
          </a>

          <a href="#">
            <span>◯</span>
            Profile
          </a>

          <a href="#">
            <span>▣</span>
            My Registrations
          </a>

          <a href="#">
            <span>▤</span>
            My Created Events
          </a>

          <a href="#">
            <span>＋</span>
            Create Event
          </a>

          <a href="#">
            <span>♢</span>
            Notifications
          </a>

          <a href="#">
            <span>⚙</span>
            Settings
          </a>
        </nav>

        <div className="sidebar-bottom">
          <button className="create-event-sidebar">
            + Create Event
          </button>

          <button className="logout-button">
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD */}

      <main className="dashboard-main">

        {/* TOP NAVBAR */}

        <header className="dashboard-header">
          <div className="dashboard-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search events, organizers, or activity..."
            />
          </div>

          <div className="dashboard-header-right">
            <button className="notification-button">
              ♢
              <span></span>
            </button>

            <div className="header-user">
              <div>
                <strong>Alex River</strong>
                <small>ORGANIZER</small>
              </div>

              <div className="header-avatar">AR</div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="dashboard-content">

          {/* WELCOME SECTION */}

          <section className="welcome-grid">

            <div className="welcome-card">
              <div>
                <h1>Welcome back, Alex!</h1>

                <p>
                  You have <strong>2 upcoming events</strong> this
                  week. Your last event had a 94% satisfaction rate.
                </p>

                <button>View My Events →</button>
              </div>

              <div className="welcome-decoration">
                ✦
              </div>
            </div>

            <div className="quick-action-card">
              <span className="quick-icon">＋</span>

              <div>
                <small>QUICK ACTION</small>

                <h3>Create New Event</h3>

                <p>
                  Start planning your next extraordinary experience.
                </p>
              </div>

              <button>→</button>
            </div>

          </section>

          {/* STATISTICS */}

          <section className="dashboard-stats">

            <div className="dashboard-stat-card">
              <div className="stat-top">
                <span>Total Events</span>
                <span className="stat-icon">▣</span>
              </div>

              <h2>12</h2>

              <p className="positive">
                ↑ 8% <span>from last month</span>
              </p>
            </div>

            <div className="dashboard-stat-card">
              <div className="stat-top">
                <span>Registrations</span>
                <span className="stat-icon">♙</span>
              </div>

              <h2>248</h2>

              <p className="positive">
                ↑ 12% <span>from last month</span>
              </p>
            </div>

            <div className="dashboard-stat-card">
              <div className="stat-top">
                <span>Upcoming</span>
                <span className="stat-icon">□</span>
              </div>

              <h2>4</h2>

              <p>
                <span>Next event in 3 days</span>
              </p>
            </div>

            <div className="dashboard-stat-card">
              <div className="stat-top">
                <span>Profile Views</span>
                <span className="stat-icon">◉</span>
              </div>

              <h2>1.2k</h2>

              <p className="positive">
                ↑ 18% <span>this month</span>
              </p>
            </div>

          </section>

          {/* LOWER CONTENT */}

          <section className="dashboard-lower">

            {/* UPCOMING EVENTS */}

            <div className="dashboard-panel upcoming-panel">

              <div className="panel-heading">
                <div>
                  <h2>Upcoming Events</h2>
                  <p>Your next scheduled experiences.</p>
                </div>

                <button>View All</button>
              </div>

              <div className="upcoming-list">

                {upcomingEvents.map((event) => (
                  <div
                    className="upcoming-event"
                    key={event.id}
                  >
                    <div className="event-calendar">
                      <strong>{event.date}</strong>
                      <span>{event.month}</span>
                    </div>

                    <div className="upcoming-info">
                      <h3>{event.title}</h3>

                      <p>
                        ◉ {event.location}
                      </p>

                      <p>
                        ◷ {event.time}
                      </p>
                    </div>

                    <span
                      className={`dashboard-status ${
                        event.status === "Organizer"
                          ? "organizer-status"
                          : ""
                      }`}
                    >
                      {event.status}
                    </span>

                    <button className="event-options">
                      ⋮
                    </button>
                  </div>
                ))}

              </div>

            </div>

            {/* RECENT ACTIVITY */}

            <div className="dashboard-panel activity-panel">

              <div className="panel-heading">
                <div>
                  <h2>Recent Activity</h2>
                  <p>Latest updates from your account.</p>
                </div>
              </div>

              <div className="activity-list">

                {activities.map((activity, index) => (
                  <div
                    className="activity-item"
                    key={index}
                  >
                    <div className="activity-icon">
                      {activity.icon}
                    </div>

                    <div>
                      <h4>{activity.title}</h4>

                      <p>{activity.description}</p>

                      <small>{activity.time}</small>
                    </div>
                  </div>
                ))}

              </div>

              <button className="activity-button">
                View All Activity
              </button>

            </div>

          </section>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;