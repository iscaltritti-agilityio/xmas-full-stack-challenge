export interface ToyOrder {
  id: string;
  child_name: string;
  age: number;
  location: string;
  toy: string;
  category: string;
  assigned_elf: string;
  status: string;
  due_date: string;
  notes: string;
  nice_list_score: number;
}

export interface ToyOrderInput {
  child_name: string;
  age: number;
  location: string;
  toy: string;
  category: string;
  assigned_elf: string;
  notes: string;
  nice_list_score: number;
}

export interface ElfProfile {
  id: number;
  name: string;
  specialty: string;
  service_start_date: string;
  toys_completed: number;
  profile_image: string | null;
  created_at: string;
}

export interface ElfProfileMinimal {
  profile_image?: string | null;
}

