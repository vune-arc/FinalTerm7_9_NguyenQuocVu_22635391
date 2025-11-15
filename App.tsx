import { useEffect } from "react";
import { initDB } from "./src/database/db";

export default function App() {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <></>
  );
}
