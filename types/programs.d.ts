export type ProgramObj = {
  title: string;
  slug: string;
  short?: string;
  description?: string;
  images?: string[];
  donation_target?: number;
  categoryTitle?: string;
};

export type Category = {
  key: string;
  title: string;
  description?: string;
  programs: (ProgramObj | string)[];
};

export type ProgramsFile = {
  categories: Category[];
};
