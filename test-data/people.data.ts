export interface Person {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
}

export const testPerson: Person = {
  firstName: 'Test',
  lastName: 'Portfolio',
};

export const updatedPerson: Partial<Person> = {
  firstName: 'Updated',
  lastName: 'Portfolio',
};
