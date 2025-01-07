export interface ContactInfo {
  email: string;
  phone: string;
  hours: string;
  address: string;
}

export interface SocialLink {
  icon: string;
  href: string;
  label: string;
}

export interface Route {
  name: string;
  href: string;
}

export interface CMSData {
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
  routes: Route[];
}
