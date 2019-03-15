export interface Beer {
  dataType: string; // Partition key. 'beer' for now, I guess
  name: string; // sort key
  abv?: number;
  ibu?: number;
  description?: string;
  category?: string; // style (Juicy IPA), or descriptor (Hop Forward)
  onTap: number; // GSI sort key; 0==not on tap
}
