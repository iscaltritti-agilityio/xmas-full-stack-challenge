import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { getInitials } from '../utils/helpers';
import { getScoreColor, getScoreLabel, getStatusEmoji } from '../utils/toyOrderHelpers';
import { POLL_INTERVAL_MS, TOY_ORDER_STATUSES } from '../constants';
import { CreateToyModal } from './modals/CreateToyModal';
import { ReassignModal } from './modals/ReassignModal';
import type { ToyOrder, ElfProfileMinimal } from '../types';
import styles from './ToyKanban.module.css';

const GET_TOY_ORDERS = gql`
  query GetToyOrders($filter: ToyOrderFilter) {
    toyOrders(filter: $filter) {
      id
      child_name
      age
      location
      toy
      category
      assigned_elf
      status
      due_date
      notes
      nice_list_score
    }
  }
`;

const UPDATE_TOY_ORDER_STATUS = gql`
  mutation UpdateToyOrderStatus($id: ID!, $status: String!) {
    updateToyOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const UPDATE_TOY_ORDER_ELF = gql`
  mutation UpdateToyOrderElf($id: ID!, $assigned_elf: String!) {
    updateToyOrderElf(id: $id, assigned_elf: $assigned_elf) {
      id
      assigned_elf
    }
  }
`;

const ADD_TOY_ORDER = gql`
  mutation AddToyOrder($input: ToyOrderInput!) {
    addToyOrder(input: $input) {
      id
      child_name
      age
      location
      toy
      category
      assigned_elf
      status
      due_date
      notes
      nice_list_score
    }
  }
