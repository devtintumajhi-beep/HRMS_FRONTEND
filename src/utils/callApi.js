export async function callApi(requestFn) {
  try {
    const res = await requestFn();
    return { ok: true, status: res.status, data: res.data };
  } catch (err) {
    return {
      ok: false,
      status: err.response?.status,
      data: err.response?.data ?? { message: err.message },
    };
  }
}