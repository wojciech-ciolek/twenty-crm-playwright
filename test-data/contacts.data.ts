export interface Contact {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
}

export const testContact: Contact = {
  firstName: 'John',
  lastName: 'Portfolio',
  email: 'john.portfolio@example.com',
  phone: '+48 123 456 789',
};

export const updatedContact: Partial<Contact> = {
  firstName: 'Jane',
  lastName: 'Portfolio-Updated',
};
