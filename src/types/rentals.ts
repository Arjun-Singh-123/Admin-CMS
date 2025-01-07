export interface Rental {
  id: string;
  members: RentalItem[];
  non_members: RentalItem[];
  created_at: string;
  updated_at: string;
}

export interface RentalItem {
  json: {
    length: string;
    weekday: string;
    weekend: string;
    half_day: string;
    vessel_name: string;
  };
}
