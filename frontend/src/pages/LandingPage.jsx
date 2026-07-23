import "./LandingPage.css";

const events = [
  {
    category: "Conference",
    date: "Oct 24, 2024",
    title: "Global Leadership Summit",
    description:
      "Join the world's top executives for a three-day intensive on the future of industry leadership.",
    price: "$299.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAaNJCsBVnbJS4j_25ujmornoRQ2c57DxNbi9Eadtd9XiQ4t8zg6ttgDSUDsnTX8pZ53ans33GpcJJ9MSYqSerzmLrPjSw9mPjudF1zb0W8640T8XIn_CqdjY6eDqq5eEF1eWiPSm-xsEkBzD9RUzg4qzkHAoEFj85kfQxkLppjBWdVcPpIn3m3G0ArBZhripgEq9IWAJyYq27XWXn3OgfgPA3jFwt8oq6D6Q_Yai4Ux1s6QHox5VJ4zooiIh2RzNGWlTI6GazpOOc",
  },
  {
    category: "Workshop",
    date: "Nov 12, 2024",
    title: "UI/UX Design Masterclass",
    description:
      "Master the latest design trends and tools in this hands-on workshop led by industry veterans.",
    price: "$150.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAsb_bQloYQavSoI_MetvWGcVoaH3hmtrmnbV6LwMnqnXyyyvDHvokOf9FpyBNH8Ef0HmuZqLofYFnPq8YiFpGQHfptoib9alcNDj-2-52jdI6wRus1MAKyX3LesVeERdw8TH1id4KOw0fZVz43ASKpTAp3_JNmtyVbuP2KoC8-_eawM6MW9VXDSQXnGbTYjoQrYoOYxrbAL37mScHFYo1A2yywlEZsV_qkuhVn8bWNbshSc3VEAZ6XLa4KZkKXX1uamZd3834MSuA",
  },
  {
    category: "Networking",
    date: "Dec 05, 2024",
    title: "Tech Founders Mixer",
    description:
      "An exclusive networking event for tech founders, investors, and innovators in the heart of the city.",
    price: "Free",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDtRN5XJXuAZlXuFU9wY1V66xarmUKVgZYUvGooMtIQ6oGQkhR17isLapbpopIY5PR-sJYLFB4_3C-7rG26KtZ4zwIuf7ssH_DIZLcPVQppUVWSgdNclUBRZq42qpQWBjqenbFlOKzGnkWKvysC2uRJ2VGBgwJ6J0ZZs38O0ehmei0k7UmenbTa34T_IutITBrg0iSs6FO7lSRY199b2aCNWje2Op25fT8LCWV20469bij3drMwRTK4O-BbxqXjOnsy8wCXTtaVMt8",
  },
];

function LandingPage() {
    
  return (
    <>
      <header className="navbar">
        <div className="nav-left">
          <h2>CompilVision</h2>

          <nav>
            <a className="active" href="#">
              Home
            </a>
            <a href="#events">Events</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>

        <div className="nav-buttons">
          <button className="login-btn">Login</button>
          <button className="register-btn">Register</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="badge">★ Trusted by 500+ global brands</div>

            <h1>
              Discover & Manage{" "}
              <span>Premium Events</span>
            </h1>

            <p>
              The all-in-one platform for professional event management.
              Streamline registrations, engage attendees, and track real-time
              metrics with precision.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn">Browse Events</button>
              <button className="secondary-btn">Create Event</button>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwXDmRyKPcCLzqVY6n4GQyUvZ30XZmiqtZb2-ZEBgIako8N1C4Ei4EbmRcyhslhQhPTrd1n0K70dd5HL3cIEk1K81IAB90KFfdiY8W0LWiOI6ZzC0mB8SP6wmqrM3ICpC1ndo7-oT3KrTINpQNZT0qNl2K2txhoCuURRBO0WKLYiqYAN5_esube5nB0RhZ1qVMD7jIhuSndPNNRox8JADMrVybPkzF2uKVLiamSH2UQFit5oshgo1TrWRse2aMNad7BApgzzOvbXM"
              alt="Event conference"
            />
          </div>
        </section>

        <section className="search-container">
          <div className="search-field">
            <label>Keyword</label>
            <input type="text" placeholder="Search events..." />
          </div>

          <div className="search-field">
            <label>Category</label>
            <select>
              <option>All Categories</option>
              <option>Conferences</option>
              <option>Workshops</option>
              <option>Networking</option>
            </select>
          </div>

          <div className="search-field">
            <label>Date</label>
            <input type="date" />
          </div>

          <button className="search-btn">☷ Search Now</button>
        </section>

        <section className="stats">
          <div className="stat-card">
            <h2>500+</h2>
            <p>EVENTS HOSTED</p>
          </div>

          <div className="stat-card">
            <h2>10k+</h2>
            <p>ACTIVE USERS</p>
          </div>

          <div className="stat-card">
            <h2>50+</h2>
            <p>GLOBAL CITIES</p>
          </div>

          <div className="stat-card">
            <h2>99%</h2>
            <p>SATISFACTION</p>
          </div>
        </section>

        <section className="featured" id="events">
          <div className="section-heading">
            <div>
              <h2>Featured Events</h2>
              <p>
                Hand-picked premium experiences curated for professionals like
                you.
              </p>
            </div>

            <button>View All Events →</button>
          </div>

          <div className="events-grid">
            {events.map((event, index) => (
              <div className="event-card" key={index}>
                <div className="event-image">
                  <img src={event.image} alt={event.title} />
                  <span>{event.category}</span>
                </div>

                <div className="event-content">
                  <p className="event-date">▣ {event.date}</p>

                  <h3>{event.title}</h3>

                  <p className="event-description">
                    {event.description}
                  </p>

                  <div className="event-footer">
                    <strong>{event.price}</strong>
                    <button>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="why-section" id="about">
          <div className="why-heading">
            <h2>Why Choose CompilVision</h2>

            <p>
              We provide the most robust toolset for creating, promoting, and
              managing your events with surgical precision.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Seamless Registration</h3>
              <p>
                Easy-to-use checkout flow designed to maximize conversion and
                minimize friction for your attendees.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">▦</div>
              <h3>Professional Dashboard</h3>
              <p>
                Manage attendees, schedules, and tickets from a centralized
                command center built for power users.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">♢</div>
              <h3>Real-time Notifications</h3>
              <p>
                Keep everyone in the loop with automated alerts, reminders, and
                live updates throughout the event lifecycle.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact">
        <div className="footer-grid">
          <div>
            <h3>CompilVision</h3>
            <p>
              Premium event management platform for the modern professional.
              Elevating experiences since 2024.
            </p>
          </div>

          <div>
            <h4>PLATFORM</h4>
            <a href="#">About Us</a>
            <a href="#">Events</a>
            <a href="#">Organizers</a>
            <a href="#">Pricing</a>
          </div>

          <div>
            <h4>SUPPORT</h4>
            <a href="#">Contact</a>
            <a href="#">Help Center</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>

          <div>
            <h4>NEWSLETTER</h4>
            <p>Stay updated with the latest events.</p>

            <div className="newsletter">
              <input type="email" placeholder="Email address" />
              <button>→</button>
            </div>
          </div>
        </div>

        <div className="copyright">
          © 2024 CompilVision. All rights reserved.
        </div>
      </footer>
    </>
  );
}



export default LandingPage;