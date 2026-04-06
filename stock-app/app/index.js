import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { getToken } from "../src/utils/storage";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await getToken();
    setIsLoggedIn(!!token);
    setLoading(false);
  };

  if (loading) return null;

  return <Redirect href={isLoggedIn ? "/dashboard" : "/login"} />;
}