`;

interface ToyKanbanProps {
  elfName: string;
  profileUpdateTrigger: number;
}

export function ToyKanban({ elfName, profileUpdateTrigger }: ToyKanbanProps) {
  const [showAllToys, setShowAllToys] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedToy, setSelectedToy] = useState<ToyOrder | null>(null);
  const [availableElves, setAvailableElves] = useState<string[]>([]);
  const [elfProfiles, setElfProfiles] = useState<Map<string, ElfProfileMinimal>>(new Map());
  const [actionError, setActionError] = useState<string | null>(null);

  const { loading, error, data } = useQuery(GET_TOY_ORDERS, {
    variables: { 
      filter: showAllToys ? {} : { assigned_elf: elfName }
    },
    pollInterval: POLL_INTERVAL_MS,
  });

  const [updateToyOrderStatus] = useMutation(UPDATE_TOY_ORDER_STATUS, {
    refetchQueries: [{ 
      query: GET_TOY_ORDERS, 
      variables: { filter: showAllToys ? {} : { assigned_elf: elfName } }
    }]
  });

  const [updateToyOrderElf] = useMutation(UPDATE_TOY_ORDER_ELF, {
    refetchQueries: [{ 
      query: GET_TOY_ORDERS, 
      variables: { filter: showAllToys ? {} : { assigned_elf: elfName } }
    }]
  });

  const [addToyOrder] = useMutation(ADD_TOY_ORDER, {
    refetchQueries: [{ 
      query: GET_TOY_ORDERS, 
      variables: { filter: showAllToys ? {} : { assigned_elf: elfName } }
    }]
  });

  useEffect(() => {
    const fetchElves = async () => {
      try {
        const response = await fetch('/api/elves');
        if (!response.ok) {
          throw new Error('Failed to fetch elf list');
        }
        const data: { name: string }[] = await response.json();
        setAvailableElves(data.map(elf => elf.name));
        
        const profilesMap = new Map<string, { profile_image?: string | null }>();
        await Promise.all(
          data.map(async (elf) => {
            try {
              const profileResponse = await fetch(`/api/elf/${encodeURIComponent(elf.name)}`);
              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                profilesMap.set(elf.name, profileData);
              }
            } catch (error) {
              console.warn(`Failed to fetch profile for ${elf.name}:`, error);
            }
          })
        );
        setElfProfiles(profilesMap);
      } catch (error) {
        console.error('Failed to fetch elves:', error);
        setActionError('Failed to load elf list. Some features may be unavailable.');
      }
    };
    fetchElves();
  }, [profileUpdateTrigger]);

  const handleStatusChange = async (toyId: string, newStatus: string) => {
    await updateToyOrderStatus({ 
      variables: { id: toyId, status: newStatus } 
    });
  };

  const handleDragStart = (e: React.DragEvent, toyId: string) => {
    setDraggedItem(toyId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedItem) {
      await handleStatusChange(draggedItem, newStatus);
    }
    
    setDraggedItem(null);
  };

  const handleReassign = async (newElf: string) => {
    if (!selectedToy) return;
    
    setActionError(null);
    try {
      await updateToyOrderElf({
        variables: { id: selectedToy.id, assigned_elf: newElf }
      });
      setShowReassignModal(false);
      setSelectedToy(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to reassign toy order');
      throw err;
    }
  };

  const getOrdersByStatus = (status: string): ToyOrder[] => {
    if (!data?.toyOrders) return [];
    return data.toyOrders
      .filter((order: ToyOrder) => order.status === status)
      .sort((a: ToyOrder, b: ToyOrder) => b.nice_list_score - a.nice_list_score);
  };

  const handleAddToyOrder = async (input: {
    child_name: string;
    age: number;
    location: string;
    toy: string;
    category: string;
    assigned_elf: string;
    notes: string;
    nice_list_score: number;
  }) => {
    setActionError(null);
    await addToyOrder({ variables: { input } });
  };

  return (
    <div>
      <div className="component-header">
        <h2 className="component-title">Toy Production Kanban</h2>
        <div className={styles.headerControls}>
          <button
            className="button button-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + New Order
          </button>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showAllToys}
              onChange={(e) => setShowAllToys(e.target.checked)}
            />
            <span>Show All Orders</span>
          </label>
        </div>
      </div>

      {loading && <div className="loading">Loading toy orders...</div>}
      {error && <div className="error">Error: {error.message}</div>}
      {actionError && <div className="error">{actionError}</div>}

      {data && (
        <div className="kanban-board">
          {TOY_ORDER_STATUSES.map(status => (
            <div 
              key={status} 
              className={`kanban-column ${dragOverColumn === status ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="kanban-column-header">
                <span>{getStatusEmoji(status)} {status}</span>
                <span className={styles.columnCountBadge}>
                  {getOrdersByStatus(status).length}
                </span>
              </div>

              {getOrdersByStatus(status).map((order: ToyOrder) => {
                const elfProfile = elfProfiles.get(order.assigned_elf);
                return (
                  <div 
                    key={order.id} 
                    className={`kanban-card ${draggedItem === order.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardToyInfo}>
                        <div className={styles.cardToyTitle}>
                          {order.toy}
                        </div>
                        <div className={styles.cardToyCategory}>
                          {order.category}
                        </div>
                      </div>

                      <div 
                        className={`elf-avatar-container ${styles.avatarContainer}`}
                        title={order.assigned_elf}
                        onClick={() => {
                          setSelectedToy(order);
                          setShowReassignModal(true);
                        }}
                      >
                        {elfProfile?.profile_image ? (
                          <img 
                            src={elfProfile.profile_image} 
                            alt={order.assigned_elf} 
                            className={styles.avatarImage}
                          />
                        ) : (
                          <div className={styles.avatarInitials}>
                            {getInitials(order.assigned_elf)}
                          </div>
                        )}
                        <div className="reassign-overlay">
                          <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M17 2l4 4-4 4" />
                            <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                            <path d="M7 22l-4-4 4-4" />
                            <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardDetails}>
                      <div className={styles.cardChildInfo}>
                        <div className={styles.cardChildName}>
                          {order.child_name}, {order.age}
                        </div>
                        <div className={styles.cardLocation}>
                          <span>📍</span>
                          <span>{order.location}</span>
                        </div>
                      </div>

                      <div 
                        className={styles.scoreBadge}
                        style={{ background: getScoreColor(order.nice_list_score) }}
                      >
                        <span>{order.nice_list_score}</span>
                        <span className={styles.scoreLabel}>• {getScoreLabel(order.nice_list_score)}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className={styles.cardNotes}>
                        {order.notes}
                      </div>
                    )}
                  </div>
                );
              })}

              {getOrdersByStatus(status).length === 0 && (
                <div className={styles.emptyColumn}>
                  No toys in this stage
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateToyModal
          elfName={elfName}
          availableElves={availableElves}
          onClose={() => {
            setShowCreateModal(false);
            setActionError(null);
          }}
          onSubmit={handleAddToyOrder}
        />
      )}
      
      {showReassignModal && (
        <ReassignModal
          selectedToy={selectedToy}
          availableElves={availableElves}
          elfProfiles={elfProfiles}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedToy(null);
            setActionError(null);
          }}
          onReassign={handleReassign}
        />
      )}
    </div>
  );
}

