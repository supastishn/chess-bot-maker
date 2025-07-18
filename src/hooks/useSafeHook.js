import { useState, useEffect, useCallback } from 'react';

export const useSafeHook = (asyncFunc, dependencies = []) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    try {
      const result = await asyncFunc(...args);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err);
      console.error('Hook error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { execute, data, error, loading };
};

// Example usage:
// const { execute: runBot, loading } = useSafeHook(runBotMatch);
