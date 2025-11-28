// import React, {useState, useEffect} from 'react';
// import { Navigate, useLocation } from 'react-router-dom';

// async function tryRefresh() {
//   try {
//     const res = await fetch('http://localhost:8000/api/refresh/', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include', 
//     });
//     if (!res.ok) return false;
//     const data = await res.json();
//     if (data.access) {
//       localStorage.setItem('access', data.access);
//       return true;
//     }
//     return false;
//   } catch (err) {
//     return false;
//   }
// }

// export default function ProtectedRoute({ children }) {
//   const [loading, setLoading] = useState(true); 
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const location = useLocation();

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       const access = localStorage.getItem('access');
//       if (access) {
//         if (!mounted) return;
//         setIsAuthenticated(true);
//         setLoading(false);
//         return; 
//       }

//       const ok = await tryRefresh();
//       if (!mounted) return;
//       setIsAuthenticated(!!ok);
//       setLoading(false);
//     })();

//     return () => { mounted = false; };
//   }, []);

//   if (loading) {
//     return <div>Carregando...</div>; 
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/" state={{ from: location }} replace />;
//   }

//   return children;
// }