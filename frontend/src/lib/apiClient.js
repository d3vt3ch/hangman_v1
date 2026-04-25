const backendApiBaseUrl = import.meta.env.VITE_BACKEND_API_BASE_URL;

export async function sendApiRequest(apiPath, requestOptions = {}) {
  const accessToken = requestOptions.accessToken;
  const headers = {
    "Content-Type": "application/json",
    ...(requestOptions.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${backendApiBaseUrl}${apiPath}`, {
    method: requestOptions.method || "GET",
    headers,
    body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
  });

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(responseData.detail || responseData.message || "Request failed.");
  }
  return responseData;
}
