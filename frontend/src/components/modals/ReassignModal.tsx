import { useState } from 'react';
import { getInitials } from '../../utils/helpers';
import type { ToyOrder, ElfProfileMinimal } from '../../types';
import styles from './ReassignModal.module.css';

interface ReassignModalProps {
  selectedToy: ToyOrder | null;
  availableElves: string[];
  elfProfiles: Map<string, ElfProfileMinimal>;
  onClose: () => void;
  onReassign: (newElf: string) => Promise<void>;
}

export function ReassignModal({ selectedToy, availableElves, elfProfiles, onClose, onReassign }: ReassignModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReassign = async (newElf: string) => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onReassign(newElf);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reassign toy order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedToy) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${styles.modalContent}`} onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${styles.modalHeader}`}>
          <h3 className={styles.modalTitle}>🎁 Reassign Toy Order</h3>
          <button className="modal-close" onClick={onClose} disabled={isSubmitting}>×</button>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <div>
          <div className={styles.orderInfo}>
            <div className={styles.orderInfoLabel}>
              Select a new elf to work on:
            </div>
            <div className={styles.orderInfoToy}>
              {selectedToy.toy}
            </div>
            <div className={styles.orderInfoChild}>
              for {selectedToy.child_name}
            </div>
          </div>
          
          <div className={styles.elfList}>
            {availableElves.map(elf => {
              const elfProfile = elfProfiles.get(elf);
              const isCurrent = elf === selectedToy.assigned_elf;
              
              return (
                <button
                  key={elf}
                  className={`button ${isCurrent ? 'button-primary' : 'button-secondary'} ${styles.elfButton}`}
                  onClick={() => handleReassign(elf)}
                  disabled={isSubmitting}
                >
                  {elfProfile?.profile_image ? (
                    <img 
                      src={elfProfile.profile_image} 
                      alt={elf} 
                      className={`${styles.avatarImage} ${isCurrent ? styles.current : ''}`}
                    />
                  ) : (
                    <div className={`${styles.avatarInitials} ${isCurrent ? styles.current : ''}`}>
                      {getInitials(elf)}
                    </div>
                  )}
                  <span className={styles.elfName}>
                    {elf}
                  </span>
                  {isCurrent && (
                    <span className={styles.currentBadge}>
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

