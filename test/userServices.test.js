// Import function to test
import { getFirestoreUser } from '../services/userServices';

// Mock the firebaseConfig module entirely
jest.mock('../firebaseConfig', () => ({
  db: {}, // just a dummy object, we don't need a real db
}));

// Mock the Firestore functions
import { getDoc, doc } from 'firebase/firestore';
jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

describe('getFirestoreUser', () => {
  const uid = '123';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns user data if document exists', async () => {
    const mockData = { name: 'Alice', email: 'alice@example.com' };
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockData });

    const result = await getFirestoreUser(uid);

    expect(doc).toHaveBeenCalledWith({}, 'users', uid); // db is mocked as {}
    expect(result).toEqual(mockData);
  });

  it('returns null if document does not exist', async () => {
    getDoc.mockResolvedValue({ exists: () => false });

    const result = await getFirestoreUser(uid);

    expect(result).toBeNull();
  });

  it('returns null if getDoc throws an error', async () => {
    getDoc.mockRejectedValue(new Error('Firestore error'));

    const result = await getFirestoreUser(uid);

    expect(result).toBeNull();
  });
});
