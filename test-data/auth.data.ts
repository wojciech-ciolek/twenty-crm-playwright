if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
  throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env – see .env.example',
  );
}

export interface UserCredentials {
  email: string;
  password: string;
}

export const validUser: UserCredentials = {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
};

export const invalidUser: UserCredentials = {
  email: 'nonexistent@example.com',
  password: 'SomePassword123!',
};

export const wrongPassword = 'WrongPassword123!';