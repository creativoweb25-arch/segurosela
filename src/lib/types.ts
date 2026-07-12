// Tipos compartidos para Seguros ELA

export type SiteSettings = {
  id: string;
  brandName: string;
  tagline: string;
  logoUrl: string | null;
  logoText: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkColor: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  address: string;
  schedule: string;
  instagramUser: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  yearsExperience: number;
  aboutText: string;
  aboutImageUrl: string | null;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  description: string;
  features?: string | null;
  icon: string;
  imageUrl: string | null;
  order: number;
  active: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  imageUrl: string | null;
  email: string | null;
  phone: string | null;
  order: number;
  active: boolean;
};

export type Partner = {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
  active: boolean;
};

export type CommercialAlly = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string;
  description: string | null;
  order: number;
  active: boolean;
};

export type HealthFair = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  endDate: string | null;
  location: string;
  state: string;
  address: string | null;
  time: string | null;
  imageUrl: string | null;
  order: number;
  active: boolean;
};

export type Slide = {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  order: number;
  active: boolean;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  category: string;
  author: string;
  views: number;
  published: boolean;
  featured: boolean;
  createdAt: string;
};

export type InstagramPost = {
  id: string;
  instagramId: string | null;
  permalink: string;
  imageUrl: string;
  caption: string | null;
  likes: number;
  comments: number;
  postedAt: string | null;
  order: number;
  active: boolean;
};

export type QuoteRequest = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  insuranceType: string;
  protectionLevel?: string | null;
  message?: string | null;
  consent: boolean;
};

export type ContactMessage = {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  consent: boolean;
};
