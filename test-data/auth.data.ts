if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
  throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env – see .env.example');
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

export interface InvalidLoginAttempt {
  description: string;
  email: string;
  password: string;
  // 'continueError' – the Continue step rejects the email and shows a status message.
  // 'submitDisabled' – the Sign in button stays disabled because the password is blank/whitespace.
  expectedBehavior: 'continueError' | 'submitDisabled';
  expectedError?: string;
}

export const invalidLoginAttempts: InvalidLoginAttempt[] = [
  {
    description: 'empty email',
    email: '',
    password: 'SomePassword123!',
    expectedBehavior: 'continueError',
    expectedError: 'Email is required',
  },
  {
    description: 'malformed email',
    email: 'not-an-email',
    password: 'SomePassword123!',
    expectedBehavior: 'continueError',
    expectedError: 'An error occurred while checking user existence',
  },
  {
    description: 'empty password',
    email: validUser.email,
    password: '',
    expectedBehavior: 'submitDisabled',
  },
  {
    description: 'password with only spaces',
    email: validUser.email,
    password: '   ',
    expectedBehavior: 'submitDisabled',
  },
];
