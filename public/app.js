// SelfLens - Personal Reflection Dashboard
// Part 1: Imports and Component Setup

const { useState, useEffect } = React;
const { Calendar, TrendingUp, User, Plus, X, Download, Moon, Sun, Filter, AlertCircle, Lock, Unlock, FileText, Shield } = lucide;

function SelfLens() {
  // Theme and view state
  const [darkMode, setDarkMode] = useState(true);
  const [view, setView] = useState('timeline');
  const [showModal, setShowModal] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterContext, setFilterContext] = useState('all');
  
  // First-time disclaimer
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  
  // Password protection
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    username: '',
    avatar: '',
    name: '',
    notes: ''
  });
  
  // Incidents state
  const [incidents, setIncidents] = useState([]);
  
  // New incident form
  const [newIncident, setNewIncident] = useState({
    person: '',
    type: 'gaslighting',
    context: 'other',
    severity: 5,
    emotions: [],
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Constants
  const incidentTypes = [
    'gaslighting', 'betrayal', 'gossip', 'rude', 'manipulation', 
    'positive', 'boundary-violation', 'microaggression', 'other'
  ];
  
  const contextOptions = ['work', 'family', 'friends', 'romantic', 'strangers', 'other'];
  const emotionOptions = ['angry', 'sad', 'scared', 'exhausted', 'confused', 'relieved', 'grateful'];

  // Styling classes
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const cardClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  // Load data from localStorage
  useEffect(() => {
    const agreed = localStorage.getItem('selflens_agreed');
    const savedProfile = localStorage.getItem('selflens_profile');
    const savedIncidents = localStorage.getItem('selflens_incidents');
    const savedTheme = localStorage.getItem('selflens_theme');
    const savedPassword = localStorage.getItem('selflens_password');
    
    if (agreed) {
      setHasAgreed(true);
      setShowDisclaimer(false);
    }
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
    if (savedTheme) setDarkMode(savedTheme === 'dark');
    if (savedPassword) {
      setPassword(savedPassword);
      setIsLocked(true);
    }
  }, []);

  // Agree to terms
  const agreeToTerms = () => {
    localStorage.setItem('selflens_agreed', 'true');
    setHasAgreed(true);
    setShowDisclaimer(false);
  };

  // Save profile
  const saveProfile = () => {
    localStorage.setItem('selflens_profile', JSON.stringify(profile));
  };

  // Add incident
  const addIncident = () => {
    const incident = {
      ...newIncident,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    const updated = [incident, ...incidents];
    setIncidents(updated);
    localStorage.setItem('selflens_incidents', JSON.stringify(updated));
    
    setShowModal(false);
    setNewIncident({
      person: '',
      type: 'gaslighting',
      context: 'other',
      severity: 5,
      emotions: [],
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  // Delete incident
  const deleteIncident = (id) => {
    const updated = incidents.filter(i => i.id !== id);
    setIncidents(updated);
    localStorage.setItem('selflens_incidents', JSON.stringify(updated));
  };

  // Export as JSON
  const exportJSON = () => {
    const data = { profile, incidents };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selflens_backup.json';
    a.click();
  };

  // Export as CSV
  const exportCSV = () => {
    const headers = ['Date', 'Person', 'Type', 'Context', 'Severity', 'Emotions', 'Notes'];
    const rows = incidents.map(i => [
      i.date,
      i.person || '',
      i.type,
      i.context,
      i.severity,
      i.emotions.join('; '),
      (i.notes || '').replace(/"/g, '""')
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selflens_export.csv';
    a.click();
  };

  // Toggle theme
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('selflens_theme', newMode ? 'dark' : 'light');
  };

  // Password functions
  const setupPassword = () => {
    if (tempPassword.length >= 4) {
      localStorage.setItem('selflens_password', tempPassword);
      setPassword(tempPassword);
      setIsLocked(true);
      setShowPasswordSetup(false);
      setTempPassword('');
    }
  };

  const unlockApp = () => {
    if (tempPassword === password) {
      setIsLocked(false);
      setTempPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const removePassword = () => {
    localStorage.removeItem('selflens_password');
    setPassword('');
    setIsLocked(false);
  };

  // Toggle emotion selection
  const toggleEmotion = (emotion) => {
    const emotions = newIncident.emotions.includes(emotion)
      ? newIncident.emotions.filter(e => e !== emotion)
      : [...newIncident.emotions, emotion];
    setNewIncident({...newIncident, emotions});
  };

  // Calculate insights
  const getInsights = () => {
    if (incidents.length === 0) return null;
    
    const typeCounts = {};
    const contextCounts = {};
    const personCounts = {};
    let totalSeverity = 0;
    let positiveCount = 0;
    
    incidents.forEach(inc => {
      typeCounts[inc.type] = (typeCounts[inc.type] || 0) + 1;
      contextCounts[inc.context] = (contextCounts[inc.context] || 0) + 1;
      if (inc.person) {
        personCounts[inc.person] = (personCounts[inc.person] || 0) + 1;
      }
      totalSeverity += inc.severity;
      if (inc.type === 'positive') positiveCount++;
    });
    
    const avgSeverity = (totalSeverity / incidents.length).toFixed(1);
    const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    const mostCommonContext = Object.entries(contextCounts).sort((a, b) => b[1] - a[1])[0];
    const mostCommonPerson = Object.entries(personCounts).sort((a, b) => b[1] - a[1])[0];
    
    return { avgSeverity, mostCommonType, mostCommonContext, mostCommonPerson, typeCounts, positiveCount };
  };

  const insights = getInsights();

  // Filter incidents
  const filteredIncidents = incidents.filter(i => {
    const typeMatch = filterType === 'all' || i.type === filterType;
    const contextMatch = filterContext === 'all' || i.context === filterContext;
    return typeMatch && contextMatch;
  });
  // RENDER: Disclaimer Screen (GENTLER VERSION)
  if (!hasAgreed && showDisclaimer) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass} flex items-center justify-center p-4`}>
        <div className={`${cardClass} rounded-lg p-8 max-w-2xl w-full border ${borderClass}`}>
          <div className="flex items-center gap-3 mb-6">
            <Shield size={32} className="text-purple-500" />
            <h1 className="text-3xl font-bold">Welcome to SelfLens</h1>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-lg opacity-90">
              SelfLens is your private space for reflection and tracking personal experiences. 
              Everything you log stays on your device—no one else can see it.
            </p>

            <div className={`${cardClass} ${borderClass} border rounded-lg p-4`}>
              <p className="text-sm opacity-90">
                <strong>Please note:</strong> This is a personal journaling tool, not therapy or professional advice. 
                If you need support, consider reaching out to a counselor, therapist, or trusted person in your life.
              </p>
            </div>

            <div className="space-y-2 text-sm opacity-90">
              <p>By using SelfLens, you understand that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>All data is stored locally on your device only</li>
                <li>You are responsible for the content you create</li>
                <li>This tool is for personal reflection, not legal documentation</li>
                <li>Insights are patterns based on your entries, not professional recommendations</li>
              </ul>
            </div>

            <p className="text-sm opacity-70">
              You can review our{' '}
              <button onClick={() => setShowTerms(true)} className="text-purple-500 underline">
                Terms of Service
              </button>
              {' '}and{' '}
              <button onClick={() => setShowPrivacy(true)} className="text-purple-500 underline">
                Privacy Policy
              </button>
              {' '}at any time.
            </p>
          </div>

          <button
            onClick={agreeToTerms}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-semibold transition"
          >
            Continue to SelfLens
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Password Lock Screen
  if (isLocked) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass} flex items-center justify-center p-4`}>
        <div className={`${cardClass} rounded-lg p-8 max-w-md w-full border ${borderClass}`}>
          <div className="text-center mb-6">
            <Lock size={48} className="mx-auto mb-4 text-purple-500" />
            <h2 className="text-2xl font-bold">SelfLens is Locked</h2>
            <p className="opacity-70 mt-2">Enter your password to continue</p>
          </div>
          
          <input
            type="password"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && unlockApp()}
            className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-3 mb-4 text-center text-lg`}
            placeholder="Enter password"
            autoFocus
          />
          
          <button
            onClick={unlockApp}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Main Application
  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${cardClass} border-b ${borderClass} sticky top-0 z-10`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">SelfLens</h1>
              {profile.username && <p className="text-sm opacity-70">@{profile.username}</p>}
            </div>
          </div>
          
          <div className="flex gap-2">
            {password && (
              <button onClick={() => setIsLocked(true)} className="p-2 rounded-lg hover:bg-gray-700 transition" title="Lock App">
                <Lock size={20} />
              </button>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-700 transition">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative group">
              <button className="p-2 rounded-lg hover:bg-gray-700 transition">
                <Download size={20} />
              </button>
              <div className={`absolute right-0 mt-2 ${cardClass} ${borderClass} border rounded-lg shadow-lg hidden group-hover:block w-48`}>
                <button onClick={exportJSON} className="w-full px-4 py-2 text-left hover:bg-gray-700 rounded-t-lg">
                  Export as JSON
                </button>
                <button onClick={exportCSV} className="w-full px-4 py-2 text-left hover:bg-gray-700 rounded-b-lg">
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${cardClass} border-b ${borderClass}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-4 overflow-x-auto">
          <button
            onClick={() => setView('timeline')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${view === 'timeline' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}
          >
            <Calendar size={18} className="inline mr-2" />
            Timeline
          </button>
          <button
            onClick={() => setView('insights')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${view === 'insights' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}
          >
            <TrendingUp size={18} className="inline mr-2" />
            Insights
          </button>
          <button
            onClick={() => setView('profile')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${view === 'profile' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}
          >
            <User size={18} className="inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setShowTerms(true)}
            className="px-4 py-2 rounded-lg transition hover:bg-gray-700 whitespace-nowrap"
          >
            <FileText size={18} className="inline mr-2" />
            Legal
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Timeline View */}
        {view === 'timeline' && (
          <div>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
              <div className="flex gap-2 items-center flex-wrap">
                <Filter size={18} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`${cardClass} ${borderClass} border rounded-lg px-3 py-2 text-sm`}
                >
                  <option value="all">All Types</option>
                  {incidentTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={filterContext}
                  onChange={(e) => setFilterContext(e.target.value)}
                  className={`${cardClass} ${borderClass} border rounded-lg px-3 py-2 text-sm`}
                >
                  <option value="all">All Contexts</option>
                  {contextOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => setShowModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus size={18} />
                Log Incident
              </button>
            </div>

            {filteredIncidents.length === 0 ? (
              <div className={`${cardClass} ${borderClass} border rounded-lg p-12 text-center`}>
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No incidents logged yet</p>
                <p className="opacity-70 mb-6">Start tracking your experiences to gain insights</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
                >
                  Log Your First Incident
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.map(inc => (
                  <div key={inc.id} className={`${cardClass} ${borderClass} border rounded-lg p-4`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-3 py-1 ${inc.type === 'positive' ? 'bg-green-600' : 'bg-purple-600'} text-white text-xs rounded-full`}>
                            {inc.type}
                          </span>
                          <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                            {inc.context}
                          </span>
                          <span className="text-sm opacity-70">{inc.date}</span>
                        </div>
                        {inc.person && (
                          <p className="font-semibold">{inc.person}</p>
                        )}
                        {inc.emotions.length > 0 && (
                          <p className="text-sm opacity-70 mt-1">Felt: {inc.emotions.join(', ')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs opacity-70">Severity</p>
                          <p className="text-2xl font-bold">{inc.severity}</p>
                        </div>
                        <button
                          onClick={() => deleteIncident(inc.id)}
                          className="p-2 hover:bg-red-600 rounded-lg transition"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                    {inc.notes && (
                      <p className="mt-3 opacity-80">{inc.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Insights View */}
        {view === 'insights' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Patterns</h2>
            {!insights ? (
              <div className={`${cardClass} ${borderClass} border rounded-lg p-8 text-center`}>
                <p className="opacity-70">Log some incidents to see insights</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`${cardClass} ${borderClass} border rounded-lg p-6`}>
                  <h3 className="text-lg font-semibold mb-4">Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm opacity-70">Total Incidents</p>
                      <p className="text-3xl font-bold text-purple-500">{incidents.length}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70">Avg Severity</p>
                      <p className="text-3xl font-bold text-yellow-500">{insights.avgSeverity}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70">Positive Events</p>
                      <p className="text-3xl font-bold text-green-500">{insights.positiveCount}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70">Most Common</p>
                      <p className="text-lg font-bold">{insights.mostCommonType[0]}</p>
                      <p className="text-sm opacity-70">{insights.mostCommonType[1]}x</p>
                    </div>
                  </div>
                </div>

                {insights.mostCommonPerson && (
                  <div className={`${cardClass} ${borderClass} border rounded-lg p-6`}>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle size={20} className="text-yellow-500" />
                      Pattern Detected
                    </h3>
                    <p className="opacity-90">
                      You've logged {insights.mostCommonPerson[1]} incidents involving <strong>{insights.mostCommonPerson[0]}</strong>. 
                      This pattern may be worth reflecting on. Consider whether this relationship requires different boundaries or support.
                    </p>
                  </div>
                )}

                <div className={`${cardClass} ${borderClass} border rounded-lg p-6`}>
                  <h3 className="text-lg font-semibold mb-4">Context Breakdown</h3>
                  <p className="text-sm opacity-70 mb-2">Most incidents occur in: <strong>{insights.mostCommonContext[0]}</strong> ({insights.mostCommonContext[1]} times)</p>
                </div>

                <div className={`${cardClass} ${borderClass} border rounded-lg p-6`}>
                  <h3 className="text-lg font-semibold mb-4">Type Distribution</h3>
                  <div className="space-y-2">
                    {Object.entries(insights.typeCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="capitalize">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${type === 'positive' ? 'bg-green-500' : 'bg-purple-500'}`}
                                style={{ width: `${(count / incidents.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm opacity-70 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile View */}
        {view === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
              <div className={`${cardClass} ${borderClass} border rounded-lg p-6 space-y-4`}>
                <div>
                  <label className="block text-sm mb-2 opacity-70">Username (optional)</label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    onBlur={saveProfile}
                    className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-2`}
                    placeholder="Choose a username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2 opacity-70">Avatar URL (optional)</label>
                  <input
                    type="text"
                    value={profile.avatar}
                    onChange={(e) => setProfile({...profile, avatar: e.target.value})}
                    onBlur={saveProfile}
                    className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-2`}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 opacity-70">Name (optional)</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    onBlur={saveProfile}
                    className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-2`}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 opacity-70">Notes (optional)</label>
                  <textarea
                    value={profile.notes}
                    onChange={(e) => setProfile({...profile, notes: e.target.value})}
                    onBlur={saveProfile}
                    className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-2 h-24`}
                    placeholder="Personal notes, reminders..."
                  />
                </div>

                <button
                  onClick={saveProfile}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition"
                >
                  Save Profile
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Security</h2>
              <div className={`${cardClass} ${borderClass} border rounded-lg p-6`}>
                {!password ? (
                  <div>
                    <p className="mb-4 opacity-90">Add a password to lock your data when you're away</p>
                    <button
                      onClick={() => setShowPasswordSetup(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Lock size={18} />
                      Set Up Password
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-4 opacity-90 flex items-center gap-2">
                      <Lock size={18} className="text-green-500" />
                      Password protection enabled
                    </p>
                    <button
                      onClick={removePassword}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Unlock size={18} />
                      Remove Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Incident Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`${cardClass} rounded-lg p-6 max-w-md w-full my-8`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Log Incident</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Person (optional)</label>
                <input
                  type="text"
                  value={newIncident.person}
                  onChange={(e) => setNewIncident({...newIncident, person: e.target.value})}
                  className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-2`}
                  placeholder="Name or initials"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Type</label>
                <select
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                  className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-2`}
                >
                  {incidentTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Context</label>
                <select
                  value={newIncident.context}
                  onChange={(e) => setNewIncident({...newIncident, context: e.target.value})}
                  className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-2`}
                >
                  {contextOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">How did you feel? (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {emotionOptions.map(emotion => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        newIncident.emotions.includes(emotion)
                          ? 'bg-purple-600 text-white'
                          : `${cardClass} ${borderClass} border hover:bg-gray-700`
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Severity: {newIncident.severity}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({...newIncident, severity: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs opacity-70 mt-1">
                  <span>Mild</span>
                  <span>Severe</span>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Date</label>
                <input
                  type="date"
                  value={newIncident.date}
                  onChange={(e) => setNewIncident({...newIncident, date: e.target.value})}
                  className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-2`}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Notes (optional)</label>
                <textarea
                  value={newIncident.notes}
                  onChange={(e) => setNewIncident({...newIncident, notes: e.target.value})}
                  className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-2 h-24`}
                  placeholder="What happened?"
                />
              </div>

              <button
                onClick={addIncident}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition"
              >
                Log Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Setup Modal */}
      {showPasswordSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${cardClass} rounded-lg p-6 max-w-md w-full`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Set Up Password</h3>
              <button onClick={() => setShowPasswordSetup(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm opacity-90">Choose a password (minimum 4 characters)</p>
              <input
                type="password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className={`w-full ${cardClass} ${borderClass} border rounded-lg px-4 py-2`}
                placeholder="Enter password"
                autoFocus
              />
              <button
                onClick={setupPassword}
                disabled={tempPassword.length < 4}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`${cardClass} rounded-lg p-6 max-w-2xl w-full my-8 max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Terms of Service</h3>
              <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm opacity-90">
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
              <p>By using SelfLens, you agree to these terms. SelfLens is provided "as is" without warranties. You are solely responsible for your use and content. This is not medical advice, therapy, or professional counseling. For health, legal, or emergency concerns, consult appropriate professionals.</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`${cardClass} rounded-lg p-6 max-w-2xl w-full my-8 max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Privacy Policy</h3>
              <button onClick={() => setShowPrivacy(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm opacity-90">
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
              <p>SelfLens stores all data locally on your device using browser localStorage. We do not collect, transmit, or store any of your personal information on our servers. Your data never leaves your device unless you choose to export it.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Render the app
ReactDOM.render(<SelfLens />, document.getElementById('root'));
