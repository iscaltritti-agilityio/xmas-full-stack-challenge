import { useState, useEffect, useRef } from 'react';
import { DEFAULT_SPECIALTY } from '../constants';
import { getLocalDateString } from '../utils/helpers';
import styles from './ElfLogin.module.css';

interface ElfLoginProps {
  onLogin: (elfName: string) => void;
}

interface ElfName {
  name: string;
  profile_image?: string | null;
}

export function ElfLogin({ onLogin }: ElfLoginProps) {
  const [elfNames, setElfNames] = useState<ElfName[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchElfNames();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchElfNames = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/elves');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load elf names');
      }
      
      setElfNames(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load elf names');
    } finally {
      setLoading(false);
    }
  };

  const createNewElf = async (name: string) => {
    setCreating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/elf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          specialty: DEFAULT_SPECIALTY,
          service_start_date: getLocalDateString()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create elf');
      }

      await fetchElfNames();
      onLogin(name);
    } catch (err: any) {
      setError(err.message || 'Failed to create elf');
    } finally {
      setCreating(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    const existingElf = elfNames.find(
      elf => elf.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (existingElf) {
      onLogin(existingElf.name);
    } else {
      await createNewElf(inputValue.trim());
    }
  };

  const filteredElves = elfNames.filter(elf =>
    elf.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const isNewElf = inputValue.trim() && !elfNames.some(
    elf => elf.name.toLowerCase() === inputValue.trim().toLowerCase()
  );

  const handleElfSelect = (elfName: string) => {
    setInputValue(elfName);
    setShowDropdown(false);
  };

  const displayedElves = inputValue ? filteredElves : elfNames;

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🎄 Who are you?</h2>
        <p className={styles.subtitle}>Tell us your name to join the workshop...</p>

        {error && <div className="error">Error: {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <div className="combobox-container">
              <input
                ref={inputRef}
                type="text"
                className="combobox-input"
                placeholder="Type or select your name..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                disabled={loading || creating}
                autoComplete="off"
              />
              
              {showDropdown && !loading && (
                <div ref={dropdownRef} className="combobox-dropdown">
                  {displayedElves.length > 0 && displayedElves.map(elf => (
                    <div
                      key={elf.name}
                      className="combobox-option"
                      onClick={() => handleElfSelect(elf.name)}
                    >
                      {elf.profile_image && (
                        <img 
                          src={elf.profile_image} 
                          alt={elf.name}
                          className={styles.elfAvatar}
                        />
                      )}
                      <span>{elf.name}</span>
                    </div>
                  ))}
                  
                  {inputValue && isNewElf && (
                    <div
                      className="combobox-option create-new"
                      onClick={() => {
                        setShowDropdown(false);
                        createNewElf(inputValue.trim());
                      }}
                    >
                      + Create new elf: "{inputValue.trim()}"
                    </div>
                  )}
                  
                  {inputValue && displayedElves.length === 0 && !isNewElf && (
                    <div className={styles.emptyState}>
                      No matching elves found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className={`button button-primary ${styles.submitButton}`}
            disabled={!inputValue.trim() || loading || creating}
          >
            {creating ? 'Creating...' : loading ? 'Loading...' : 'Enter Workshop'}
          </button>
        </form>

        {!inputValue && !loading && (
          <div className={styles.tipBox}>
            💡 Tip: Start typing to find yourself, or enter a new name to join the team!
          </div>
        )}
      </div>
    </div>
  );
}

