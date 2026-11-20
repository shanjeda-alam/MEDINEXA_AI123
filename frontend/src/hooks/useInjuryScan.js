'use client';

import { useCallback, useState } from 'react';
import { assessmentAPI } from '@/lib/api';

export function useInjuryScan() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitScan = useCallback(async ({ description, image }) => {
    const formData = new FormData();
    formData.append('description', description);
    if (image) formData.append('image', image);

    setLoading(true);
    setError('');
    try {
      const response = await assessmentAPI.create(formData);
      setResult(response.data);
      return response.data;
    } catch (requestError) {
      const message = requestError.response?.data?.detail || 'Could not submit the assessment.';
      setError(message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError('');
  }, []);

  return { result, loading, error, submitScan, reset };
}
