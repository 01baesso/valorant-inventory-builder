export async function tryRefresh() {
  try{
    const res = await fetch (`http://localhost:8000/api/refresh/`,{
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      credentials: 'include',
    });

    if (!res.ok) return false;

    const data = await res.json();
    if(data?.access){
      localStorage.setItem('access', data.access);
      return true;
    }
    return false;
  } catch (err){
    return false;
  }
}