import AdminChrome from "./AdminChrome";
import styles from "./admin-layout.module.css";

export const metadata = {
  title: "Admin · UrbanWear",
  description: "Manage UrbanWear catalog.",
};

export default function AdminLayout({ children }) {
  return (
    <AdminChrome>
      {children}
    </AdminChrome>
  );
}
