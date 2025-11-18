import { useState, useEffect } from 'react';
import { getInitials, calculateYearsOfService, formatDate, parseLocalDate } from '../utils/helpers';
import { compressImage } from '../utils/imageCompression';
import { TOY_SPECIALTIES } from '../constants';
import type { ElfProfile } from '../types';
import styles from './ElfProfile.module.css';

interface ElfProfileProps {
  elfName: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onProfileUpdate: () => void;
}

export function ElfProfile({ elfName, isEditing, setIsEditing, onProfileUpdate }: ElfProfileProps) {
  const [profile, setProfile] = useState<ElfProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    specialty: '',
    service_start_date: '',
    profile_image: null as string | null
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/elf/${encodeURIComponent(elfName)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load elf profile');
      }
      
      setProfile(data);
      setFormData({
        specialty: data.specialty,
        service_start_date: data.service_start_date,
        profile_image: data.profile_image
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load elf profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const startDate = parseLocalDate(formData.service_start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      setError('Service start date cannot be in the future');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/elf/${encodeURIComponent(elfName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      setProfile(data);
      setIsEditing(false);
      onProfileUpdate(); // Trigger refresh of avatars in toy orders
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);

    try {
      const compressedBase64 = await compressImage(file);
      setFormData({ ...formData, profile_image: compressedBase64 });
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elfName]);

  return (
    <div>
      {loading && <div className="loading">Loading profile...</div>}
      {error && <div className="error">Error: {error}</div>}

      {profile && !isEditing && (
        <div className={styles.profileContainer}>
          <div>
            {profile.profile_image ? (
              <img src={profile.profile_image} alt={profile.name} className="profile-image" />
            ) : (
              <div className="profile-initials">
                {getInitials(profile.name)}
              </div>
            )}
          </div>
          
          <div className={styles.profileStats}>
            <div>
              <div className={styles.statLabel}>Name</div>
              <div className={styles.statValue}>{profile.name}</div>
            </div>
            <div>
              <div className={styles.statLabel}>Specialty</div>
              <div className={styles.statValue}>{profile.specialty}</div>
            </div>
            <div>
              <div className={styles.statLabel}>Years of Service</div>
              <div 
                className={styles.statValue}
                style={{ cursor: 'help' }}
                title={`Started: ${formatDate(profile.service_start_date)}`}
              >
                {calculateYearsOfService(profile.service_start_date)}
              </div>
            </div>
            <div>
              <div className={styles.statLabel}>Toys Completed</div>
              <div className={styles.statValue}>{profile.toys_completed.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <form onSubmit={updateProfile}>
          <div className={styles.editFormContainer}>
            <div className={styles.imageUploadSection}>
              {formData.profile_image ? (
                <img src={formData.profile_image} alt="Preview" className="profile-image" />
              ) : (
                <div className="profile-initials">
                  {profile ? getInitials(profile.name) : '?'}
                </div>
              )}
              <label className="button button-secondary image-upload-btn">
                Change Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            <div className={styles.formFieldsContainer}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Specialty:</label>
                  <select
                    className="form-input"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    required
                  >
                    <option value="">Select specialty...</option>
                    {TOY_SPECIALTIES.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Start Date:</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={formData.service_start_date}
                    onChange={(e) => setFormData({ ...formData, service_start_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className="button button-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
                <button 
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                    if (profile) {
                      setFormData({
                        specialty: profile.specialty,
                        service_start_date: profile.service_start_date,
                        profile_image: profile.profile_image
                      });
                    }
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

