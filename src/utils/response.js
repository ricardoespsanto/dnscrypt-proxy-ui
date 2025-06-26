// Format successful response
export const formatResponse = (data = null, message = null) => {
  const response = {
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