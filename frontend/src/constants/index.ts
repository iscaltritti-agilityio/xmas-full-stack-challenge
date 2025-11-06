export const POLL_INTERVAL_MS = 3000;
export const DEFAULT_NICE_LIST_SCORE = 85;
export const CHILD_MIN_AGE = 1;
export const CHILD_MAX_AGE = 18;
export const NICE_LIST_SCORE_MIN = 0;
export const NICE_LIST_SCORE_MAX = 100;
export const AVATAR_SIZE_PX = 48;

export const PROFILE_IMAGE_MAX_WIDTH = 400;
export const PROFILE_IMAGE_MAX_HEIGHT = 400;
export const PROFILE_IMAGE_QUALITY = 0.85;

export const TOY_ORDER_STATUSES = ['To Do', 'In Progress', 'Quality Check', 'Ready to Deliver'] as const;

export const TOY_CATEGORIES = [
  'Wooden Trains',
  'Teddy Bears',
  'Video Games',
  'Puzzles',
  'Action Figures',
  'Board Games',
  'Dolls',
  'Arts & Crafts',
  'Electronics',
  'Books',
  'Sports Equipment'
] as const;

export const TOY_SPECIALTIES = TOY_CATEGORIES;

export const DEFAULT_SPECIALTY = 'General';

