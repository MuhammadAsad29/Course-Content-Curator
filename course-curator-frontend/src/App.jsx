import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Loader, Compass, ExternalLink, Calendar, PlusCircle } from 'lucide-react';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [message, setMessage] = useState('');

  const API_BASE = 'http://127.0.0.1:8000';

  // Fetch all saved courses on load
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE}/courses`);
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Curate a new course
  const handleCurate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setMessage('Curating resources & generating roadmap (takes ~10 seconds)...');
    setActiveCourse(null);

    try {
      const response = await fetch(`${API_BASE}/curate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      setActiveCourse(data);
      setTopic('');
      setMessage('');
      fetchCourses(); // Refresh database list
    } catch (err) {
      setMessage('Error curating course. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load a saved course from the database
  const loadSavedCourse = async (id) => {
    setLoading(true);
    setMessage('Loading course details...');
    try {
      const response = await fetch(`${API_BASE}/courses/${id}`);
      const data = await response.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setActiveCourse(data);
        setMessage('');
      }
    } catch (err) {
      setMessage('Failed to load course details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logoArea}>
          <BookOpen size={24} color="#6366f1" />
          <h2 style={styles.logoText}>Curator AI</h2>
        </div>

        <h3 style={styles.sidebarTitle}>Your Courses</h3>
        <div style={styles.courseList}>
          {courses.map((c) => (
            <button key={c[0]} onClick={() => loadSavedCourse(c[0])} style={styles.courseItem}>
              <Compass size={16} style={{ marginRight: '8px' }} />
              {c[1]}
            </button>
          ))}
          {courses.length === 0 && <p style={styles.emptyText}>No courses saved yet.</p>}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Curate Form */}
        <form onSubmit={handleCurate} style={styles.searchForm}>
          <input
            type="text"
            placeholder="What do you want to learn? (e.g. Machine Learning, React, UI Design)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? <Loader className="animate-spin" size={18} /> : <PlusCircle size={18} />}
            <span style={{ marginLeft: '6px' }}>Curate</span>
          </button>
        </form>

        {/* Status Messages */}
        {message && <div style={styles.statusBox}>{message}</div>}

        {/* Active Course View */}
        {activeCourse && (
          <div style={styles.courseView}>
            <h1 style={styles.courseTitle}>{activeCourse.topic}</h1>

            <div style={styles.grid}>
              {/* Left Column: Subtopics & Resources */}
              <div style={styles.leftCol}>
                <div style={styles.card}>
                  <h3 style={styles.cardHeader}>Progressive Subtopics</h3>
                  <ul style={styles.list}>
                    {activeCourse.subtopics?.map((sub, idx) => (
                      <li key={idx} style={styles.listItem}>
                        <span style={styles.listNumber}>{idx + 1}</span> {sub}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardHeader}>Curated Web & Video Resources</h3>
                  <div style={styles.resourceList}>
                    {activeCourse.resources?.top_resources?.map((res, idx) => (
                      <a key={idx} href={res.url} target="_blank" rel="noreferrer" style={styles.resourceCard}>
                        <div style={styles.resourceHeader}>
                          <span style={styles.badge}>{res.source}</span>
                          <ExternalLink size={14} color="#94a3b8" />
                        </div>
                        <p style={styles.resourceReason}>{res.reason}</p>
                        <span style={styles.resourceUrl}>{res.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Weekly Roadmap */}
              <div style={styles.rightCol}>
                <div style={styles.card}>
                  <h3 style={styles.cardHeader}>
                    {activeCourse.roadmap?.weeks?.length || 4}-Week Learning Roadmap
                  </h3>
                  {activeCourse.roadmap?.weeks?.map((week) => (
                    <div key={week.week} style={styles.weekSection}>
                      <div style={styles.weekHeader}>
                        <Calendar size={16} color="#6366f1" />
                        <h4 style={styles.weekTitle}>Week {week.week}</h4>
                      </div>
                      <ul style={styles.goalsList}>
                        {week.goals?.map((goal, gIdx) => (
                          <li key={gIdx} style={styles.goalItem}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!activeCourse && !loading && (
          <div style={styles.hero}>
            <Compass size={64} color="#334155" />
            <h2 style={{ color: '#94a3b8', marginTop: '16px' }}>Start Curation</h2>
            <p style={{ color: '#64748b' }}>Enter a topic above to generate a custom 4-week roadmap and search resources.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline CSS to ensure it looks beautiful immediately without complex setups
const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' },
  sidebar: { width: '300px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '24px' },
  logoArea: { display: 'flex', alignItems: 'center', marginBottom: '32px' },
  logoText: { fontSize: '20px', fontWeight: 'bold', marginLeft: '10px', color: '#ffffff' },
  sidebarTitle: { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '16px', letterSpacing: '0.05em' },
  courseList: { display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' },
  courseItem: { display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#cbd5e1', textAlign: 'left', cursor: 'pointer', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#334155' } },
  emptyText: { color: '#64748b', fontSize: '14px', fontStyle: 'italic' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '40px' },
  searchForm: { display: 'flex', gap: '12px', marginBottom: '24px' },
  input: { flex: 1, padding: '14px 20px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '15px', outline: 'none' },
  button: { display: 'flex', alignItems: 'center', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0 24px', cursor: 'pointer', fontWeight: 'bold' },
  statusBox: { padding: '16px', borderRadius: '8px', backgroundColor: '#312e81', color: '#c7d2fe', marginBottom: '24px', fontSize: '14px' },
  courseView: { display: 'flex', flexDirection: 'column', gap: '24px' },
  courseTitle: { fontSize: '28px', fontWeight: 'bold', color: '#ffffff' },
  grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' },
  cardHeader: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f1f5f9' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' },
  listItem: { display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', fontSize: '15px' },
  listNumber: { width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '12px', fontWeight: 'bold' },
  resourceList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  resourceCard: { display: 'block', textDecoration: 'none', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px', transition: 'border-color 0.2s', cursor: 'pointer' },
  resourceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  badge: { fontSize: '11px', textTransform: 'uppercase', backgroundColor: '#312e81', color: '#c7d2fe', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' },
  resourceReason: { fontSize: '14px', color: '#e2e8f0', marginBottom: '8px', lineHeight: '1.4' },
  resourceUrl: { fontSize: '12px', color: '#64748b', wordBreak: 'break-all' },
  weekSection: { marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '16px' },
  weekHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  weekTitle: { fontSize: '16px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 },
  goalsList: { paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' },
  goalItem: { fontSize: '14px', color: '#cbd5e1', lineHeight: '1.4' },
  hero: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 },
};
