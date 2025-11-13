export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  category: number; 
//   extra_fields?: ExtraFieldDefinition[];
//   ads?: Advertisement[];
}