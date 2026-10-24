import { useEffect, useState } from 'react';

// ==========================================
// BACKEND API SERVICE
// This file contains all the tools our frontend uses to talk to the Node.js backend.
// ==========================================

// This is the URL of our backend server. (Defaults to localhost:4000)
const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

// A master list of all the exact Action Names our backend understands
export const LOGIN = 'LOGIN';
export const REGISTER = 'REGISTER';
export const PRODUCTS = 'PRODUCTS';
export const PRODUCT = 'PRODUCT';
export const INVENTORY = 'INVENTORY';
export const LOW_STOCK = 'LOW_STOCK';
export const MY_REQUESTS = 'MY_REQUESTS';
export const ALL_REQUESTS = 'ALL_REQUESTS';
export const USERS = 'USERS';
export const USER_STATS = 'USER_STATS';
export const ADMIN_STATS = 'ADMIN_STATS';
export const TRANSACTIONS = 'TRANSACTIONS';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const STOCK_IN = 'STOCK_IN';
export const STOCK_OUT = 'STOCK_OUT';
export const CREATE_REQUEST = 'CREATE_REQUEST';
export const APPROVE_REQUEST = 'APPROVE_REQUEST';
export const REJECT_REQUEST = 'REJECT_REQUEST';
export const UPDATE_PROFILE = 'UPDATE_PROFILE';
export const UPDATE_ROLE = 'UPDATE_ROLE';
export const SET_ACTIVE = 'SET_ACTIVE';

// ----------------------------------------------------
// THE MAIN FETCH FUNCTION
// This function sends requests across the internet to the backend
// ----------------------------------------------------
export async function runAction(operationName, variables = {}) {
  // 1. Try to get the user's login token
  const token = localStorage.getItem('wms_token') || sessionStorage.getItem('wms_token');
  
  // 2. Prepare the settings for our network request
  const requestHeaders = {
    'Content-Type': 'application/json'
  };
  
  // If we have a token, attach it so the backend knows who we are!
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  // 3. Actually send the request to the server
  const response = await fetch(`${SERVER}/action`, {
    method: 'POST',
    headers: requestHeaders,
    // Turn our JavaScript object into text so it can travel across the internet
    body: JSON.stringify({ 
      op: operationName, 
      variables: variables 
    })
  });
  
  // 4. Wait for the server's reply and turn it back into a JavaScript object
  let body = {};
  try {
    body = await response.json();
  } catch (error) {
    // If the server didn't send valid JSON (maybe it crashed)
    body = {};
  }
  
  // 5. If the request failed, throw an error so our app can show a warning message
  if (!response.ok || !body.ok) {
    if (body.error && (body.error.includes('Authentication required') || body.error.includes('jwt') || body.error.includes('token'))) {
      localStorage.removeItem('wms_token');
      localStorage.removeItem('wms_user');
      sessionStorage.removeItem('wms_token');
    }
    throw new Error(body.error || 'Operation failed.');
  }
  
  // 6. Return the good data!
  return body.data || {};
}

// ----------------------------------------------------
// CUSTOM HOOK: useQuery
// Use this hook when you want to READ/FETCH data from the backend.
// It automatically handles Loading states and Error messages for you!
// ----------------------------------------------------
export function useQuery(operationName, options = {}) {
  const variables = options.variables || {};
  
  // We keep track of 3 important states:
  const [data, setData] = useState(null);      // The actual data we get back
  const [loading, setLoading] = useState(true); // Is it currently fetching?
  const [error, setError] = useState(null);    // Did something go wrong?
  
  // This 'version' trick lets us manually force the data to reload
  const [version, setVersion] = useState(0);
  const refetch = () => {
    setVersion(currentVersion => currentVersion + 1);
  };
  
  // The useEffect runs automatically when the component appears on the screen
  useEffect(() => {
    let componentIsStillOnScreen = true;
    
    // A helper function to do the actual loading
    const loadData = async () => {
      setLoading(true); 
      setError(null);
      
      try { 
        // Go ask the backend for the data
        const result = await runAction(operationName, variables); 
        
        // Only update the state if the user hasn't already left the page
        if (componentIsStillOnScreen) {
          setData(result); 
        }
      } catch (error) { 
        if (componentIsStillOnScreen) {
          setError(error); 
        }
      } finally { 
        if (componentIsStillOnScreen) {
          setLoading(false); 
        }
      }
    };
    
    // Start loading right away!
    loadData();
    
    // If options.pollInterval is set, it will automatically refresh the data every X milliseconds
    let interval = null;
    if (options.pollInterval) {
      interval = setInterval(loadData, options.pollInterval);
    }
    
    // Cleanup function: runs when the user leaves the page
    return () => { 
      componentIsStillOnScreen = false; 
      if (interval) {
        clearInterval(interval); 
      }
    };
    
    // This tells React to re-run the effect if any of these variables change
  }, [operationName, JSON.stringify(variables), version, options.pollInterval]);
  
  return { data, loading, error, refetch };
}

// ----------------------------------------------------
// CUSTOM HOOK: useMutation
// Use this hook when you want to WRITE/CHANGE data (like creating or deleting something).
// It gives you a function you can call when a user clicks a "Submit" button.
// ----------------------------------------------------
export function useMutation(operationName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // This is the function you get back and call later (e.g. mutate({ variables: {...} }))
  const mutate = async (options = {}) => {
    const variables = options.variables || {};
    
    setLoading(true); 
    setError(null);
    
    try { 
      // Send the request to the backend
      const result = await runAction(operationName, variables); 
      setData(result); 
      return { data: result }; 
      
    } catch (error) { 
      setError(error); 
      throw error; // Throw the error so the component can handle it (like showing a Toast)
      
    } finally { 
      setLoading(false); 
    }
  };
  
  // Return an array with the function first, and the status object second
  return [mutate, { loading, error, data }];
}

// Dedicated PATCH API used by the live-change exam update operation.
export async function updateProductAPI(id, productData) {
  const token =
    localStorage.getItem('wms_token') ||
    sessionStorage.getItem('wms_token');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${SERVER}/api/products/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(productData)
  });

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok || !body.ok) {
    throw new Error(body.error || 'Product update failed.');
  }

  return body;
}
