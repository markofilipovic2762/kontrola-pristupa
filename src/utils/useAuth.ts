import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken/kontrolapristupa");
      if (!token) {
        console.log("Ovde nisam procitao token, u useAuth hook")
        navigate("/login");
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          console.log("Istekao je token")
          localStorage.removeItem("accessToken/kontrolapristupa");
          navigate("/login");
          window.location.reload();
        } else {
          console.log("Prosao je")
        }
      } catch (error) {
        alert("Nema tokena");
        console.error(error)
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);
};

export default useAuth;
