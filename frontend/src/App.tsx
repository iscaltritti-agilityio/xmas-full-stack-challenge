import { useState } from 'react';
import { ElfLogin } from './components/ElfLogin';
import { ElfProfile } from './components/ElfProfile';
import { ToyKanban } from './components/ToyKanban';
import './App.css';
import styles from './App.module.css';

function App() {
  const [loggedInElf, setLoggedInElf] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0);

  const handleLogout = () => {
    setLoggedInElf(null);
  };

  const handleProfileUpdate = () => {
    setProfileUpdateTrigger(prev => prev + 1);
  };

  if (!loggedInElf) {
    return (
      <div className="app">
        <header className="app-header">
          <div>
            <h1>Santa's Workshop</h1>
            <p>Toy Production Management Dashboard</p>
          </div>
        </header>
        <main className="app-main">
          <ElfLogin onLogin={setLoggedInElf} />
        </main>
        <footer className="app-footer">
          <p>REST for Profile • GraphQL for Toy Orders • SQL + NoSQL • North Pole © 2024</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Santa's Workshop</h1>
          <p>Welcome, {loggedInElf}</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className="button button-secondary" 
            onClick={() => setIsEditingProfile(true)}
          >
            Edit Profile
          </button>
          <button 
            className={`button button-secondary ${styles.logoutButton}`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="unified-container">
          <ElfProfile 
            elfName={loggedInElf}
            isEditing={isEditingProfile}
            setIsEditing={setIsEditingProfile}
            onProfileUpdate={handleProfileUpdate}
          />
          <ToyKanban elfName={loggedInElf} profileUpdateTrigger={profileUpdateTrigger} />
        </div>
      </main>

      <footer className="app-footer">
        <p>REST for Profile • GraphQL for Toy Orders • SQL + NoSQL • North Pole © 2025</p>
      </footer>
    </div>
  )
}

export default App

