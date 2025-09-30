// Mock firebaseConfig BEFORE importing service
jest.mock('../firebaseConfig', () => ({
    db: {},        // dummy Firestore instance
    storage: {},   // dummy storage instance
}));

// Mock Firestore functions
import { getDocs, collection, query, orderBy, limit, startAfter } from 'firebase/firestore';
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn(),
    getDocs: jest.fn(),
}));

// Mock getFirestoreUser
import { getFirestoreUser } from '../services/userServices';
jest.mock('../services/userServices', () => ({
    getFirestoreUser: jest.fn(),
}));

// Mock compressImage so expo-image-manipulator is never imported
jest.mock('../services/imageServices', () => ({
    compressImage: jest.fn((uri) => uri), // just return the same URI
}));


// import the service AFTER mocks
import { getFirestoreRecipesPaginated, mapAPIRecipe, getAPIRecipes } from '../services/recipeServices';

// Test getFirestoreRecipesPaginated
describe('getFirestoreRecipesPaginated', () => {
    // Mock documents that simulate what firestore would return
    const mockDocs = [
        { id: 'r1', data: () => ({ title: 'Recipe 1', userId: 'u1' }) },
        { id: 'r2', data: () => ({ title: 'Recipe 2', userId: 'u2' }) },
    ];

    // Clear all mock call histories after each test to prevent interference
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test case: returns recipes with user data when firestore succeeds
    it('returns recipes with user data', async () => {
        // Mock firstore getDocs to return our mock docs
        getDocs.mockResolvedValue({ docs: mockDocs });
        // Mock getFirestoreUser to return a fake username and profile picture
        getFirestoreUser.mockImplementation((uid) => ({
            username: `User_${uid}`,
            profilePicture: `pic_${uid}.jpg`,
        }));

        // Call the function under test
        const result = await getFirestoreRecipesPaginated('all', 2);

        // Expect two recipes  to be returned
        expect(result.recipes.length).toBe(2);
        // Expect the first recipe to include user data and source correctly
        expect(result.recipes[0]).toMatchObject({
            id: 'r1',
            title: 'Recipe 1',
            username: 'User_u1',
            profilePicture: 'pic_u1.jpg',
            source: 'firestore',
        });
        // Expect last doc to be the last doc from the query
        expect(result.lastDoc).toBe(mockDocs[mockDocs.length - 1]);
    });

    // Test case: returns empty array if getDocs throws an error
    it('returns empty array if getDocs fails', async () => {
        // Mock getDocs to throw an error
        getDocs.mockRejectedValue(new Error('Firestore error'));
        // Call the function under test
        const result = await getFirestoreRecipesPaginated();
        // Expect the function to gracefully return empty recipes array and null lastDoc
        expect(result).toEqual({ recipes: [], lastDoc: null });
    });
});

// Test mapAPIRecipe
describe('mapAPIRecipe', () => {
    // Test case: maps a MealDB object to the recipe structure used in the app
    it('maps a MealDB object to your recipe structure', () => {
        // Input object simulating a meal returned from TheMealDB API
        const meal = {
            idMeal: '123',
            strMeal: 'Test Meal',
            strMealThumb: 'https://example.com/image.jpg',
            strInstructions: 'Step 1. Do something.',
            strIngredient1: 'Chicken',
            strMeasure1: '200g',
            strIngredient2: 'Salt',
            strMeasure2: '',
            strIngredient3: '',
            strMeasure3: '1 tsp',
        };
        // Call mapAPIRecipe to transform the meal object under test
        const result = mapAPIRecipe(meal);
        // Expect the mapped object to include correct main fields and default values
        expect(result).toMatchObject({
            id: '123',
            title: 'Test Meal',
            image: 'https://example.com/image.jpg',
            likes: 0,
            username: 'TheMealDB',
            profilePicture: 'https://www.themealdb.com/images/logo-small.png',
            source: 'api',
            steps: 'Step 1. Do something.',
        });
        // // Expect ingredients to be correctly mapped, ignoring empty ones
        expect(result.ingredients).toEqual([
            { item: 'Chicken', serving: '200g' },
            { item: 'Salt', serving: '' },
        ]);
    });
    // Test case: handles meals with no ingredients
    it('returns empty ingredients if none are provided', () => {
        const meal = {
            idMeal: '456',
            strMeal: 'Empty Meal',
        };
        // Call mapAPIRecipe under test
        const result = mapAPIRecipe(meal);
        // Expect ingredients array to be empty
        expect(result.ingredients).toEqual([]);
    });
});

// Test getAPIRecipes
describe('getAPIRecipes', () => {
  // Mock the global fetch function
  beforeAll(() => {
    global.fetch = jest.fn();
  });

  // Clear mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case: returns mapped recipes when API returns valid data
  it('returns recipes mapped from API response', async () => {
    // Mock API response for one fetch
    const mockMeal = {
      idMeal: '789',
      strMeal: 'API Meal',
      strMealThumb: 'https://example.com/api.jpg',
      strInstructions: 'Do something',
      strIngredient1: 'Rice',
      strMeasure1: '100g',
    };

    // fetch resolves with a Response-like object with json() method
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ meals: [mockMeal] }),
    });

    // Call getAPIRecipes with count=1
    const result = await getAPIRecipes(1);

    // Expect fetch to have been called once
    expect(fetch).toHaveBeenCalledTimes(1);

    // Expect the result to contain mapped recipe using mapAPIRecipe
    expect(result[0]).toMatchObject({
      id: '789',
      title: 'API Meal',
      image: 'https://example.com/api.jpg',
      username: 'TheMealDB',
      source: 'api',
      steps: 'Do something',
    });

    // Expect ingredients mapped correctly
    expect(result[0].ingredients).toEqual([
      { item: 'Rice', serving: '100g' },
    ]);
  });

  // Test case: returns empty array if fetch throws an error
  it('returns empty array if fetch fails', async () => {
    // Make fetch reject
    fetch.mockRejectedValue(new Error('Network error'));

    const result = await getAPIRecipes(1);

    // Expect function to handle error gracefully
    expect(result).toEqual([]);
  });
});