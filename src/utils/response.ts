// Format successful response
export const formatResponse = (data: any = null, message: string | null = null): object => {
  const response: { success: boolean; timestamp: string; data?: any; message?: string } = {
    success: true,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (message !== null) {
    response.message = message;
  }

  return response;
}; 