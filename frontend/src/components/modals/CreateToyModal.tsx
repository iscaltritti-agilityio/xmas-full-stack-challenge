import { useState } from 'react';
import { 
  DEFAULT_NICE_LIST_SCORE,
  CHILD_MIN_AGE,
  CHILD_MAX_AGE,
  NICE_LIST_SCORE_MIN,
  NICE_LIST_SCORE_MAX,
  TOY_CATEGORIES
} from '../../constants';
import type { ToyOrderInput } from '../../types';
import styles from './CreateToyModal.module.css';

interface CreateToyModalProps {
  elfName: string;
  availableElves: string[];
  onClose: () => void;
  onSubmit: (input: ToyOrderInput) => Promise<void>;
}

export function CreateToyModal({ elfName, availableElves, onClose, onSubmit }: CreateToyModalProps) {
  const [formData, setFormData] = useState({
    child_name: '',
    age: '',
    location: '',
    toy: '',
    category: '',
    assigned_elf: elfName,
    notes: '',
    nice_list_score: String(DEFAULT_NICE_LIST_SCORE)
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        child_name: formData.child_name,
        age: parseInt(formData.age),
        location: formData.location,
        toy: formData.toy,
        category: formData.category,
        assigned_elf: formData.assigned_elf,
        notes: formData.notes,
        nice_list_score: parseInt(formData.nice_list_score)
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create toy order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Toy Order</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Child Name:</label>
              <input
                type="text"
                className="form-input"
                value={formData.child_name}
                onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Age:</label>
              <input
                type="number"
                className="form-input"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min={CHILD_MIN_AGE}
                max={CHILD_MAX_AGE}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Location:</label>
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nice List Score:</label>
              <input
                type="number"
                className="form-input"
                value={formData.nice_list_score}
                onChange={(e) => setFormData({ ...formData, nice_list_score: e.target.value })}
                min={NICE_LIST_SCORE_MIN}
                max={NICE_LIST_SCORE_MAX}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Toy:</label>
            <input
              type="text"
              className="form-input"
              value={formData.toy}
              onChange={(e) => setFormData({ ...formData, toy: e.target.value })}
              placeholder="e.g., Red Fire Truck"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Category:</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                disabled={isSubmitting}
              >
                <option value="">Select category...</option>
                {TOY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Elf:</label>
              <select
                className="form-input"
                value={formData.assigned_elf}
                onChange={(e) => setFormData({ ...formData, assigned_elf: e.target.value })}
                required
                disabled={isSubmitting}
              >
                {availableElves.map(elf => (
                  <option key={elf} value={elf}>{elf}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes:</label>
            <textarea
              className={`form-input ${styles.textareaField}`}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

