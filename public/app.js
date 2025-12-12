const { useState, useEffect } = React;
const { Calendar, TrendingUp, User, Plus, X, Download, Moon, Sun, Filter, AlertCircle, Lock, Unlock, FileText, Shield } = lucide;

function SelfLens() {
  const [darkMode, setDarkMode] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [profile, setProfile] = useState({ username:'', avatar:'', name:'', notes:'' });

  useEffect(() => {
    const savedIncidents = localStorage.getItem('selflens_incidents');
    const savedProfile = localStorage.getItem('selflens_profile');
    const savedTheme = localStorage.getItem('selflens_theme');
    if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedTheme) setDarkMode(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('selflens_theme', newMode ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} p-4`}>
      <h1 className="text-2xl font-bold mb-4">SelfLens Dashboard</h1>
      <button className="mb-4 px-4 py-2 border rounded" onClick={toggleTheme}>
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>
      <pre>{JSON.stringify({ profile, incidents }, null, 2)}</pre>
    </div>
  );
}

ReactDOM.render(<SelfLens />, document.getElementById('root'));
